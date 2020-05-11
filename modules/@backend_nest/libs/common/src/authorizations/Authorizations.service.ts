import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { AuthorizationsRepository } from '@lib/common/authorizations/Authorizations.repository';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { CurrenciesService, ERC20Currency, Price } from '@lib/common/currencies/Currencies.service';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { HOUR } from '@lib/common/utils/time';
import { MintAuthorization, toB32 } from '@common/global';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { AuthorizedTicketMintingFormat, TicketMintingFormat } from '@lib/common/utils/Cart.type';
import { EIP712Signature } from '@ticket721/e712/lib';
import { BytesToolService } from '@lib/common/toolbox/Bytes.tool.service';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { GroupService } from '@lib/common/group/Group.service';
import { RocksideService } from '@lib/common/rockside/Rockside.service';

/**
 * Service to CRUD AuthorizationEntities
 */
export class AuthorizationsService extends CRUDExtension<AuthorizationsRepository, AuthorizationEntity> {
    /**
     * Dependency injection
     *
     * @param authorizationsRepository
     * @param authorizationEntity
     * @param categoriesService
     * @param t721ControllerV0Service
     * @param currenciesService
     * @param web3Service
     * @param bytesToolService
     * @param timeToolService
     * @param groupService
     * @param rocksideService
     */
    constructor(
        @InjectRepository(AuthorizationsRepository)
        authorizationsRepository: AuthorizationsRepository,
        @InjectModel(AuthorizationEntity)
        authorizationEntity: BaseModel<AuthorizationEntity>,
        private readonly categoriesService: CategoriesService,
        private readonly t721ControllerV0Service: T721ControllerV0Service,
        private readonly currenciesService: CurrenciesService,
        private readonly web3Service: Web3Service,
        private readonly bytesToolService: BytesToolService,
        private readonly timeToolService: TimeToolService,
        private readonly groupService: GroupService,
        private readonly rocksideService: RocksideService,
    ) {
        super(
            authorizationEntity,
            authorizationsRepository,
            /* istanbul ignore next */
            (e: AuthorizationEntity) => {
                return new authorizationEntity(e);
            },
            /* istanbul ignore next */
            (c: AuthorizationEntity) => {
                return new AuthorizationEntity(c);
            },
        );
    }

    /**
     * Internal uility to generate a unique authorization code for a ticket minting
     *
     * @param owner
     */
    private async getUniqueAuthorizationCode(owner: string): Promise<string> {
        const instance = await this.t721ControllerV0Service.get();

        let isCodeConsummable: boolean = false;
        let randomBytes: string;

        do {
            randomBytes = `0x${this.bytesToolService.randomBytes(31)}`;

            isCodeConsummable = await instance.methods.isCodeConsummable(owner, randomBytes).call();
        } while (!isCodeConsummable);

        return randomBytes;
    }

    /**
     * Utility to generate authorizations. Does 0 checks, should be made before calling
     *
     * @param authorizations
     * @param prices
     * @param fees
     * @param expirationTime
     * @param grantee
     * @param signatureReadable
     */
    async validateTicketAuthorizations(
        authorizations: TicketMintingFormat[],
        prices: Price[],
        fees: string[],
        expirationTime: number,
        grantee: string,
        signatureReadable: boolean,
    ): Promise<ServiceResponse<AuthorizedTicketMintingFormat[]>> {
        if (prices.length !== fees.length) {
            return {
                error: 'invalid_fee_price_lengths',
                response: null,
            };
        }

        const ret: AuthorizedTicketMintingFormat[] = [];

        const resolvedPrices: {
            currency: string;
            value: string;
            fee: string;
        }[] = [];

        for (let idx = 0; idx < prices.length; ++idx) {
            const price = prices[idx];
            const currency = (await this.currenciesService.get(price.currency)) as ERC20Currency;

            resolvedPrices.push({
                currency: currency.address,
                value: price.value,
                fee: fees[idx],
            });
        }

        const encodedPrices = MintAuthorization.encodePrices(resolvedPrices);

        const signer = new MintAuthorization(
            (await this.t721ControllerV0Service.get())._address,
            await this.web3Service.net(),
        );

        const evmExpiration = Math.floor((this.timeToolService.now().getTime() + expirationTime) / 1000);
        const beExpiration = Math.floor((this.timeToolService.now().getTime() + expirationTime + HOUR) / 1000);

        for (const authorization of authorizations) {
            const categoryEntityRes = await this.categoriesService.search({
                id: authorization.categoryId,
            });

            if (categoryEntityRes.error) {
                return {
                    error: categoryEntityRes.error,
                    response: null,
                };
            }

            if (categoryEntityRes.response.length === 0) {
                return {
                    error: 'cannot_find_category',
                    response: null,
                };
            }

            const category: CategoryEntity = categoryEntityRes.response[0];

            const controllerInfos = await this.groupService.getCategoryControllerFields<[string, string]>(category, [
                'address',
                'controller',
            ]);

            if (controllerInfos.error) {
                return {
                    error: controllerInfos.error,
                    response: null,
                };
            }

            const controllerAddress = controllerInfos.response[0];
            const controllerName = controllerInfos.response[1];

            const uniqueCode = await this.getUniqueAuthorizationCode(controllerAddress);

            const encodedAuthorization = signer.encodeAndHash(
                encodedPrices,
                category.group_id,
                toB32(category.category_name),
                uniqueCode,
                evmExpiration,
            );

            const payload = signer.generatePayload(
                {
                    emitter: controllerAddress,
                    grantee,
                    hash: encodedAuthorization,
                },
                'Authorization',
            );

            const rocksideSigner = await this.rocksideService.getSigner(controllerName);
            let signature: EIP712Signature;

            try {
                signature = await signer.sign(rocksideSigner, payload);
            } catch (e) {
                console.error(e);
                return {
                    error: 'rockside_signature_failure',
                    response: null,
                };
            }

            const authorizationCreationRes = await this.create({
                grantee,
                granter: controllerAddress,
                mode: 'mint',
                signature: signature.hex,
                readable_signature: signatureReadable,
                cancelled: false,
                consumed: false,
                dispatched: false,
                codes: MintAuthorization.toCodesFormat(uniqueCode),
                args: MintAuthorization.toArgsFormat(
                    encodedPrices,
                    category.group_id,
                    toB32(category.category_name),
                    uniqueCode,
                    evmExpiration,
                ),
                selectors: MintAuthorization.toSelectorFormat(category.group_id, toB32(category.category_name)),
                user_expiration: new Date(evmExpiration * 1000),
                be_expiration: new Date(beExpiration * 1000),
            });

            if (authorizationCreationRes.error) {
                return {
                    error: authorizationCreationRes.error,
                    response: null,
                };
            }

            ret.push({
                categoryId: category.id,
                authorizationId: authorizationCreationRes.response.id,
                price: authorization.price,
                groupId: category.group_id,
                categoryName: category.category_name,
                granter: controllerAddress,
                grantee,
                granterController: controllerName,
                expiration: new Date(evmExpiration * 1000),
            });
        }

        return {
            error: null,
            response: ret,
        };
    }
}
