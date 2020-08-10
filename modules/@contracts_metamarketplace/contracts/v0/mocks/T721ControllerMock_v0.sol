pragma solidity 0.5.15;

contract T721ControllerMock_v0 {

    bool ret = true;

    function setReturnedValue(bool value) public {
        ret = value;
    }

    function hasAuthorityUpon(address controller, string calldata id, uint256 ticketId) external view returns (bool) {
        return ret;
    }

}
