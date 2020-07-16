pragma solidity 0.5.15;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./MetaMarketplaceDomain_v0.sol";
import "./BytesUtil_v0.sol";
import "./IRefractWallet_v0.sol";
import "./IT721Controller_v0.sol";


contract MetaMarketplace_v0 is MetaMarketplaceDomain_v0 {

    event SealedOffer(
        address indexed buyer,
        address indexed seller,
        uint256 indexed ticket,
        uint256 nonce,
        bytes prices
    );

    IERC721 public t721;
    IT721Controller_v0 public t721c;

    mapping (uint256 => uint256) public ticket_nonces;

    constructor(uint256 _chainId, address _t721, address _t721c)
    MetaMarketplaceDomain_v0("MetaMarketplace", "0", _chainId) public {
        t721 = IERC721(_t721);
        t721c = IT721Controller_v0(_t721c);
    }

    /**  @notice Recover the current ticket nonce
     *
     *  @param ticket Get the nonce of provided ticket ID
     */
    function getNonce(uint256 ticket) external view returns (uint256 nonce) {
        return ticket_nonces[ticket];
    }

    function executePayment(
        uint256 amount,
        uint256 fee,
        address currency,
        address seller,
        address buyer,
        address fee_collector
    ) internal {

        IERC20(currency).transferFrom(buyer, seller, amount);
        if (fee > 0) {
            IERC20(currency).transferFrom(buyer, fee_collector, fee);
        }

    }

    function executeTransfer(address seller, address buyer, uint256 ticket_id) internal {

        IERC721(t721).transferFrom(seller, buyer, ticket_id);

    }

    function isContract(address _addr) internal view returns (bool){
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }

    /**
     * @notice seal an exchange between two users and triggers the payment.
     *
     * @param id This is the identifier of the event. When combining event controller address and this is, we get a
     *           unique identifier used to regroup the tickets.
     *
     * @param uints This parameter contains all the uin256 arguments required to pay and exchange ticket
     *
     *                            +> These are the arguments used for the payment logics
     *        | currency_count    | < This is the number of currency to use for the payment (in our example: 2)
     *        | currency_1_price  | < For each currency, the price paid to the organizer
     *        | currency_1_fee    | < For each currency, the extra fee for T721
     *        | currency_2_price  |
     *        | currency_2_fee    |
     *
     *                            +> These are the arguments used for the exchange process
     *        | ticket_id         | < This is the ID of the ticket sold
     *        | nonce             | < This is the exchange nonce
     *        | expiration        | < This is the authorization expiration
     *
     * @param addr This parameter contains all the address arguments required to pay and exchange ticket
     *
     *                            +> These are the arguments used for the payment logics
     *        | buyer             | < The address of buyer
     *        | seller            | < The address of seller
     *        | event_controller  | < The address of event_controller
     *        | fee_collector     | < The address of fee_collector
     *        | currency_1        | < The address of each currency
     *        | currency_2        |
     *
     *                            +> There are no address arguments for the exchange process
     *        |                   |
     *
     * @param bs This parameter contains bytes used to pay and mint the tickets. The notation argument[23] means it's
     *           a 23 bytes segment.
     *
     *                            +> There are no bytes arguments for the payment process
     *        |                   |
     *
     *                            +> These are the arguments used for the minting process
     *        | buyer_sig[65]     | < Buyer signature
     *        | seller_sig[65]    | < Seller signature
     *        | evemt_sig[65]     | < Event authorization signature
     *
     *
     */
    function sealSale(string memory id, uint256[] memory uints, address[] memory addr, bytes memory bs) public {

        uint256 uints_idx = 1;
        uint256 addr_idx = 4;
        bytes memory prices = "";
        require(addr.length >= 4, "MM::sealSale | missing addr[0-3] (actors addresses)");
        address payable buyer = address(uint160(addr[0]));
        address payable seller = address(uint160(addr[1]));
        address event_controller = addr[2];
        address fee_collector = addr[3];

        // Payment Processing Scope
        {

            // We verify that the bare minimum arguments are here before accessing them
            require(uints.length > 0, "MM::sealSale | missing uints[0] (currency number)");

            uint256 currency_number = uints[0];

            if (currency_number > 0) {

                // Now that we know the number of currencies used for payment, we can verify that the required amount
                // of arguments in uints and addr are respected
                require(uints.length - uints_idx >= (currency_number * 2),
                    "MM::sealSale | not enough space on uints (1)");
                require(addr.length - addr_idx >= currency_number, "MM::sealSale | not enough space on addr (1)");

                for (uint256 currency_idx = 0; currency_idx < currency_number; ++currency_idx) {

                    prices = BytesUtil_v0.concat(prices, abi.encode(uints[uints_idx + (currency_idx * 2)]));
                    prices = BytesUtil_v0.concat(prices, abi.encode(uints[uints_idx + 1 + (currency_idx * 2)]));
                    prices = BytesUtil_v0.concat(prices, abi.encode(addr[addr_idx + currency_idx]));

                    executePayment(
                        uints[uints_idx + (currency_idx * 2)],
                        uints[uints_idx + 1 + (currency_idx * 2)],
                        addr[addr_idx + currency_idx],
                        seller,
                        buyer,
                        fee_collector
                    );

                }

                uints_idx += currency_number * 2;
                addr_idx += currency_number;

            }

        }

        require(uints.length - uints_idx == 3, "MM::sealSale | not enough space on uints (2)");

        uint256 ticket_id = uints[uints_idx];
        uint256 nonce = uints[uints_idx + 1];

        executeTransfer(seller, buyer, ticket_id);
        emit SealedOffer(buyer, seller, ticket_id, nonce, prices);

        // Verify all authorizations
        {
            uint256 expiration = uints[uints_idx + 2];
            require(block.timestamp <= expiration, "MM::sealSale | authorization expired");

            bytes32 hash = keccak256(
                abi.encode(
                    "sealSale",
                    prices,
                    buyer,
                    seller,
                    event_controller,
                    ticket_id,
                    nonce,
                    expiration
                )
            );

            require(bs.length == 65 * 3, "MM::sealSale | not enought space on bs (1)");

            {
                address signer = verify(Authorization(buyer, address(this), hash), BytesUtil_v0.slice(bs, 0, 65));
                require(signer == buyer
                || (isContract(buyer) && IRefractWallet_v0(buyer).isController(signer)),
                    "MM::sealSale | invalid buyer signature");

            }
            {
                address signer = verify(Authorization(seller, address(this), hash), BytesUtil_v0.slice(bs, 65, 65));
                require(signer == seller
                || (isContract(seller) && IRefractWallet_v0(seller).isController(signer)),
                    "MM::sealSale | invalid seller signature");

            }
            {

                address signer = verify(
                    Authorization(event_controller, address(this), hash), BytesUtil_v0.slice(bs, 130, 65)
                );
                require(signer == event_controller, "MM::sealSale | invalid event_controller signature");

            }

        }

        // Verify event controller validity
        {
            require(t721c.hasAuthorityUpon(event_controller, id, ticket_id),
                "MM::sealSale | event controller has no authority upon provided ticket");
            require(ticket_nonces[ticket_id] == nonce, "MM::sealSale | invalid nonce");

            ++ticket_nonces[ticket_id];
        }


    }

}
