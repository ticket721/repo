pragma solidity 0.5.15;

import "./ITokenUriProvider.sol";

contract TokenUriProviderExample is ITokenUriProvider {

    function tokenURI(uint256 id) external view returns (string memory uri) {
        id;
        return "salut";
    }

}
