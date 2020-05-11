import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { ContractsService, ContractsServiceOptions } from '@lib/common/contracts/Contracts.service';
import { Inject, Injectable } from '@nestjs/common';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { FSService } from '@lib/common/fs/FS.service';
import path from 'path';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { BytesToolService } from '@lib/common/toolbox/Bytes.tool.service';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { MintTokensAuthorization } from '@common/global';
import { RocksideService } from '@lib/common/rockside/Rockside.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';

/**
 * Smart Contract Controller for the T721Token contract
 */
@Injectable()
export class T721TokenService extends ContractsControllerBase {
    /**
     * Minter address to generate authorizations
     */
    private minter: string = null;

    /**
     * Identity address to broadcast the transactions
     */
    private identity: string = null;

    /**
     * Dependency Injection
     *
     * @param contractsService
     * @param web3Service
     * @param shutdownService
     */
    /* istanbul ignore next */
    constructor(
        contractsService: ContractsService,
        web3Service: Web3Service,
        shutdownService: ShutdownService,
        private readonly rocksideService: RocksideService,
        private readonly authorizationsService: AuthorizationsService,
        private readonly t721AdminService: T721AdminService,
        @Inject('CONTRACTS_MODULE_OPTIONS')
        private readonly contractsOptions: ContractsServiceOptions,
        private readonly configService: ConfigService,
        private readonly fsService: FSService,
        private readonly bytesToolService: BytesToolService,
    ) {
        super(contractsService, web3Service, shutdownService, 't721token', 'T721Token');
    }

    /**
     * Utility to retrieve the minter / identity of this server instance
     */
    async getMinter(): Promise<[string, string]> {
        if (this.minter === null) {
            const minterAddressIndex = parseInt(this.configService.get('MINTER_INDEX'), 10);

            try {
                const mintersList = JSON.parse(
                    this.fsService.readFile(
                        path.join(
                            this.contractsOptions.artifact_path,
                            'minter_management',
                            'artifacts',
                            'minters.json',
                        ),
                    ),
                );
                const identitiesList = JSON.parse(
                    this.fsService.readFile(
                        path.join(
                            this.contractsOptions.artifact_path,
                            'minter_management',
                            'artifacts',
                            'identities.json',
                        ),
                    ),
                );
                this.minter = mintersList[minterAddressIndex];
                this.identity = identitiesList[minterAddressIndex];
            } catch (e) {
                this.shutdownService.shutdownWithError(
                    new Error(`Unable to resolve minter address required to create tokens: ${e.message}`),
                );
            }
        }
        return [this.minter, this.identity];
    }

    /**
     * Internal utility to generate a unique code for the authorization
     */
    private async generateCode(): Promise<string> {
        let code: string;
        let available: boolean = false;

        const T721AdminInstance = await this.t721AdminService.get();

        do {
            code = `0x${this.bytesToolService.randomBytes(31)}`;
            available = await T721AdminInstance.methods.isCodeConsumable(code).call();
        } while (!available);

        return code;
    }

    /**
     * Generat the authorization required to mint the tokens
     *
     * @param grantee
     * @param amount
     */
    async generateAuthorization(
        grantee: string,
        amount: string,
    ): Promise<ServiceResponse<[AuthorizationEntity, string, string, string]>> {
        let code;

        try {
            code = await this.generateCode();
        } catch (e) {
            console.error(e);
            return {
                error: 'code_generation_error',
                response: null,
            };
        }

        const t721AdminInstance = await this.t721AdminService.get();
        const t721AdminAddress = t721AdminInstance._address;
        const net = await this.web3Service.net();

        const signer = await new MintTokensAuthorization(t721AdminAddress, net);

        const [minter, sender] = await this.getMinter();

        const hash = MintTokensAuthorization.encodeAndHash(grantee, amount, minter, code);

        const payload = signer.generatePayload(
            {
                emitter: minter,
                grantee,
                hash,
            },
            'Authorization',
        );

        const signedPayload = await signer.sign(this.rocksideService.getSigner(minter), payload);

        const authorizationCreationRes = await this.authorizationsService.create({
            granter: minter,
            grantee,
            mode: 'mintTokens',
            codes: MintTokensAuthorization.toCodesFormat(code),
            selectors: MintTokensAuthorization.toSelectorFormat(grantee, amount),
            args: MintTokensAuthorization.toArgsFormat(grantee, amount, minter, code),
            signature: signedPayload.hex,
            readable_signature: false,
            cancelled: false,
            consumed: false,
            dispatched: false,
            user_expiration: null,
            be_expiration: null,
        });

        if (authorizationCreationRes.error) {
            return {
                error: authorizationCreationRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: [authorizationCreationRes.response, code, sender, minter],
        };
    }
}
