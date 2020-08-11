const ethers = require('ethers');
const { BigNumber } = require('ethers/utils');
const { EIP712Signer } = require('@ticket721/e712');

const snapshot = () => {
    return new Promise((ok, ko) => {
        web3.currentProvider.send({
            method: 'evm_snapshot',
            params: [],
            jsonrpc: '2.0',
            id: new Date().getTime()
        }, (error, res) => {
            if (error) {
                return ko(error);
            } else {
                ok(res.result);
            }
        })
    })
};

const revert = (snap_id) => {
    return new Promise((ok, ko) => {
        web3.currentProvider.send({
            method: 'evm_revert',
            params: [snap_id],
            jsonrpc: '2.0',
            id: new Date().getTime()
        }, (error, res) => {
            if (error) {
                return ko(error);
            } else {
                ok(res.result);
            }
        })
    })
};

const strToB32 = (str) => {
    let hex = strhex(str);
    if (hex.length % 2) {
        hex = `0${hex}`;
    }

    const pad = 64 - hex.length;

    return `0x${hex}${"0".repeat(pad)}`;
};

const Authorization = [
    {
        name: 'emitter',
        type: 'address'
    },
    {
        name: 'grantee',
        type: 'address'
    },
    {
        name: 'hash',
        type: 'bytes32'
    }
];

class Authorizer extends EIP712Signer {
    constructor(chain_id, address) {
        super({
                name: 'MetaMarketplace',
                version: '0',
                chainId: chain_id,
                verifyingContract: address
            },
            ['Authorization', Authorization]
        );
    }
}

const encodeAndHash  = (types, args) => {
    return web3.utils.keccak256(Buffer.from(web3.eth.abi.encodeParameters(types, args).slice(2), 'hex'));
};

const encodeU256 = (num) => {
    return web3.eth.abi.encodeParameters(['uint256'], [num]).slice(2);
};

const encodeAddress = (address) => {
    return web3.eth.abi.encodeParameters(['address'], [address]).slice(2);
};

const generateSealSalePayload = async (id, payments, ticket_id, nonce, expiration, buyer, seller, event_controller, fee_collector, signer, mmaddress) => {

    const uints = [];
    const addr = [];
    let prices = '0x';

    expiration = new Date(Math.floor(expiration.getTime() / 1000));


    addr.push(buyer.address);
    addr.push(seller.address);
    addr.push(event_controller.address);
    addr.push(fee_collector);
    uints.push(payments.length);

    for (const payment of payments) {
        // Add Price
        uints.push(payment.amount);
        prices = `${prices}${encodeU256(payment.amount)}`;
        uints.push(payment.fee);
        prices = `${prices}${encodeU256(payment.fee)}`;
        addr.push(payment.currency);
        prices = `${prices}${encodeAddress(payment.currency)}`;
    }

    uints.push(`0x${ticket_id.toString(16)}`);
    uints.push(`0x${nonce.toString(16)}`);
    uints.push(`0x${expiration.getTime().toString(16)}`);

    const hash = encodeAndHash(
        ['string', 'bytes', 'address', 'address', 'address', 'uint256', 'uint256', 'uint256'],
        ['sealSale', prices, buyer.address, seller.address, event_controller.address, `0x${ticket_id.toString(16)}`, `0x${nonce.toString(16)}`, `0x${expiration.getTime().toString(16)}`]
    );

    const buyerPayload = signer.generatePayload({
        emitter: buyer.address,
        grantee: mmaddress,
        hash,
    }, 'Authorization');

    const sellerPayload = signer.generatePayload({
        emitter: seller.address,
        grantee: mmaddress,
        hash,
    }, 'Authorization');

    const eventControllerPayload = signer.generatePayload({
        emitter: event_controller.address,
        grantee: mmaddress,
        hash,
    }, 'Authorization');

    const buyerSignature = await signer.sign(
        buyer.privateKey,
        buyerPayload
    );

    const sellerSignature = await signer.sign(
        seller.privateKey,
        sellerPayload
    );

    const eventControllerSignature = await signer.sign(
        event_controller.privateKey,
        eventControllerPayload
    );

    const bs = `0x${buyerSignature.hex.slice(2)}${sellerSignature.hex.slice(2)}${eventControllerSignature.hex.slice(2)}`;

    return [id, uints, addr, bs];
};

const ZERO = '0x0000000000000000000000000000000000000000';
const ZEROSIG = `0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`;

module.exports = {
    ZERO,
    ZEROSIG,
    revert,
    snapshot,
    Authorizer,
    encodeAndHash,
    encodeU256,
    encodeAddress,
    strToB32,
    generateSealSalePayload
};
