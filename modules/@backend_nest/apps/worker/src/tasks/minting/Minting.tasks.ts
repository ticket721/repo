import { OnModuleInit }                            from '@nestjs/common';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { InjectQueue }             from '@nestjs/bull';
import { Job, Queue }                       from 'bull';
import { ShutdownService }                  from '@lib/common/shutdown/Shutdown.service';
import { ActionSet }                        from '@lib/common/actionsets/helper/ActionSet.class';
import { ActionSetsService }                from '@lib/common/actionsets/ActionSets.service';
import { T721TokenService }                                   from '@lib/common/contracts/T721Token.service';
import { T721ControllerV0Service }                            from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { CheckoutResolve }                                    from '@app/worker/actionhandlers/checkout/Checkout.input.handlers';
import { CartAuthorizations }                                 from '@app/worker/actionhandlers/cart/Cart.input.handlers';
import BigNumber                                                              from 'bignumber.js';
import { getT721ControllerGroupID, MintAuthorization, TransactionParameters } from '@common/global';
import { ScopeBinding, TicketforgeService }                                   from '@lib/common/contracts/Ticketforge.service';
import { ConfigService }                                      from '@lib/common/config/Config.service';
import { ContractsControllerBase }                            from '@lib/common/contracts/ContractsController.base';
import { T721AdminService }                                   from '@lib/common/contracts/T721Admin.service';
import { AuthorizedTicketMintingFormat, TicketMintingFormat } from '@lib/common/utils/Cart.type';
import { AuthorizationsService }                              from '@lib/common/authorizations/Authorizations.service';
import { AuthorizationEntity }                                from '@lib/common/authorizations/entities/Authorization.entity';
import { CurrenciesService, ERC20Currency, Price }           from '@lib/common/currencies/Currencies.service';
import { TransactionLifecycles, TxSequenceAcsetBuilderArgs } from '@lib/common/txs/acset_builders/TxSequence.acsetbuilder.helper';
import { UsersService }                                      from '@lib/common/users/Users.service';
import { UserDto }                                            from '@lib/common/users/dto/User.dto';
import { CategoriesService }                                  from '@lib/common/categories/Categories.service';
import { GroupService }                                       from '@lib/common/group/Group.service';
import { TicketsService, TicketsServicePredictionInput }      from '@lib/common/tickets/Tickets.service';
import { TicketEntity }                                       from '@lib/common/tickets/entities/Ticket.entity';
import { ServiceResponse }                                    from '@lib/common/utils/ServiceResponse.type';

export interface TicketMintingTransactionSequenceBuilderTaskInput {
    cartActionSetId: string;
    checkoutActionSetId: string;
    gemOrderId?: string;
}

export interface TicketMintingTransactionConfirmed {
    transactionHash: string;
    tickets: string[];
    authorizations: string[][];
}

export interface TicketMintingTransactionFailure {
    transactionHash: string;
    tickets: string[];
    authorizations: string[][];
}

export class MintingTasks implements OnModuleInit {

    constructor(
        @InjectQueue('minting') private readonly mintingQueue: Queue,
        @InjectQueue('tx') private readonly txQueue: Queue,
        private readonly outrospectionService: OutrospectionService,
        private readonly shutdownService: ShutdownService,
        private readonly actionSetsService: ActionSetsService,
        private readonly t721TokenService: T721TokenService,
        private readonly t721AdminService: T721AdminService,
        private readonly ticketforgeService: TicketforgeService,
        private readonly configService: ConfigService,
        private readonly currenciesService: CurrenciesService,
        private readonly authorizationsService: AuthorizationsService,
        private readonly categoriesService: CategoriesService,
        private readonly usersService: UsersService,
        private readonly groupService: GroupService,
        private readonly ticketsService: TicketsService,
    ) {
    }

    private async fetchAndVerifyCheckout(checkoutId: string): Promise<ActionSet> {
        const checkoutActionSetRes = await this.actionSetsService.search({
            id: checkoutId
        });

        if (checkoutActionSetRes.error || checkoutActionSetRes.response.length === 0) {
            throw new Error(`Unable to recover checkout for minting initialization`);
        }

        const checkout: ActionSet = new ActionSet().load(checkoutActionSetRes.response[0]);

        return checkout;
    };

