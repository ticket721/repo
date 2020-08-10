pragma solidity 0.5.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract DaiMock_v0 is ERC20, ERC20Detailed {
    function mint(address target, uint256 amount) public {
        ERC20._mint(target, amount);
    }

    constructor() ERC20Detailed("DaiMock", "E20M", 18) public {}
}
