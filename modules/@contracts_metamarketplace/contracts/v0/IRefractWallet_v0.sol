pragma solidity 0.5.15;

interface IRefractWallet_v0 {

    function() external payable;

    //
    // @notice Returns code of currently used interface
    //
    function version() external view returns (uint256 version_code);

    //
    // @notice Utility to verify if a given address is registered as a RefractWallet controller.
    //
    // @param controller Address to verify
    //
    function isController(address controller) external view returns (bool);

    event MTX_Refraction(
        address indexed to,
        address indexed relayer,
        uint256 value,
        uint256 nonce,
        bytes data
    );

    event MTXG_Refraction(
        address indexed to,
        address indexed relayer,
        uint256 value,
        uint256 nonce,
        bytes data,
        uint256 gasLimit,
        uint256 gasPrice
    );

    event MTXR_Refraction(
        address indexed to,
        address indexed relayer,
        uint256 value,
        uint256 nonce,
        bytes data,
        address reward_currency,
        uint256 reward_value
    );

    event MTXGR_Refraction(
        address indexed to,
        address indexed relayer,
        uint256 value,
        uint256 nonce,
        bytes data,
        uint256 gasLimit,
        uint256 gasPrice,
        address reward_currency,
        uint256 reward_value
    );

    //
    // @notice Method to execute a simple meta transaction (mtx)
    //
    // @param addr Array containing address arguments for the meta transaction
    //
    //             ```
    //             | to      | > Transaction target address
    //             | relayer | > Meta Transaction relayer address
    //             ```
    //
    // @notice to is not required as it is implicitely set to the address of the contract.
    // @notice relayer can be set to address(0) to remove any relayer verification.
    //
    // @param nums Array containing uint256 arguments for the meta transaction
    //
    //             ```
    //             | nonce   | > Nonce of the meta transaction
    //             | value   | > Amount of eth to use in the transaction
    //             ```
    //
    // @param bdata Contains the signature of a controller, respecting the ERC712 standard, signing an mtx
    //                  data structure type, followed by transaction data.
    //
    function mtx(address[] calldata addr, uint256[] calldata nums, bytes calldata bdata) external;


    //
    // @notice Method to execute a meta transaction with gas requirements
    //
    // @param addr Array containing address arguments for the meta transaction
    //
    //             ```
    //             | to      | > Transaction target address
    //             | relayer | > Meta Transaction relayer address
    //             ```
    //
    // @notice to is not required as it is implicitely set to the address of the contract.
    // @notice relayer can be set to address(0) to remove any relayer verification.
    //
    // @param nums Array containing uint256 arguments for the meta transaction
    //
    //             ```
    //             | nonce    | > Nonce of the meta transaction
    //             | value    | > Amount of eth to use in the transaction
    //             | gasLimit | > Minimum amount of gas to use for the meta transaction
    //             | gasPrice | > Minimum gas price to use for the meta transaction
    //             ```
    //
    // @param bdata Contains the signature of a controller, respecting the ERC712 standard, signing an mtx
    //                  data structure type, followed by transaction data.
    //
    function mtxg(address[] calldata addr, uint256[] calldata nums, bytes calldata bdata) external;

    //
    // @notice Method to execute a meta transaction with reward
    //
    // @param addr Array containing address arguments for the meta transaction
    //
    //             ```
    //             | to          | > Transaction target address
    //             | relayer     | > Meta Transaction relayer address
    //             | rewardToken | > Address of the currency to use as a reward
    //             ```
    //
    // @notice to is not required as it is implicitely set to the address of the contract.
    // @notice relayer can be set to address(0) to remove any relayer verification.
    // @notice rewardToken can be set to address(0) to give a reward in $ETH
    //
    // @param nums Array containing uint256 arguments for the meta transaction
    //
    //             ```
    //             | nonce       | > Nonce of the meta transaction
    //             | value       | > Amount of eth to use in the transaction
    //             | rewardValue | > Amount of token to reward the relayer
    //             ```
    //
    // @param bdata Contains the signature of a controller, respecting the ERC712 standard, signing an mtx
    //                  data structure type, followed by transaction data.
    //
    function mtxr(address[] calldata addr, uint256[] calldata nums, bytes calldata bdata) external;

    //
    // @notice Method to execute a meta transaction with reward & gas requirements
    //
    // @param addr Array containing address arguments for the meta transaction
    //
    //             ```
    //             | to          | > Transaction target address
    //             | relayer     | > Meta Transaction relayer address
    //             | rewardToken | > Address of the currency to use as a reward
    //             ```
    //
    // @notice to is not required as it is implicitely set to the address of the contract.
    // @notice relayer can be set to address(0) to remove any relayer verification.
    // @notice rewardToken can be set to address(0) to give a reward in $ETH
    //
    // @param nums Array containing uint256 arguments for the meta transaction
    //
    //             ```
    //             | nonce       | > Nonce of the meta transaction
    //             | value       | > Amount of eth to use in the transaction
    //             | gasLimit    | > Minimum amount of gas to use for the meta transaction
    //             | gasPrice    | > Minimum gas price to use for the meta transaction
    //             | rewardValue | > Amount of token to reward the relayer
    //             ```
    //
    // @param bdata Contains the signature of a controller, respecting the ERC712 standard, signing an mtx
    //                  data structure type, followed by transaction data.
    //
    function mtxgr(address[] calldata addr, uint256[] calldata nums, bytes calldata bdata) external;


}