    private async fetchAndVerifyCart(cartId: string): Promise<ActionSet> {
        const cartActionSetRes = await this.actionSetsService.search({
            id: cartId
        });

        if (cartActionSetRes.error || cartActionSetRes.response.length === 0) {
            throw new Error(`Unable to recover cart for minting initialization`);
        }

        const cart: ActionSet = new ActionSet().load(cartActionSetRes.response[0]);

        return cart;
    };

    private async evaluateTokenAmountToAuthorize(checkout: ActionSet, cart: ActionSet, t721Controller: ContractsControllerBase): Promise<string> {
        const checkoutInputData: CheckoutResolve = checkout.actions[0].data;
        const cartAuthorizations: CartAuthorizations = cart.actions[cart.actions.length - 1].data;
        const t721ControllerAddress = (await t721Controller.get())._address;

        if (cartAuthorizations.total.length === 0) {
            return '0';
        }

        if (cartAuthorizations.total.length > 1) {
            throw new Error('Multiple currencies not allowed');
        }

        if (cartAuthorizations.total[0].currency !== 'T721Token') {
            throw new Error('Only T721Token allowed');
        }

        const currentlyAuthorizedAmount = (await (await this.t721TokenService.get()).methods.allowance(checkoutInputData.buyer, t721ControllerAddress).call()).toString();

        const totalRequiredAmount = cartAuthorizations.total[0].value;

        if (new BigNumber(currentlyAuthorizedAmount).gte(new BigNumber(totalRequiredAmount))) {
            return '0';
        }

        return new BigNumber(totalRequiredAmount).minus(new BigNumber(currentlyAuthorizedAmount)).toString();
    }

    private async getTokenAuthorizationPayload(amount: string, buyer: string, t721Controller: ContractsControllerBase): Promise<TransactionParameters> {
        try {
            const parameters: TransactionParameters = {
                from: buyer,
                to: (await this.t721TokenService.get())._address,
                data: (await this.t721TokenService.get()).methods.approve((await t721Controller.get())._address, amount).encodeABI(),
                value: '0'
            };

            return parameters;
        } catch (e) {
            throw new Error(`Unable to create token approval call: ${e.message}`)
        }
    }

