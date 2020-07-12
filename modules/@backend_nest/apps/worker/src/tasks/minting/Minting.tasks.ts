import { OnModuleInit } from '@nestjs/common';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { T721TokenService } from '@lib/common/contracts/T721Token.service';
import { CheckoutResolve } from '@app/worker/actionhandlers/checkout/Checkout.input.handlers';
import { CartAuthorizations } from '@app/worker/actionhandlers/cart/Cart.input.handlers';
import BigNumber from 'bignumber.js';
import { MintAuthorization, TransactionParameters } from '@common/global';
import { ScopeBinding, TicketforgeService } from '@lib/common/contracts/Ticketforge.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { AuthorizedTicketMintingFormat } from '@lib/common/utils/Cart.type';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { CurrenciesService, ERC20Currency, Price } from '@lib/common/currencies/Currencies.service';
import {
    TransactionLifecycles,
    TxSequenceAcsetBuilderArgs,
} from '@lib/common/txs/acset_builders/TxSequence.acsetbuilder.helper';
import { UsersService } from '@lib/common/users/Users.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { GroupService } from '@lib/common/group/Group.service';
import { TicketsService, TicketsServicePredictionInput } from '@lib/common/tickets/Tickets.service';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { NestError } from '@lib/common/utils/NestError';

/**
 * Data Model used for the transaction sequence builder
 */
export interface TicketMintingTransactionSequenceBuilderTaskInput {
    /**
     * Cart ID
     */
    cartActionSetId: string;

    /**
     * Checkout ID
     */
    checkoutActionSetId: string;

    /**
     * Gem Order ID
     */
    gemOrderId?: string;
}

/**
 * Data Model used for the Ticket Minting confirmation callback
 */
export interface TicketMintingTransactionConfirmed {
    /**
     * Hash of the followed transaction
     */
    transactionHash: string;

    /**
     * List of tickets created during the transaction
     */
    tickets: string[];

    /**
     * List of authorizations linked to the tickets
     */
    authorizations: string[][];
}

/**
 * Data Model used for the Ticket Minting failure callback
 */
export interface TicketMintingTransactionFailure {
    /**
     * Hash of the followed transaction
     */
    transactionHash: string;

    /**
     * List of tickets that should have been created during the transaction
     */
    tickets: string[];

    /**
     * List of authorizations linked to the tickets
     */
    authorizations: string[][];
}

/**
 * Tasks for the minting use case
 */
