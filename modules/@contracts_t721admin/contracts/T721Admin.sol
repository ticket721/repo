pragma solidity 0.5.15;
import "./IT721Token.sol";
import "./T721AdminDomain.sol";

contract T721Admin is T721AdminDomain {

    address public t721Token;

    struct Vote {
        uint256 reason;
        address target;
        uint256 yes;
        uint256 no;
        mapping (address => uint256) voters;
        uint256 version;
    }

    mapping (uint256 => bool) codes;
    mapping (address => bool) adminMapping;
    uint256 public adminCount;
    mapping (address => bool) minterMapping;
    uint256 public minterCount;
    uint256 public version;
    Vote[] public votes;

    event NewVote(address indexed target, uint256 indexed reason, uint256 idx);
    event NewAdmin(address indexed admin);
    event ByeAdmin(address indexed admin);
    event NewMinter(address indexed minter);
    event ByeMinter(address indexed minter);
    event ContractCreated(address indexed contractAddress);
    event MintTokens(address indexed recipient, address indexed minter, uint256 amount, uint256 code);

    function isCodeConsumable(uint256 _code) public view returns (bool) {
        return !codes[_code];
    }

    function consumeCode(uint256 _code) internal {
        require(isCodeConsumable(_code), "T721Admin::consumeCode | code already used");
        codes[_code] = true;
    }

    function _addAdmin(address _admin) internal {

        adminMapping[_admin] = true;
        adminCount += 1;
        version += 1;

        emit NewAdmin(_admin);

    }

    function _rmAdmin(address _admin) internal {

        adminMapping[_admin] = false;
        adminCount -= 1;
        version += 1;

        emit ByeAdmin(_admin);
    }

    function _addMinter(address _minter) internal {

        minterMapping[_minter] = true;
        minterCount += 1;
        version += 1;

        emit NewMinter(_minter);

    }

    function _rmMinter(address _minter) internal {

        minterMapping[_minter] = false;
        minterCount -= 1;
        version += 1;

        emit ByeMinter(_minter);
    }

    constructor(
        address[] memory _admins,
        address[] memory _minters,
        address _t721Token,
        uint256 _chainId
    ) public T721AdminDomain("T721 Admin", "0", _chainId) {

        for (uint256 idx = 0; idx < _admins.length; ++idx) {
            _addAdmin(_admins[idx]);
        }

        for (uint256 idx = 0; idx < _minters.length; ++idx) {
            _addMinter(_minters[idx]);
        }

        version = 0;
        t721Token = _t721Token;
    }

    function isAdmin(address _admin) public view returns (bool) {
        return adminMapping[_admin];
    }

    function isMinter(address _minter) public view returns (bool) {
        return minterMapping[_minter];
    }

    modifier onlyAdmin() {
        require(adminMapping[msg.sender] == true, "T721Admin::onlyAdmin | sender is not admin");
        _;
    }

    function addMinter(address _minter) public onlyAdmin {
        require(isMinter(_minter) == false, "T721Admin::addMinter | address is already minter");
        _addMinter(_minter);
    }

    function rmMinter(address _minter) public onlyAdmin {
        require(isMinter(_minter) == true, "T721Admin::rmMinter | address is not minter");
        _rmMinter(_minter);
    }

    function addAdmin(address _admin) public onlyAdmin {

        require(isAdmin(_admin) == false, "T721Admin::addAdmin | address is already admin");
        require(_admin != address(0), "T721Admin::addAdmin | cannot add 0 addr");

        uint256 idx = votes.push(Vote({
            reason: 1,
            target: _admin,
            yes: 0,
            no: 0,
            version: version
            })) - 1;

        emit NewVote(_admin, 1, idx);

    }

    function rmAdmin(address _admin) public onlyAdmin {

        require(isAdmin(_admin) == true, "T721Admin::rmAdmin | address is not admin");

        uint256 idx = votes.push(Vote({
            reason: 2,
            target: _admin,
            yes: 0,
            no: 0,
            version: version
            })) - 1;

        emit NewVote(_admin, 2, idx);
    }

    function vote(uint256 idx, bool _vote) public onlyAdmin {

        require(votes.length > idx, "T721Admin::vote | invalid vote index");
        require(votes[idx].version == version, "T721Admin::vote | outdated vote");
        require(votes[idx].voters[msg.sender] != 1 + (_vote == true ? 1 : 0), "T721Admin::vote | useless vote");

        votes[idx].yes += 0 + (_vote == true ? 1 : 0);
        votes[idx].no += 0 + (_vote == false ? 1 : 0);
        votes[idx].voters[msg.sender] = 1 + (_vote == true ? 1 : 0);

        if ((votes[idx].yes * 100) / adminCount >= 50) {

            if (votes[idx].reason == 1) {

                _addAdmin(votes[idx].target);

            } else {

                _rmAdmin(votes[idx].target);

            }

        }

    }

    function redeemTokens(
        address _recipient,
        uint256 _amount,
        address _minter,
        uint256 _code,
        bytes calldata _signature
    ) external {

        bytes32 hash = keccak256(
            abi.encode(
                "mintTokens",
                _recipient,
                _amount,
                _minter,
                _code
            )
        );

        require(verify(Authorization(_minter, _recipient, hash), _signature) == _minter,
            "T721Admin::redeemTokens | invalid signature");
        require(isMinter(_minter) == true, "T721Admin::redeemTokens | signer is not minter");

        consumeCode(_code);

        IT721Token(t721Token).mintFor(_recipient, _amount);

        emit MintTokens(_recipient, _minter, _amount, _code);
    }

}
