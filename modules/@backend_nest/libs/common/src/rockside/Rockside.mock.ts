import {
    EncryptedAccount,
    ExecuteTransaction,
    IdentityResponse,
    RocksideApiOpts,
    EncryptedWallet, TransactionOpts,
}                                                                                         from '@rocksideio/rockside-wallet-sdk/lib/api';
import { ContractsControllerBase }                                                                      from '@lib/common/contracts/ContractsController.base';
import { createWallet, keccak256FromBuffer, toAcceptedAddressFormat, loadWallet, Wallet, decimalToHex } from '@common/global';
import { FSService }                                                                                    from '@lib/common/fs/FS.service';
import { Web3Service }                                                                    from '@lib/common/web3/Web3.service';
import { Web3Provider }                                                                   from 'ethers/providers';
import { utils }                                                                          from 'ethers';
import BN                                                                                 from 'bn.js';

export type SignTransactionOpts = {
    from: string;
    to: string;
    value?: string | number | BigInt;
    data?: string;
    gas?: string | number | BigInt;
    gasPrice?: string | number | BigInt;
}

export interface RocksideMockOpts {
    /**
     * This is the private key of an account with a lot of eth to broadcast the transactions
     */
    orchestratorPrivateKey: string;

    /**
     * This is the Contract Controller able to generate the mock smart wallets
     */
    identitiesMockController: ContractsControllerBase;

    /**
     * Service to connect to the ethereum network
     */
    web3Service: Web3Service;

    /**
     * FS Service to properly read / write filesystem
     */
    fsService: FSService;
}

export class RocksideMock /* implements RocksideApi */ {
    constructor(
        private readonly opts: RocksideApiOpts,
        private readonly mockOpts: RocksideMockOpts,
    ) {
    }

    private async generateWallet(): Promise<{ address: string; privateKey: string; }> {
        const wallet = await createWallet();
        const address = toAcceptedAddressFormat(wallet.address);
        this.mockOpts.fsService.writeFile(`/tmp/ROCKSIDE_MOCK_EOA_${address}`, wallet.privateKey);
        return {
            address,
            privateKey: wallet.privateKey,
        };
    }

    private async getWallet(address: string): Promise<string> {
        const formattedAddress = toAcceptedAddressFormat(address);
        return this.mockOpts.fsService.readFile(`/tmp/ROCKSIDE_MOCK_EOA_${formattedAddress}`);
    }

    async getIdentities(): Promise<string[]> {
        const ret: string[] = [];
        const tmpFiles = this.mockOpts.fsService.readDir(`/tmp`);
        for (const file of tmpFiles) {
            if (/^ROCKSIDE_MOCK_IDENTITY_/.test(file)) {
                ret.push(file.slice(23));
            }
        }
        return ret;
    }

    async getEOAs(): Promise<string[]> {
        const ret: string[] = [];
        const tmpFiles = this.mockOpts.fsService.readDir(`/tmp`);
        for (const file of tmpFiles) {
            if (/^ROCKSIDE_MOCK_EOA_/.test(file)) {
                ret.push(file.slice(18));
            }
        }
        return ret;
    }

    async createEOA(): Promise<{ address: string }> {
        const newEOA = await this.generateWallet();
        return {
            address: newEOA.address,
        };
    }

    async signTransactionWithEOA(eoa: string, opts: SignTransactionOpts): Promise<{ signed_transaction: string }> {
        throw new Error(`Un-mocked method`);
    }

    private _fromSigned(num: string): BN {
        return new BN(Buffer.from(num.slice(2), 'hex')).fromTwos(256);
    }

    private _padWithZeroes(toPad: string, length: number): string {
        let myString = '' + toPad;
        while (myString.length < length) {
            myString = '0' + myString;
        }
        return myString;
    }

    private _toUnsigned(num: BN): Buffer {
        return Buffer.from(num.toTwos(256).toArray());
    }