export class MintingTasks implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param mintingQueue
     * @param txQueue
     * @param outrospectionService
     * @param shutdownService
     * @param actionSetsService
     * @param t721TokenService
     * @param t721AdminService
     * @param ticketforgeService
     * @param configService
     * @param currenciesService
     * @param authorizationsService
     * @param usersService
     * @param groupService
     * @param ticketsService
     */
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
        private readonly usersService: UsersService,
        private readonly groupService: GroupService,
        private readonly ticketsService: TicketsService,
    ) {}

    /**
     * Internal utility to fetch the checkout actionset
     *
     * @param checkoutId
     */
    private async fetchAndVerifyCheckout(checkoutId: string): Promise<ActionSet> {
        const checkoutActionSetRes = await this.actionSetsService.search({
            id: checkoutId,
        });

        if (checkoutActionSetRes.error || checkoutActionSetRes.response.length === 0) {
            throw new NestError(
                `Unable to recover checkout for minting initialization: ${checkoutActionSetRes.error ||
                    'checkout not found'}`,
            );
        }

        return new ActionSet().load(checkoutActionSetRes.response[0]);
    }

    /**
     * Internal utility to fetch the cart actionset
     *
     * @param cartId
     */
    private async fetchAndVerifyCart(cartId: string): Promise<ActionSet> {
        const cartActionSetRes = await this.actionSetsService.search({
            id: cartId,
        });

        if (cartActionSetRes.error || cartActionSetRes.response.length === 0) {
            throw new NestError(
                `Unable to recover cart for minting initialization: ${cartActionSetRes.error || 'cart not found'}`,
            );
        }

        return new ActionSet().load(cartActionSetRes.response[0]);
    }

    /**
     * Internal utility to compute the amount of tokens to approve
     *
     * @param checkout
     * @param cart
     * @param t721Controller
     */
    private async evaluateTokenAmountToAuthorize(
        checkout: ActionSet,
        cart: ActionSet,
        t721Controller: ContractsControllerBase,
    ): Promise<string> {
        const checkoutInputData: CheckoutResolve = checkout.actions[0].data;
        const cartAuthorizations: CartAuthorizations = cart.actions[cart.actions.length - 1].data;
        const t721ControllerAddress = (await t721Controller.get())._address;

        if (cartAuthorizations.total.length === 0) {
            return '0';
        }

        if (cartAuthorizations.total.length > 1 || cartAuthorizations.fees.length > 1) {
            throw new NestError('Multiple currencies not allowed');
        }

        if (cartAuthorizations.total[0].currency !== 'T721Token') {
            throw new NestError('Only T721Token allowed');
        }

        const currentlyAuthorizedAmount = (
            await (await this.t721TokenService.get()).methods
                .allowance(checkoutInputData.buyer, t721ControllerAddress)
                .call()
        ).toString();

        const totalRequiredAmount = new BigNumber(cartAuthorizations.total[0].value)
            .plus(new BigNumber(cartAuthorizations.fees[0]))
            .toString(10);

        if (new BigNumber(currentlyAuthorizedAmount).gte(new BigNumber(totalRequiredAmount))) {
            return '0';
        }

        return new BigNumber(totalRequiredAmount).minus(new BigNumber(currentlyAuthorizedAmount)).toString();
    }

    /**
     * Internal utility to generate the transaction payload
     *
     * @param amount
     * @param buyer
     * @param t721Controller
     */
    private async getTokenAuthorizationPayload(
        amount: string,
        buyer: string,
        t721Controller: ContractsControllerBase,
    ): Promise<TransactionParameters> {
        try {
            const parameters: TransactionParameters = {
                from: buyer,
                to: (await this.t721TokenService.get())._address,
                data: (await this.t721TokenService.get()).methods
                    .approve((await t721Controller.get())._address, amount)
                    .encodeABI(),
                value: '0',
            };

            return parameters;
        } catch (e) {
            throw new NestError(`Unable to create token approval call: ${e.message}`);
        }
    }

    /**
     * Internal utility to generate the ticket minting transaction parameters
     *
     * @param authorizations
     * @param prices
     * @param fees
     * @param t721Controller
     */
    private async generateTicketMintingTransactions(
        authorizations: AuthorizedTicketMintingFormat[],
        prices: Price[],
        fees: string[],
        t721Controller: ContractsControllerBase,
    ): Promise<TransactionParameters & Partial<TransactionLifecycles>> {
        const codes: string[] = [];
        const signature: string[] = [];
        let expiration: string = null;

        const resolvedPrices: Price[] = [];

        for (const price of prices) {
            const currency = await this.currenciesService.get(price.currency);

            if (currency.type !== 'erc20') {
                throw new NestError(`Invalid currency type on final step: ${currency.type}`);
            }

            const erc20Currency: ERC20Currency = currency as ERC20Currency;

            resolvedPrices.push({
                currency: erc20Currency.address,
                value: price.value,
                log_value: price.log_value,
            });
        }

        for (const authorization of authorizations) {
            const authorizationEntityRes = await this.authorizationsService.search({
                id: authorization.authorizationId,
                granter: authorization.granter,
                grantee: authorization.grantee,
                mode: 'mint',
            });

            if (authorizationEntityRes.error || authorizationEntityRes.response.length === 0) {
                throw new NestError(
                    `Cannot fetch or find authorization entity ${
                        authorization.authorizationId
                    }: ${authorizationEntityRes.error || 'authorization not found'}`,
                );
            }

            const authorizationEntity: AuthorizationEntity = authorizationEntityRes.response[0];

            codes.push(AuthorizationEntity.getCodes(authorizationEntity)[0]);
            signature.push(authorizationEntity.signature);

            const args = AuthorizationEntity.getArgs(authorizationEntity);

            if (expiration === null) {
                expiration = args[args.length - 1];
            } else {
                if (expiration !== args[args.length - 1]) {
                    throw new NestError(`Cannot proceed with authorizations with different expirations`);
                }
            }
        }

        const adminAddress = (await this.t721AdminService.get())._address;
        const scopeName = this.configService.get('TICKETFORGE_SCOPE');

        const scopeInfos = await (await this.ticketforgeService.get()).methods.getScope(scopeName).call();

        if (scopeInfos.exists === false) {
            throw new NestError(`Current server ticketforge scope does not exist`);
        }

        const scopeIndex = scopeInfos.scope_index;

        const controllerIdRes = await this.groupService.getGroupIDControllerFields<[string]>(
            authorizations[0].groupId,
            ['id'],
        );

        if (controllerIdRes.error) {
            throw new NestError(`Unable to recover controller id used for the group_id generation`);
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
            throw new NestError(`Unable to generate ticket before minting: ${generatedTicketsRes.error}`);
        }

        return {
            from: authorizations[0].grantee,
            to: (await t721Controller.get())._address,
            data: (await t721Controller.get()).methods.mint(...rawArgs).encodeABI(),
            value: '0',
            onConfirm: {
                name: '@minting/confirmation',
                jobData: {
                    tickets: generatedTicketsRes.response.map((gtr: TicketEntity) => gtr.id),
                    authorizations: authorizations.map((at: AuthorizedTicketMintingFormat) => [
                        at.authorizationId,
                        at.granter,
                        at.grantee,
                    ]),
                },
            },
            onFailure: {
                name: '@minting/failure',
                jobData: {
                    tickets: generatedTicketsRes.response.map((gtr: TicketEntity) => gtr.id),
                    authorizations: authorizations.map((at: AuthorizedTicketMintingFormat) => [
                        at.authorizationId,
                        at.granter,
                        at.grantee,
                    ]),
                },
            },
        };
    }

    /**
     * Internal utility to set authorization status to dispatched
     *
     * @param authorizations
     */
    private async setAuthorizationsToDispatched(authorizations: CartAuthorizations): Promise<void> {
        for (const authorization of authorizations.authorizations) {
            const authorizationUpdateRes = await this.authorizationsService.update(
                {
                    id: authorization.authorizationId,
                    granter: authorization.granter,
                    grantee: authorization.grantee,
                    mode: 'mint',
                },
                {
                    dispatched: true,
                },
            );

            if (authorizationUpdateRes.error) {
                throw new NestError(`Authorization update failure: ${authorizationUpdateRes.error}`);
            }
        }
    }

    /**
     * Internal utility to pre-generate tickets based on their deterministic IDs
     *
     * @param authorizations
     */
    private async generateTickets(
        authorizations: AuthorizedTicketMintingFormat[],
    ): Promise<ServiceResponse<TicketEntity[]>> {
        const inputs = authorizations.map(
            (atmf: AuthorizedTicketMintingFormat): TicketsServicePredictionInput => ({
                buyer: atmf.grantee,
                categoryId: atmf.categoryId,
                authorizationId: atmf.authorizationId,
                groupId: atmf.groupId,
            }),
        );

        return this.ticketsService.predictTickets(inputs);
    }

    /**
     * Set consumed flag to true on cart and checkout actionset
     *
     * @param cartId
     * @param checkoutId
     */
    private async consumeCartAndCheckout(cartId: string, checkoutId: string): Promise<ServiceResponse<void>> {
        const cartConsumedUpdate = await this.actionSetsService.update(
            {
                id: cartId,
            },
            {
                consumed: true,
            },
        );

        const checkoutConsumedUpdate = await this.actionSetsService.update(
            {
                id: checkoutId,
            },
            {
                consumed: true,
            },
        );

        if (cartConsumedUpdate.error || checkoutConsumedUpdate.error) {
            return {
                error: cartConsumedUpdate.error || checkoutConsumedUpdate.error,
                response: null,
            };
        }

        return {
            error: null,
            response: null,
        };
    }

    /**
     * Ticket Minting task. Handling transaction sequence creation
     *
     * @param job
     */
    async ticketMintingTransactionSequenceBuilderTask(
        job: Job<TicketMintingTransactionSequenceBuilderTaskInput>,
    ): Promise<void> {
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
        transactions.push(
            await this.generateTicketMintingTransactions(
                cartAuthorizations.authorizations,
                cartAuthorizations.total,
                cartAuthorizations.fees,
                t721Controller,
            ),
        );

        const userSearchRes = await this.usersService.findByAddress(buyer);

        if (userSearchRes.error || userSearchRes.response === null) {
            throw new NestError(`User linked to address ${buyer} not found`);
        }

        const user: UserDto = userSearchRes.response;

        await this.setAuthorizationsToDispatched(cartAuthorizations);

        const txSeqHandler = await this.actionSetsService.build<TxSequenceAcsetBuilderArgs>(
            'txseq_processor',
            user,
            {
                transactions,
            },
            true,
        );

        if (txSeqHandler.error) {
            throw new NestError(`Unable to create tx sequence actionset: ${txSeqHandler.error}`);
        }

        const consumed = await this.consumeCartAndCheckout(cart.id, checkout.id);

        if (consumed.error) {
            throw new NestError(`Unable to consume actionsets: ${consumed.error}`);
        }
    }

    /**
     * Ticket creation confirmation callback
     *
     * @param job
     */
    async onTicketMintingTransactionConfirmation(job: Job<TicketMintingTransactionConfirmed>): Promise<void> {
        for (const ticket of job.data.tickets) {
            const ticketConfirmationRes = await this.ticketsService.update(
                {
                    id: ticket,
                },
                {
                    transaction_hash: job.data.transactionHash,
                },
            );

            if (ticketConfirmationRes.error) {
                throw new NestError(`Error while setting transaction hash on ticket: ${ticketConfirmationRes.error}`);
            }
        }
    }

    /**
     * Ticket creation failure callback
     *
     * @param job
     */
    async onTicketMintingTransactionFailure(job: Job<TicketMintingTransactionFailure>): Promise<void> {
        for (const ticket of job.data.tickets) {
            const ticketConfirmationRes = await this.ticketsService.update(
                {
                    id: ticket,
                },
                {
                    transaction_hash: job.data.transactionHash,
                    status: 'canceled',
                },
            );

            if (ticketConfirmationRes.error) {
                throw new NestError(
                    `Error while setting transaction hash and canceled on ticket: ${ticketConfirmationRes.error}`,
                );
            }
        }

        for (const authorization of job.data.authorizations) {
            const authorizationConsumingRes = await this.authorizationsService.update(
                {
                    id: authorization[0],
                    granter: authorization[1],
                    grantee: authorization[2],
                    mode: 'mint',
                },
                {
                    cancelled: true,
                },
            );

            if (authorizationConsumingRes.error) {
                throw new NestError(
                    `Error while setting authorizations to canceled: ${authorizationConsumingRes.error}`,
                );
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
                .process(
                    'ticketMintingTransactionSequenceBuilderTask',
                    10,
                    this.ticketMintingTransactionSequenceBuilderTask.bind(this),
                )
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