    private async generateTicketMintingTransactions(authorizations: AuthorizedTicketMintingFormat[], prices: Price[], fees: string[], t721Controller: ContractsControllerBase): Promise<TransactionParameters & Partial<TransactionLifecycles>> {
        const codes: string[] = [];
        const signature: string[] = [];
        let expiration: string = null;

        const resolvedPrices: Price[] = [];

        for (const price of prices) {
            const currency = await this.currenciesService.get(price.currency);

            if (currency.type !== 'erc20') {
                throw new Error(`Invalid currency type on final step: ${currency.type}`)
            }

            const erc20Currency: ERC20Currency = currency as ERC20Currency;

            resolvedPrices.push({
                currency: erc20Currency.address,
                value: price.value,
                log_value: price.log_value
            });
        }

        for (const authorization of authorizations) {

            const authorizationEntityRes = await this.authorizationsService.search({
                id: authorization.authorizationId,
                granter: authorization.granter,
                grantee: authorization.grantee,
                mode: 'mint'
            });

            if (authorizationEntityRes.error || authorizationEntityRes.response.length === 0) {
                throw new Error(`Cannot fetch or find authorization entity ${authorization.authorizationId}: ${authorizationEntityRes.error || 'authorization not found'}`)
            }

            const authorizationEntity: AuthorizationEntity = authorizationEntityRes.response[0];

            codes.push(authorizationEntity.getCodes()[0]);
            signature.push(authorizationEntity.signature);

            const args = authorizationEntity.getArgs();

            if (expiration === null) {
                expiration = args[args.length - 1];
            } else {
                if (expiration !== args[args.length - 1]) {
                    throw new Error(`Cannot proceed with authorizations with different expirations`);
                }
            }

        }

        const adminAddress = (await this.t721AdminService.get())._address;
        const scopeName = (this.configService.get('TICKETFORGE_SCOPE'));

        const scopeInfos = await (await this.ticketforgeService.get()).methods.getScope(scopeName).call();

        if (scopeInfos.exists === false) {
            throw new Error(`Current server ticketforge scope does not exist`);
        }

        const scopeIndex = scopeInfos.scope_index;

        const controllerIdRes = (await this.groupService.getGroupIDControllerFields<[string]>(authorizations[0].groupId, ['id']));

        if (controllerIdRes.error) {
            throw new Error(`Unable to recover controller id used for the group_id generation`)
        }

        const controllerId = controllerIdRes.response[0].toLowerCase();

        const rawArgs = MintAuthorization.getMethodArgs(
            controllerId,
            authorizations[0].granter,
            adminAddress,
            authorizations.map((atmf: AuthorizedTicketMintingFormat): string => atmf.grantee),
            authorizations.map((atmf: AuthorizedTicketMintingFormat): string => atmf.categoryName),
            resolvedPrices.map((price: Price): string => price.currency),
            resolvedPrices.map((price: Price): string => price.value),
            fees,
            codes,
            signature,
            expiration,
            scopeIndex.toString(),
        );

        const generatedTicketsRes = await this.generateTickets(authorizations);

        if (generatedTicketsRes.error) {
            throw new Error(`Unable to generate ticket before minting: ${generatedTicketsRes.error}`)
        }

        return {
            from: authorizations[0].grantee,
            to: (await t721Controller.get())._address,
            data: (await t721Controller.get()).methods.mint(
                ...rawArgs
            ).encodeABI(),
            value: '0',
            onConfirm: {
                name: '@minting/confirmation',
                jobData: {
                    tickets: generatedTicketsRes.response.map((gtr: TicketEntity) => gtr.id),
                    authorizations: authorizations.map((at: AuthorizedTicketMintingFormat) => [
                        at.authorizationId,
                        at.granter,
                        at.grantee
                    ])
                }
            },
            onFailure: {
                name: '@minting/failure',
                jobData: {
                    tickets: generatedTicketsRes.response.map((gtr: TicketEntity) => gtr.id),
                    authorizations: authorizations.map((at: AuthorizedTicketMintingFormat) => [
                        at.authorizationId,
                        at.granter,
                        at.grantee
                    ])
                }
            }
        };

    }

    private async setAuthorizationsToDispatched(authorizations: CartAuthorizations): Promise<void> {
        for (const authorization of authorizations.authorizations) {
            const authorizationUpdateRes = await this.authorizationsService.update({
                id: authorization.authorizationId,
                granter: authorization.granter,
                grantee: authorization.grantee,
                mode: 'mint'
            }, {
                dispatched: true
            });

            if (authorizationUpdateRes.error) {
                throw new Error(authorizationUpdateRes.error);
            }
        }
    }

    private async generateTickets(authorizations: AuthorizedTicketMintingFormat[]): Promise<ServiceResponse<TicketEntity[]>> {
        const inputs = authorizations.map((atmf: AuthorizedTicketMintingFormat): TicketsServicePredictionInput => ({
            buyer: atmf.grantee,
            categoryId: atmf.categoryId,
            authorizationId: atmf.authorizationId,
            groupId: atmf.groupId
        }));

        return this.ticketsService.predictTickets(inputs);
    }