    async signMessageWithEOA(eoa: string, hash: string): Promise<{ signed_message: string }> {

        const formattedEOA = toAcceptedAddressFormat(eoa);

        const privateKey = this.mockOpts.fsService.readFile(`/tmp/ROCKSIDE_MOCK_EOA_${formattedEOA}`);

        const sk = new utils.SigningKey(privateKey);

        const signature = sk.signDigest(Buffer.from(hash.slice(2), 'hex'));

        const rSig = this._fromSigned(signature.r);
        const sSig = this._fromSigned(signature.s);
        const vSig = signature.v;
        const rStr = this._padWithZeroes(this._toUnsigned(rSig).toString('hex'), 64);
        const sStr = this._padWithZeroes(this._toUnsigned(sSig).toString('hex'), 64);
        const vStr = vSig.toString(16);

        return {
            signed_message: `0x${rStr}${sStr}${vStr}`
        };

    }

    async createIdentity(): Promise<IdentityResponse> {

        const wallet = await this.generateWallet();
        const hash = keccak256FromBuffer(Buffer.from(wallet.address.slice(2), 'hex'));

        const identitiesContract = await this.mockOpts.identitiesMockController.get();

        const predictedAddress = toAcceptedAddressFormat(await identitiesContract.methods.predict(wallet.address, hash).call());

        this.mockOpts.fsService.writeFile(`/tmp/ROCKSIDE_MOCK_IDENTITY_${predictedAddress}`, wallet.address);

        return {
            address: predictedAddress,
            transactionHash: null,
        };
    }

    async sendTransaction(tx: TransactionOpts): Promise<{ transaction_hash: string, tracking_id: string }> {

        const web3Instance = await this.mockOpts.web3Service.get();

        const web3Provider = new Web3Provider(web3Instance.currentProvider);
        const orchestratorWallet: Wallet = new Wallet(this.mockOpts.orchestratorPrivateKey, web3Provider);
        const owner = toAcceptedAddressFormat(tx.from);

        const controllerAddress = this.mockOpts.fsService.readFile(`/tmp/ROCKSIDE_MOCK_IDENTITY_${owner}`);

        const hash = keccak256FromBuffer(Buffer.from(controllerAddress.slice(2), 'hex'));

        const identitiesMockInstance = (await this.mockOpts.identitiesMockController.get());

        const encodedCall = identitiesMockInstance.methods.dotx(controllerAddress, hash, tx.to, tx.value || '0', tx.data || '').encodeABI();

        const sentTransaction = await orchestratorWallet.sendTransaction({
            to: identitiesMockInstance._address,
            data: encodedCall,
            gasLimit: decimalToHex(tx.gas as string),
            gasPrice: decimalToHex(tx.gasPrice as string),
        });

        return {
            transaction_hash: sentTransaction.hash,
            tracking_id: `tr_${sentTransaction.hash}`,
        };

    }

    async createEncryptedAccount(account: EncryptedAccount) {
        throw new Error(`Un-mocked method`);
    }

    async connectEncryptedAccount(username: string, passwordHash: ArrayBuffer): Promise<{ data: ArrayBuffer, iv: ArrayBuffer }> {
        throw new Error(`Un-mocked method`);
    }

    async createEncryptedWallet(account: EncryptedAccount, wallet: EncryptedWallet) {
        throw new Error(`Un-mocked method`);
    }

    async getEncryptedWallets(username: string, passwordHash: ArrayBuffer): Promise<Array<EncryptedWallet>> {
        throw new Error(`Un-mocked method`);
    }

    async deployIdentityContract(address: string): Promise<{ address: string, txHash: string }> {
        throw new Error(`Un-mocked method`);
    }

    async getRelayNonce(identity: string, account: string, channel: number): Promise<number> {
        throw new Error(`Un-mocked method`);
    }

    async relayTransaction(identity: string, tx: ExecuteTransaction): Promise<string> {
        throw new Error(`Un-mocked method`);
    }

    getRpcUrl(): string {
        throw new Error(`Un-mocked method`);
    }

    getToken(): string {
        throw new Error(`Un-mocked method`);
    }
}
