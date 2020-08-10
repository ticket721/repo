pragma solidity 0.5.15;

contract ITokenUriProvider {

    function tokenURI(uint256 id) external view returns (string memory uri);

}
