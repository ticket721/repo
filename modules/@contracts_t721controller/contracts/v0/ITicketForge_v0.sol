pragma solidity 0.5.15;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ITicketForge_v0 is IERC721 {

    function mint(address to, uint256 scopeIndex) external returns (uint256);
    function mint(address to, uint256 scopeIndex, string calldata tokenUri) external returns (uint256);

}
