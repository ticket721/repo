pragma solidity 0.5.15;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SmartWalletMock_v0 {

    address public controller;

    constructor (address _controller)
    public {
        controller = _controller;
    }

    function isController(address _controller) external view returns (bool) {
        return controller == _controller;
    }

}
