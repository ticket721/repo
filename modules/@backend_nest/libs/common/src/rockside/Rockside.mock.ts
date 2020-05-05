import {
    EncryptedAccount,
    ExecuteTransaction,
    IdentityResponse,
    RocksideApi,
    RocksideApiOpts,
    EncryptedWallet,
}                                                                                         from '@rocksideio/rockside-wallet-sdk/lib/api';
import { ContractsControllerBase }                                                        from '@lib/common/contracts/ContractsController.base';
import { createWallet, keccak256FromBuffer, toAcceptedAddressFormat, loadWallet, Wallet } from '@common/global';
import { FSService }                                                                      from '@lib/common/fs/FS.service';
import { Web3Service }                                                                    from '@lib/common/web3/Web3.service';
import { Web3Provider }                                                                   from 'ethers/providers';

export type TransactionOpts = {
    from: string;
    to: string;
    value?: string | number | BigInt;
    gas?: string | number | BigInt;
    gasPrice?: string | number | BigInt;
    data?: string;
    nonce?: number;
}

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
    ) {}

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

    async signMessageWithEOA(eoa: string, hash: string): Promise<{ signed_message: string }> {

        const formattedEOA = toAcceptedAddressFormat(eoa);

        const privateKey = this.mockOpts.fsService.readFile(`/tmp/ROCKSIDE_MOCK_EOA_${formattedEOA}`);

        const wallet = new Wallet(privateKey);

        const signature = await wallet.signMessage(Buffer.from(hash.slice(2), 'hex'));

        return {
            signed_message: signature
        }
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

        const web3Provider = new Web3Provider(web3Instance);
        const orchestratorWallet: Wallet = new Wallet(this.mockOpts.orchestratorPrivateKey, web3Provider);
        const owner = tx.from;
        const hash = keccak256FromBuffer(Buffer.from(tx.from.slice(2), 'hex'));

        const identitiesMockInstance = (await this.mockOpts.identitiesMockController.get());

        const encodedCall = identitiesMockInstance.methods.dotx(owner, hash, tx.to, tx.value || '0', tx.data || '').encodeABI();

        const sentTransaction = await orchestratorWallet.sendTransaction({
            from: orchestratorWallet.address,
            to: identitiesMockInstance._address,
            data: encodedCall
        });

        return {
            transaction_hash: sentTransaction.hash,
            tracking_id: `tr_${sentTransaction.hash}`
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