    async ticketMintingTransactionSequenceBuilderTask(job: Job<TicketMintingTransactionSequenceBuilderTaskInput>): Promise<void> {

        const scopeContracts: ScopeBinding = this.ticketforgeService.getScopeContracts(
            this.configService.get('TICKETFORGE_SCOPE'),
        );

        const t721Controller: ContractsControllerBase = scopeContracts.t721c;

        const cart: ActionSet = await this.fetchAndVerifyCart(job.data.cartActionSetId);
        const checkout: ActionSet = await this.fetchAndVerifyCheckout(job.data.checkoutActionSetId);

        const amountToAuthorize = await this.evaluateTokenAmountToAuthorize(checkout, cart, t721Controller);

        const transactions: (TransactionParameters & Partial<TransactionLifecycles>)[] = [];

        const buyer: string = (checkout.actions[0].data as CheckoutResolve).buyer;
        const cartAuthorizations: CartAuthorizations = cart.actions[cart.actions.length - 1].data as CartAuthorizations;

        transactions.push(await this.getTokenAuthorizationPayload(amountToAuthorize, buyer, t721Controller));
        transactions.push(await this.generateTicketMintingTransactions(cartAuthorizations.authorizations, cartAuthorizations.total, cartAuthorizations.fees, t721Controller));

        const userSearchRes = await this.usersService.findByAddress(buyer);

        if (userSearchRes.error || userSearchRes.response === null) {
            throw new Error(`User linked to address ${buyer} not found`);
        }

        const user: UserDto = userSearchRes.response;

        const authorizationData: CartAuthorizations = cart.actions[cart.actions.length - 1].data;

        await this.setAuthorizationsToDispatched(authorizationData);

        const txSeqHandler = await this.actionSetsService.build<TxSequenceAcsetBuilderArgs>('txseq_processor', user, {
            transactions,
        }, true);

    }

    async onTicketMintingTransactionConfirmation(job: Job<TicketMintingTransactionConfirmed>): Promise<void> {

        for (const ticket of job.data.tickets) {
            const ticketConfirmationRes = await this.ticketsService.update({
                id: ticket
            }, {
                transaction_hash: job.data.transactionHash
            });

            if (ticketConfirmationRes.error) {
                throw new Error(`Error while setting transaction hash on ticket`)
            }

        }

        for (const authorization of job.data.authorizations) {

            const authorizationConsumingRes = await this.authorizationsService.update({
                id: authorization[0],
                granter: authorization[1],
                grantee: authorization[2],
                mode: 'mint',
            }, {
                consumed: true
            });

            if (authorizationConsumingRes.error) {
                throw new Error(`Error while setting authorizations to consumed`);
            }

        }

    }

    async onTicketMintingTransactionFailure(job: Job<TicketMintingTransactionFailure>): Promise<void> {
        for (const ticket of job.data.tickets) {
            const ticketConfirmationRes = await this.ticketsService.update({
                id: ticket
            }, {
                transaction_hash: job.data.transactionHash,
                status: 'canceled'
            });

            if (ticketConfirmationRes.error) {
                throw new Error(`Error while setting transaction hash and canceled on ticket`)
            }

        }

        for (const authorization of job.data.authorizations) {

            const authorizationConsumingRes = await this.authorizationsService.update({
                id: authorization[0],
                granter: authorization[1],
                grantee: authorization[2],
                mode: 'mint',
            }, {
                cancelled: true
            });

            if (authorizationConsumingRes.error) {
                throw new Error(`Error while setting authorizations to canceled`);
            }

        }
    }


    /**
     * Subscribes worker instances only
     */
    /* istanbul ignore next */
    async onModuleInit(): Promise<void> {
        const signature: InstanceSignature = await this.outrospectionService.getInstanceSignature();

        if (signature.name === 'worker') {
            this.mintingQueue
                .process('ticketMintingTransactionSequenceBuilderTask',
                    10,
                    this.ticketMintingTransactionSequenceBuilderTask.bind(this))
                .then(() => console.log(`Closing Bull Queue @@minting`))
                .catch(this.shutdownService.shutdownWithError);

            this.txQueue
                .process('@minting/confirmation', 10, this.onTicketMintingTransactionConfirmation.bind(this))
                .then(() => console.log(`Closing Bull Queue @@tx`))
                .catch(this.shutdownService.shutdownWithError);

            this.txQueue
                .process('@minting/failure', 10, this.onTicketMintingTransactionFailure.bind(this))
                .then(() => console.log(`Closing Bull Queue @@tx`))
                .catch(this.shutdownService.shutdownWithError);
        }
    }

}
