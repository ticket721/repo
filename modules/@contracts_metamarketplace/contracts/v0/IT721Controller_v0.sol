pragma solidity 0.5.15;

interface IT721Controller_v0 {

    function hasAuthorityUpon(address controller, string calldata id, uint256 ticketId) external view returns (bool);

}
