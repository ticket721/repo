pragma solidity 0.5.15;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Enumerable.sol";
import "./ITokenUriProvider.sol";

/**
* @notice The goal here is not to reproduce the TicketForge. A basic ERC721 should work.
*         The important part is the ability to have immutable transfer admins.
*
*/
contract ERC721Mock_v0 is ERC721, ERC721Enumerable {
    event Mint(string indexed scope, address indexed owner, address indexed issuer, uint256 ticketId);

    /**
    * @notice Represents a Scope. All tickets should belong to a scope. A scope adds
    *         rules to the ticket's mechanisms.
    */
    struct Scope {
        bool exists;
        mapping (address => bool) transfer_admins;
        mapping (address => bool) mint_admins;
        address tokenuri_provider;
        uint256 index;
    }

    struct Ticket {
        uint256 scope;
    }

    mapping (string => Scope)   private scopes;
    string[]                    private scopeByIndex;
    mapping (address => uint256) public mint_nonce;
    mapping (uint256 => Ticket) private ticketInfos;
    mapping (uint256 => string) private ticketURIs;
    string                      private _name;
    string                      private _symbol;

    constructor() public {
        _name = "Ticketforge";
        _symbol = "TKT";
    }

    /**
     *  @notice Utility to get scope's existence and tokenURI provider.
     *
     *  @param scope_name Name of the scope to check.
     *
     */
    function getScope(string calldata scope_name)
    external view returns (bool exists, address tokenuri_provider, uint256 scope_index) {
        return (scopes[scope_name].exists, scopes[scope_name].tokenuri_provider, scopes[scope_name].index);
    }

    /**
     *  @notice Utility to know if a provided address is a admin of provided scope name
     *
     *  @param scope_name Name of the scope to check.
     *
     *  @param admin Address to check.
     *
     */
    function isScopeAdmin(string calldata scope_name, address admin) external view returns (bool) {
        return scopes[scope_name].transfer_admins[admin];
    }

    /**
     *  @notice Utility to know if a provided address is a mint admin able to create tickets.
     *          If `address(0)` is a mint admin, this will return true for all addresses.
     *
     *  @param scopeIndex index of scope to check
     *
     *  @param minter address of minter to check
     *
     */
    function isAllowedMinter(uint256 scopeIndex, address minter) public view returns (bool) {
        if (scopes[scopeByIndex[scopeIndex]].mint_admins[address(0)] == true) {
            return true;
        }

        return scopes[scopeByIndex[scopeIndex]].mint_admins[minter];
    }

    /**
     *  @notice Utility to recover ERC-721 Metadata Name
     *
     */
    function name() external view returns (string memory) {
        return _name;
    }

    /**
     *  @notice Utility to recover ERC-721 Metadata Symbol
     *
     */
    function symbol() external view returns (string memory) {
        return _symbol;
    }

    /**
     *  @notice Utility to recover the tokenUri for a specific ticketId.
     *          If a TokenUri provider is set on the scope, will call him instead.
     *
     *  @param ticketId Id of Ticket
     *
     */
    function tokenURI(uint256 ticketId) external view returns (string memory) {
        require(_exists(ticketId), "ERC721Metadata: URI query for nonexistent token");

        if (scopes[scopeByIndex[ticketInfos[ticketId].scope]].tokenuri_provider != address(0)) {
            return ITokenUriProvider(
                scopes[scopeByIndex[ticketInfos[ticketId].scope]].tokenuri_provider
            ).tokenURI(ticketId);
        } else {
            return ticketURIs[ticketId];
        }
    }

    modifier mintCheck(uint256 scopeIndex) {
        require(scopeByIndexExists(scopeIndex), "TicketForge::mint | invalid scope for ticket minting");
        require(isAllowedMinter(scopeIndex, msg.sender), "TicketForge::mint | unauthorized minter");
        _;
    }

    /**
     *  @notice Creates an immutable scope. Define transfer admins that can trigger any transfers
     *          on any user's behalf. This is meant to delegate logics like marketplaces to other
     *          contracts. Do not use this to set wallets as admins ...
     *          The tokenuri_provider is a contract that implement the TokenURIProvider interface.
     *          This contract will be called to resolve tokenURIs. Set to 0x000.. to use a normal
     *          behavior where each token should have its own tokenURI.
     *
     *  @dev The function MUST throw if the provided name is empty
     *
     *  @dev The function MUST throw if the provided name contains uppercase letters
     *
     *  @dev The function MUST throw if the provided name is already defined
     *
     *  @param scope_name Name to give to the new scope
     *
     *  @param tokenuri_provider Address of TokenURIProvider contract. `address(0)` is none should be used.
     *
     *  @param transfer_admins Array of addresses. They all become transfer admins for the scope's tickets. This
     *                         means they can trigger any transfers. Made to be used on contracts like marketplaces.
     *                         Use at your own risk on wallets ...
     *
     */
    function createScope(
        string calldata scope_name,
        address tokenuri_provider,
        address[] calldata transfer_admins,
        address[] calldata mint_admins
    ) external {
        require(verifyScopeName(scope_name) == true,
            "TicketForge::createScope | name empty or with invalid characters");
        require(scopes[scope_name].exists == false,
            "TicketForge::createScope | scope name already in use");

        scopes[scope_name].exists = true;
        scopes[scope_name].tokenuri_provider = tokenuri_provider;

        for (uint idx = 0; idx < transfer_admins.length; ++idx) {
            scopes[scope_name].transfer_admins[transfer_admins[idx]] = true;
        }

        if (mint_admins.length == 0) {
            scopes[scope_name].mint_admins[address(0)] = true;
        }

        for (uint idx = 0; idx < mint_admins.length; ++idx) {
            scopes[scope_name].mint_admins[mint_admins[idx]] = true;
        }

        scopes[scope_name].index = scopeByIndex.push(scope_name) - 1;
    }

    /**
     * @notice Retrieves the current mint nonce of an address
     *
     * @param owner Address to check
     */
    function getMintNonce(address owner) public view returns (uint256) {
        return mint_nonce[owner];
    }

    /**
     * @notice Generates the deterministic mint ID for an owner
     *
     * @param owner Address of initial token owner
     * @param _mint_nonce Nonce of owner mintings
     */
    function getTokenID(address owner, uint256 _mint_nonce) public pure returns (uint256) {

        bytes32 hash = keccak256(
            abi.encodePacked(
                owner,
                _mint_nonce
            )
        );

        return uint256(hash);
    }

    /**
     *  @notice Create a new ERC-721 token assigned to given address, under specified scope
     *
     *  @param to Address of initial owner
     *  @param scopeIndex Index of desired scope
     */
    function mint(address to, uint256 scopeIndex) external mintCheck(scopeIndex) returns (uint256) {

        uint256 id = getTokenID(to, mint_nonce[to]);

        _mint(to, id);
        ticketInfos[id] = Ticket({scope: scopeIndex});
         emit Mint(scopeByIndex[scopeIndex], to, msg.sender, id);
        emit Transfer(msg.sender, to, id);
        ++mint_nonce[to];

        return id;
    }

    /**
     *  @notice Creates a new ERC-721 token assigned to given address, under specified scope. Also
     *          assigns given token uri.
     *
     *  @param to Address of initial owner
     *  @param scopeIndex Index of desired scope
     *  @param tokenUri Token Uri to assign to new token
     */
    function mint(address to, uint256 scopeIndex, string calldata tokenUri) external mintCheck(scopeIndex) returns (uint256) {
        uint256 id = getTokenID(to, mint_nonce[to]);

        _mint(to, id);
        ticketInfos[id] = Ticket({scope: scopeIndex});
        ticketURIs[id] = tokenUri;
        emit Mint(scopeByIndex[scopeIndex], to, msg.sender, id);
        emit Transfer(msg.sender, to, id);
        ++mint_nonce[to];

        return id;
    }

    /**
     * @dev Transfers the ownership of a given token ID to another address.
     * Usage of this method is discouraged, use `safeTransferFrom` whenever possible.
     * Requires the msg.sender to be the owner, approved, or operator.
     *
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param ticketId uint256 ID of the token to be transferred
     */
    function transferFrom(address from, address to, uint256 ticketId) public {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwnerOrScopeAdmin(msg.sender, ticketId), "ERC721: transfer caller is not owner, approved or scope admin");

        _transferFrom(from, to, ticketId);
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement `onERC721Received`,
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     *
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param ticketId uint256 ID of the token to be transferred
     */
    function safeTransferFrom(address from, address to, uint256 ticketId) public {
        safeTransferFrom(from, to, ticketId, "");
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement `onERC721Received`,
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     *
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param ticketId uint256 ID of the token to be transferred
     * @param _data bytes data to send along with a safe transfer check
     */
    function safeTransferFrom(address from, address to, uint256 ticketId, bytes memory _data) public {
        transferFrom(from, to, ticketId);
        require(_checkOnERC721Received(from, to, ticketId, _data),
            "ERC721: transfer to non ERC721Receiver implementer");
    }

    function verifyScopeName(string memory scope_name) internal pure returns (bool) {
        bytes memory check_bytes = bytes(scope_name);

        if (check_bytes.length == 0) return false;

        for (uint idx = 0; idx < check_bytes.length; ++idx) {
            if ((int8(check_bytes[idx]) >= 33 && int8(check_bytes[idx]) <= 64) || // Ascii values from ! to @
                (int8(check_bytes[idx]) >= 91 && int8(check_bytes[idx]) <= 126)) // Ascii values from [ to ~
            {
                continue ;
            }
            return false;
        }

        return true;
    }

    function _isApprovedOrOwnerOrScopeAdmin(address owner, uint256 ticketId) internal view returns (bool) {
        if (_isApprovedOrOwner(owner, ticketId)) {
            return true;
        }
        return scopes[scopeByIndex[ticketInfos[ticketId].scope]].transfer_admins[owner];
    }

    function scopeByIndexExists(uint256 index) internal view returns (bool) {
        return scopeByIndex.length > index;
    }

}
