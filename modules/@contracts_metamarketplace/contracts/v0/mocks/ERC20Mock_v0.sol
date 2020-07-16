pragma solidity 0.5.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract ERC20Mock_v0 is ERC20, ERC20Detailed {
    function mint(address target, uint256 amount) public {
        ERC20._mint(target, amount);
    }

    function mintApprove(address target, uint256 amount, address approve_target, uint256 approve_amount) public {
        ERC20._mint(target, amount);
        ERC20._approve(target, approve_target, approve_amount);
    }

    constructor() ERC20Detailed("ERC20Mock", "E20M", 18) public {}
}
