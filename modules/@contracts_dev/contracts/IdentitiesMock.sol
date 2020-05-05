pragma solidity 0.5.15;
import "./IdentityMock.sol";

contract IdentitiesMock {

    function _getSalt(uint256 _salt, address _sender) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_salt, _sender));
    }

    function _createWallet(uint256 _salt, address _sender) internal returns (IdentityMock) {
        address payable addr;
        bytes memory code = type(IdentityMock).creationCode;
        bytes32 salt = _getSalt(_salt, _sender);

        assembly {
            addr := create2(0, add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        address[] memory controllers = new address[](1);
        controllers[0] = _sender;

        return IdentityMock(addr);
    }

    function predict(address owner, uint256 salt) public view returns (address) {
        bytes32 _salt = _getSalt(salt, owner);
        bytes32 rawAddress = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(type(IdentityMock).creationCode)
            )
        );

        return address(bytes20(rawAddress << 96));
    }

    function isContract(address _addr) private view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }

    function dotx(
        address owner,
        uint256 salt,
        address to,
        uint256 value,
        bytes calldata data
    ) external {

        address payable id = address(bytes20(predict(owner, salt)));

        if (isContract(id)) {
            IdentityMock deployed = IdentityMock(id);
            deployed.dotx(to, value, data);
        } else {
            IdentityMock deployed = _createWallet(salt, owner);
            deployed.dotx(to, value, data);
        }
    }

}
