pragma solidity 0.5.15;

import "./ITicketForge_v0.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./T721ControllerDomain_v0.sol";
import "./BytesUtil_v0.sol";

// @notice the T721Controller handles all the ticket minting and attachments
contract T721Controller_v0 is T721ControllerDomain_v0 {

    using SafeMath for uint256;

    event Mint(
        bytes32 indexed group,
        bytes32 indexed category,
        address indexed owner,
        uint256 ticket_id,
        address buyer,
        uint256 code
    );

    event Attach(
        bytes32 indexed group,
        bytes32 indexed attachment,
        uint256 indexed ticket_id,
        uint256 amount,
        uint256 code
    );

    event Withdraw(
        address indexed trigger,
        address indexed target,
        address indexed currency,
        uint256 amount,
        uint256 code
    );

    struct Currency {
        bool active;
        uint256 fix;
        uint256 variable;
    }

    struct Affiliation {
        bool active;
        bytes32 group;
        bytes32 category;
    }

    mapping (bytes32 => mapping (address => uint256)) balances;

    ITicketForge_v0                     public t721;
    mapping (address => uint)           public group_nonce;
    mapping (uint256 => Affiliation)    public tickets;
    mapping (address => mapping (uint256 => bool))           public authorization_code_registry;

    constructor(address _t721, uint256 _chain_id)
    T721ControllerDomain_v0("T721 Controller", "0", _chain_id)
    public {
        t721 = ITicketForge_v0(_t721);
    }

    /**
     * @notice Retrieve the current balance for a group
     *
     * @param group ID of the group
     *
     * @param currency Currency balance to inspect
     */
    function balanceOf(bytes32 group, address currency) public view returns (uint256) {
        return balances[group][currency];
    }

    /**
     * @notice Get identifier for the combo controller + id
     *
     * @param _owner The address of the controller
     *
     * @param id The id of the event
     */
    function getGroupID(address _owner, string memory id) public pure returns (bytes32) {
        return keccak256(abi.encode(
                _owner,
                id
            ));
    }

    /**
     * @notice Withdraw event funds
     *
     * @param event_controller The address controlling the event
     *
     * @param id The event identifier
     *
     * @param currency The currency to withdraw
     *
     * @param amount The amount to withdraw
     *
     * @param target The recipient of the withdraw
     *
     * @param code The authorization code
     *
     * @param expiration Expiration timestamp of the authorization
     *
     * @param signature The signature to use to withdraw
     */
    function withdraw(
        address event_controller,
        string calldata id,
        address currency,
        uint256 amount,
        address target,
        uint256 code,
        uint256 expiration,
        bytes calldata signature
    ) external {

        bytes32 group = getGroupID(event_controller, id);

        bytes32 hash = keccak256(
            abi.encode(
                "withdraw",
                group,
                currency,
                amount,
                target,
                code,
                expiration
            )
        );

        require(block.timestamp <= expiration, "T721::withdraw | authorization expired");
        require(verify(Authorization(event_controller, target, hash), signature) == event_controller,
            "T721C::withdraw | invalid signature");
        require(balances[group][currency] >= amount, "T721C::withdraw | balance too low");
        consumeCode(event_controller, code);

        IERC20(currency).transfer(target, amount);

        balances[group][currency] = balances[group][currency].sub(amount);

        emit Withdraw(msg.sender, target, currency, amount, code);
    }

    /**
     * @notice Utility to recover group and category for a ticket id
     *
     * @param ticket_id The unique ticket id
     */
    function getTicketAffiliation(
        uint256 ticket_id
    ) external view returns (bool active, bytes32 group, bytes32 category) {
        return (tickets[ticket_id].active, tickets[ticket_id].group, tickets[ticket_id].category);
    }

    /**
     * @notice Helper used to verify if a unique consummable ID is available
     *
     * @param _owner The ticket issuer address
     *
     * @param code The code to consume
     */
    function consumeCode(address _owner, uint256 code) internal {
        require(authorization_code_registry[_owner][code] == false, "T721C::consumeCode | code already used");

        authorization_code_registry[_owner][code] = true;
    }

    /**
     * @notice Helper used to verify if a unique consummable ID is available
     *
     * @param _owner The ticket issuer address
     *
     * @param code The code to verify
     */
    function isCodeConsummable(address _owner, uint256 code) public view returns (bool) {
        return !authorization_code_registry[_owner][code];
    }

    function executePayement(
        bytes32 group,
        uint256 amount,
        uint256 fee,
        address currency,
        address fee_collector
    ) internal {

        IERC20(currency).transferFrom(msg.sender, address(this), amount);
        if (fee > 0) {
            IERC20(currency).transferFrom(msg.sender, fee_collector, fee);
        }

        balances[group][currency] = balances[group][currency].add(amount);

    }

    /**
     * @notice This is the core pre-purchase creation method. It binds attachments in exchange of payment.
     *
     * @param id This is the identifier of the event. When combining event controller address and this is, we get a
     *           unique identifier used to regroup the tickets.
     *
     * @param b32 This parameter contains all the bytes32 arguments required to pay and mint the tickets
     *
     *                                +> There are no bytes32 arguments for the payment logics
     *        |                       |
     *
     *                                +> These are the arguments used for the attachment logics
     *        | attachment_1_category | < An attachment name is specified for each attachment
     *        | attachment_2_category |
     *        | attachment_3_category |
     *        | attachment_4_category |
     *        | attachment_5_category |
     *
     * @param uints This parameter contains all the uin256 arguments required to pay and attach the attachments
     *
     *                            +> These are the arguments used for the payment logics
     *        | currency_count    | < This is the number of currency to use for the payment (in our example: 2)
     *        | expiration        | < This is the authorization expiration timestamp
     *        | currency_1_price  | < For each currency, the price paid to the organizer
     *        | currency_1_fee    | < For each currency, the extra fee for T721
     *        | currency_2_price  |
     *        | currency_2_fee    |
     *
     *                            +> These are the arguments used for the minting process
     *        | attachment_count  | < This is the number of tickets to mint
     *        | amount_1          | < The amount of attachment to add for this type.
     *        | code_1            | < The authorization code
     *        | ticket_id_1       | < The ID of the ticket on which to bind the attachments
     *        | amount_2          |
     *        | code_2            |
     *        | ticket_id_2       |
     *        | amount_3          |
     *        | code_3            |
     *        | ticket_id_3       |
     *        | amount_4          |
     *        | code_4            |
     *        | ticket_id_4       |
     *        | amount_5          |
     *        | code_5            |
     *        | ticket_id_5       |
     *
     * @param addr This parameter contains all the address arguments required to pay and attach the attachments
     *
     *                            +> These are the arguments used for the payment logics
     *        | event_controller  | < The address of the controller
     *        | currency_1        | < The address of each currency
     *        | currency_2        |
     *
     *                            +> There are no address arguments for attachment process
     *        |                   |
     *
     * @param bs This parameter contains bytes used to pay and attach the attachments. The notation argument[23]
     *           means it's a 23 bytes segment.
     *
     *                            +> There are no bytes arguments for the payment process
     *        |                   |
     *
     *                            +> These are the arguments used for the attachment process
     *        | auth_sig_1[65]     | < For each attachment, an authorization signature made of unique parameters
     *        | auth_sig_2[65]     |
     *        | auth_sig_3[65]     |
     *        | auth_sig_4[65]     |
     *        | auth_sig_5[65]     |
     *
     */
    function attach(
        string memory id,
        bytes32[] memory b32,
        uint256[] memory uints,
        address[] memory addr,
        bytes memory bs
    ) public {

        uint256 uints_idx = 2;
        uint256 addr_idx = 2;
        bytes memory prices = "";
        address event_controller;

        // Payment Processing
        {
            require(uints.length >= 2, "T721C::attach | missing uints[0 & 1] (currency number & expiration)");
            require(addr.length >= 2, "T721C::attach | missing addr[0] (event controller and fee_collector)");

            uint256 currency_number = uints[0];
            event_controller = addr[0];
            address fee_collector = addr[1];
            bytes32 group = getGroupID(event_controller, id);

            if (currency_number > 0) {

                // Now that we now the number of currencies used for payment, we can verify that the required amount
                // of arguments in uints and addr are respected
                require(uints.length - 1 >= (currency_number * 2), "T721C::attach | not enough space on uints (1)");
                require(addr.length - 2 >= currency_number, "T721C::attach | not enough space on addr (1)");

                for (uint256 currency_idx = 0; currency_idx < currency_number; ++currency_idx) {

                    prices = BytesUtil_v0.concat(prices, abi.encode(uints[uints_idx + (currency_idx * 2)]));
                    prices = BytesUtil_v0.concat(prices, abi.encode(uints[uints_idx + 1 + (currency_idx * 2)]));
                    prices = BytesUtil_v0.concat(prices, abi.encode(addr[addr_idx + currency_idx]));

                    executePayement(
                        group,
                        uints[uints_idx + (currency_idx * 2)],
                        uints[uints_idx + 1 + (currency_idx * 2)],
                        addr[addr_idx + currency_idx],
                        fee_collector
                    );

                }

                uints_idx += currency_number * 2;
                addr_idx += currency_number;

            }


        }

        // Attachment Event Emission
        {
            // Same as above, first we check the bare minimum arguments
            require(uints.length - uints_idx > 0, "T721C::attach | missing attachmentCount on uints");

            uint256 attachment_number = uints[uints_idx];
            ++uints_idx;

            require(attachment_number > 0, "T721C::attach | why would you attach 0 attachments ?");
            require(b32.length == attachment_number, "T721C::attach | not enough space on b32");
            require(uints.length - uints_idx == attachment_number * 3, "T721C::attach | not enough space on uints (2)");
            require(bs.length / 65 == attachment_number && bs.length % 65 == 0,
                "T721C::attachment | not enough space or invalid length on bs");

            for (uint256 attachment_idx = 0; attachment_idx < attachment_number; ++attachment_idx) {

                // We extract arguments for one attachment
                uint256 amount = uints[uints_idx + (attachment_idx * 3)];

                // Signature Verification Scope
                {

                    bytes memory signature = BytesUtil_v0.slice(bs, (attachment_idx * 65), 65);
                    bytes memory encoded;

                    {
                        bytes32 name = b32[attachment_idx];
                        uint256 expiration = uints[1];
                        uint256 code = uints[uints_idx + 1 + (attachment_idx * 3)];

                        require(block.timestamp <= expiration, "T721C::attach | authorization expired");

                        encoded = abi.encode(
                            "attach",
                            prices,
                            name,
                            amount,
                            code,
                            expiration
                        );

                        consumeCode(event_controller, code);
                    }

                    bytes32 hash = keccak256(encoded);

                    address ticket_owner = t721.ownerOf(uints[uints_idx + 2 + (attachment_idx * 3)]);

                    // Core verification, this is what controls the flow of minted tickets
                    require(verify(Authorization(event_controller, ticket_owner, hash), signature) == event_controller,
                        "T721C::attach | invalid signature");

                }

                // Attachment Emission
                {

                    bytes32 group = getGroupID(event_controller, id);
                    bytes32 name = b32[attachment_idx];
                    uint256 code = uints[uints_idx + 1 + (attachment_idx * 3)];
                    uint256 ticket_id = uints[uints_idx + 2 + (attachment_idx * 3)];

                    emit Attach(
                        group,
                        name,
                        ticket_id,
                        amount,
                        code
                    );

                }

            }

        }

    }

    /**
     * @notice This is the core ticket creation method. With a proper signature from the event controller, the method
     *         can release several tickets for a payment made from one or more currencies (or for free). All examples
     *         below show a use case where we use 2 payment methods to mint 5 tickets.
     *
     * @param id This is the identifier of the event. When combining event controller address and this is, we get a
     *           unique identifier used to regroup the tickets.
     *
     * @param b32 This parameter contains all the bytes32 arguments required to pay and mint the tickets
     *
     *                            +> There are no bytes32 arguments for the payment logics
     *        |                   |
     *
     *                            +> These are the arguments used for the minting logics
     *        | ticket_1_category | < A category is specified for each ticket
     *        | ticket_2_category |
     *        | ticket_3_category |
     *        | ticket_4_category |
     *        | ticket_5_category |
     *
     * @param uints This parameter contains all the uin256 arguments required to pay and mint the tickets
     *
     *                            +> These are the arguments used for the payment logics
     *        | currency_count    | < This is the number of currency to use for the payment (in our example: 2)
     *        | expiration        | < This is the expiration timestamp of the authorization
     *        | currency_1_price  | < For each currency, the price paid to the organizer
     *        | currency_1_fee    | < For each currency, the extra fee for T721
     *        | currency_2_price  |
     *        | currency_2_fee    |
     *
     *                            +> These are the arguments used for the minting process
     *        | ticket_count      | < This is the number of tickets to mint
     *        | code_1            | < For each ticket, an authorization code is required. It is mixed with the
     *        | code_2            |   signature to prevent replay attacks. It must be unique.
     *        | code_3            |
     *        | code_4            |
     *        | code_5            |
     *
     * @param addr This parameter contains all the address arguments required to pay and mint the tickets
     *
     *                            +> These are the arguments used for the payment logics
     *        | event_controller  | < The address of the controller
     *        | currency_1        | < The address of each currency
     *        | currency_2        |
     *
     *                            +> These are the arguments used for the minting process
     *        | owner_1            | < For each ticket, its owner
     *        | owner_2            |
     *        | owner_3            |
     *        | owner_4            |
     *        | owner_5            |
     *
     * @param bs This parameter contains bytes used to pay and mint the tickets. The notation argument[23] means it's
     *           a 23 bytes segment.
     *
     *                            +> There are no bytes arguments for the payment process
     *        |                   |
     *
     *                            +> These are the arguments used for the minting process
     *        | auth_sig_1[65]     | < For each ticket, an authorization signature made of unique parameters
     *        | auth_sig_2[65]     |
     *        | auth_sig_3[65]     |
     *        | auth_sig_4[65]     |
     *        | auth_sig_5[65]     |
     *
     */
    function mint(
        string memory id,
        bytes32[] memory b32,
        uint256[] memory uints,
        address[] memory addr,
        bytes memory bs
    ) public {

        uint256 uints_idx = 2;
        uint256 addr_idx = 2;
        bytes memory prices = "";
        address event_controller;
        bytes32 group;

        // Payment Processing Scope
        {

            // We verify that the bare minimum arguments are here before accessing them
            require(uints.length >= 2, "T721C::mint | missing uints[0 & 1] (currency number & expiration)");
            require(addr.length >= 2, "T721C::mint | missing addr[0] (event controller)");

            uint256 currency_number = uints[0];
            event_controller = addr[0];
            address fee_collector = addr[1];
            group = getGroupID(event_controller, id);

            if (currency_number > 0) {

                // Now that we now the number of currencies used for payment, we can verify that the required amount
                // of arguments in uints and addr are respected
                require(uints.length - 2 >= (currency_number * 2), "T721C::mint | not enough space on uints (1)");
                require(addr.length - 2 >= currency_number, "T721C::mint | not enough space on addr (1)");

                for (uint256 currency_idx = 0; currency_idx < currency_number; ++currency_idx) {

                    prices = BytesUtil_v0.concat(prices, abi.encode(uints[uints_idx + (currency_idx * 2)]));
                    prices = BytesUtil_v0.concat(prices, abi.encode(uints[uints_idx + 1 + (currency_idx * 2)]));
                    prices = BytesUtil_v0.concat(prices, abi.encode(addr[addr_idx + currency_idx]));

                    executePayement(
                        group,
                        uints[uints_idx + (currency_idx * 2)],
                        uints[uints_idx + 1 + (currency_idx * 2)],
                        addr[addr_idx + currency_idx],
                        fee_collector
                    );

                }

                uints_idx += currency_number * 2;
                addr_idx += currency_number;

            }

        }


        // Ticket Minting Scope
        {

            // Same as above, first we check the bare minimum arguments
            require(uints.length - uints_idx > 0, "T721C::mint | missing ticketCount on uints");

            uint256 ticket_number = uints[uints_idx];
            ++uints_idx;

            // Being the last step, we can now verify exact amounts of arguments, and not a minimum required
            require(ticket_number > 0, "T721C::mint | why would you mint 0 tickets ?");
            require(b32.length == ticket_number, "T721C::mint | not enough space on b32");
            require(bs.length / 65 == ticket_number && bs.length % 65 == 0,
                "T721C::mint | not enough space or invalid length on bs");
            require(addr.length - addr_idx == ticket_number, "T721C::mint | not enough space on addr (2)");
            require(uints.length - uints_idx == (ticket_number * 2), "T721C::mint | not enough space on uints (2)");


            for (uint256 ticket_idx = 0; ticket_idx < ticket_number; ++ticket_idx) {

                // We extract arguments for one ticket
                bytes memory signature = BytesUtil_v0.slice(bs, (ticket_idx * 65), 65);
                uint256 code = uints[uints_idx + (ticket_idx * 2)];
                uint256 scope_index = uints[uints_idx + 1 + (ticket_idx * 2)];
                bytes32 category = b32[ticket_idx];
                address ticket_owner = addr[addr_idx + ticket_idx];

                // Signature Verification Scope
                {

                    uint256 expiration = uints[1];

                    require(block.timestamp <= expiration, "T721C::mint | authorization expired");

                    bytes32 hash = keccak256(abi.encode(
                            "mint",
                            prices,
                            group,
                            category,
                            code,
                            expiration
                        ));

                    // Core verification, this is what controls the flow of minted tickets
                    require(verify(Authorization(event_controller, ticket_owner, hash), signature) == event_controller,
                        "T721C::mint | invalid signature");
                    consumeCode(event_controller, code);

                }

                // Minting Scope
                {
                    // We call the TicketForge to issue a new ticket
                    uint256 ticket_id = t721.mint(ticket_owner, scope_index);

                    // We register group and category information for the new ticket
                    tickets[ticket_id] = Affiliation({
                        active: true,
                        group: group,
                        category: category
                        });

                    // We emit a Mint event that is caught by the infrastructure
                    emit Mint(group, category, ticket_owner, ticket_id, msg.sender, code);
                }
            }

        }

    }

    /**
     * @notice utility for external entities to verify that event controller + event id have authority upon a ticket
     *
     * @param controller Address of the event controller
     *
     * @param id ID of the event
     *
     * @param ticketId ID of the ticket
     */
    function hasAuthorityUpon(address controller, string calldata id, uint256 ticketId) external view returns (bool) {
        return tickets[ticketId].active && tickets[ticketId].group == getGroupID(controller, id);
    }

}
