pragma solidity 0.5.15;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract InvalidERC721Receiver is IERC721Receiver {
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a01;

    address public last_operator;
    address public last_from;
    uint256 public last_tokenId;
    bytes public last_data;


    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data)
    public returns (bytes4) {
        last_operator = operator;
        last_from = from;
        last_tokenId = tokenId;
        last_data = data;
        return _ERC721_RECEIVED;
    }
}
