pragma solidity 0.5.15;
import "./SigUtil_v0.sol";

contract T721ControllerDomain_v0 {

    struct EIP712Domain {
        string  name;
        string  version;
        uint256 chainId;
        address verifyingContract;
    }

    bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    function hash(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
        return keccak256(abi.encode(
                EIP712DOMAIN_TYPEHASH,
                keccak256(bytes(eip712Domain.name)),
                keccak256(bytes(eip712Domain.version)),
                eip712Domain.chainId,
                eip712Domain.verifyingContract
            ));
    }

    bytes32 DOMAIN_SEPARATOR;

    struct Authorization {
        address emitter;
        address grantee;
        bytes32 hash;
    }

    bytes32 constant AUTHORIZATION_TYPEHASH = keccak256(
        "Authorization(address emitter,address grantee,bytes32 hash)"
    );

    function hash(Authorization memory auth) internal pure returns (bytes32) {
        return keccak256(abi.encode(
                AUTHORIZATION_TYPEHASH,
                auth.emitter,
                auth.grantee,
                auth.hash
            ));
    }

    function verify(Authorization memory auth, bytes memory raw_signature) internal view returns (address) {
        SigUtil_v0.Signature memory signature = SigUtil_v0._splitSignature(raw_signature);
        bytes32 digest = keccak256(abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                hash(auth)
            ));

        return ecrecover(digest, signature.v, signature.r, signature.s);
    }

    constructor(string memory _domain_name, string memory _version, uint256 _chainId) internal {
        DOMAIN_SEPARATOR = hash(EIP712Domain({
            name: _domain_name,
            version: _version,
            chainId: _chainId,
            verifyingContract: address(this)
            }));
    }


}
