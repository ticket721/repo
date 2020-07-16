pragma solidity 0.5.15;

contract Ownable {

    mapping(address => bool) public owners;

    constructor() public {
        owners[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(owners[msg.sender] == true, "Ownable::onlyOwner | Only owners allowed to call method");
        _;
    }

    function addOwner(address _newOwner) public onlyOwner {
        require(owners[_newOwner] == false, "Ownable::add | address is already owner");
        owners[_newOwner] = true;
    }

}
