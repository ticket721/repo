pragma solidity 0.5.15;

contract IdentityMock {
    function _executeTx(address to, uint256 value, bytes memory data) internal {
        assembly {
            let message := mload(0x40)

            let result := call(gas, to, value, add(data, 0x20), mload(data), 0, 0)

            let size := returndatasize

            returndatacopy(message, 0, size)

            if eq(result, 0) { revert(message, size) }
        }
    }

    function dotx(
        address to,
        uint256 value,
        bytes calldata data
    ) external {

        _executeTx(to, value, data);

    }

    function() external payable {}

}
