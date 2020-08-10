const { EIP712Signer } = require('@ticket721/e712');

const snapshot = () => {
    return new Promise((ok, ko) => {
        web3.currentProvider.send({
            method: 'evm_snapshot',
            params: [],
            jsonrpc: '2.0',
            id: new Date().getTime(),
        }, (error, res) => {
            if (error) {
                return ko(error);
            } else {
                ok(res.result);
            }
        });
    });
};

const revert = (snap_id) => {
    return new Promise((ok, ko) => {
        web3.currentProvider.send({
            method: 'evm_revert',
            params: [snap_id],
            jsonrpc: '2.0',
            id: new Date().getTime(),
        }, (error, res) => {
            if (error) {
                return ko(error);
            } else {
                ok(res.result);
            }
        });
    });
};

const Authorization = [
    {
        name: 'emitter',
        type: 'address',
    },
    {
        name: 'grantee',
        type: 'address',
    },
    {
        name: 'hash',
        type: 'bytes32',
    },
];

class Authorizer extends EIP712Signer {
    constructor(chain_id, address) {
        super({
                name: 'T721 Admin',
                version: '0',
                chainId: chain_id,
                verifyingContract: address,
            },
            ['Authorization', Authorization],
        );
    }
}

const encodeAndHash  = (types, args) => {
    return web3.utils.keccak256(Buffer.from(web3.eth.abi.encodeParameters(types, args).slice(2), 'hex'));
};

module.exports = {
    revert,
    snapshot,
    Authorizer,
    encodeAndHash
};
