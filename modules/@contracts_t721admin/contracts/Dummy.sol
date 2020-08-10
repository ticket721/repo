pragma solidity 0.5.15;

contract Dummy {

    uint256 public value = 0;

    function inc() public {
        value += 1;
    }

    function ko() public {
        revert("This error is expected");
    }

}
