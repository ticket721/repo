import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { Injectable } from '@nestjs/common';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { toAcceptedAddressFormat } from '@ticket721sources/global';

/**
 * Smart Contract Controller for the RefractFactory_v0 contract
 */
@Injectable()
export class RefractFactoryV0Service extends ContractsControllerBase {
    /**
     * Dependency Injection
     *
     * @param contractsService
     * @param web3Service
     * @param shutdownService
     */
    constructor(
        contractsService: ContractsService,
        web3Service: Web3Service,
        shutdownService: ShutdownService,
    ) {
        super(
            contractsService,
            web3Service,
            shutdownService,
            'refract',
            'RefractFactory_v0',
        );
    }

    /**
     * Recover current nonce for given Refract Wallet
     *
     * @param refract
     */
    public async getNonce(refract: string): Promise<number> {
        const code = await (await this.web3Service.get()).eth.getCode(refract);

        if (code === '0x') {
            return 0;
        }

        const refractInstance = new ContractsControllerBase(
            this.contractsService,
            this.web3Service,
            this.shutdownService,
            'refract',
            'RefractWallet_v0',
            {
                address: refract,
            },
        );

        return (await refractInstance.get()).methods.nonce().call();
    }

    /**
     * Checks if given address is a controller of given Refract Wallet
     *
     * @param refract
     * @param controller
     * @param salt
     */
    public async isController(
        refract: string,
        controller: string,
        salt: string,
    ): Promise<boolean> {
        const code = await (await this.web3Service.get()).eth.getCode(refract);

        if (code === '0x') {
            const finalAddress: string = toAcceptedAddressFormat(
                await (await this.get()).methods
                    .predict(controller, salt)
                    .call(),
            );

            return toAcceptedAddressFormat(refract) === finalAddress;
        } else {
            const refractInstance = new ContractsControllerBase(
                this.contractsService,
                this.web3Service,
                this.shutdownService,
                'refract',
                'RefractWallet_v0',
                {
                    address: refract,
                },
            );

            return await (await refractInstance.get()).methods.isController(
                controller,
            );
        }
    }

    /**
     * Encodes a Refract Wallet MetaTransaction
     *
     * @param refract
     * @param controller
     * @param salt
     * @param nonce
     * @param addr
     * @param nums
     * @param bdata
     */
    public async encodeCall(
        refract: string,
        controller: string,
        salt: string,
        nonce: number,
        addr: string[],
        nums: string[],
        bdata: string,
    ): Promise<[string, string]> {
        const code = await (await this.web3Service.get()).eth.getCode(refract);

        if (code === '0x') {
            const factory = await this.get();
            const factoryCall = factory.methods
                .mtxAndDeploy(controller, salt, addr, nums, bdata)
                .encodeABI();

            return [factory._address, factoryCall];
        } else {
            const refractInstance = new ContractsControllerBase(
                this.contractsService,
                this.web3Service,
                this.shutdownService,
                'refract',
                'RefractWallet_v0',
                {
                    address: refract,
                },
            );

            return [
                refract,
                (await refractInstance.get()).methods
                    .mtx(nonce, addr, nums, bdata)
                    .encodeABI(),
            ];
        }
    }
}
