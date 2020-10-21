import {
    ProductCheckerServiceBase,
    PurchasedItem,
    PurchaseError,
} from '@lib/common/purchases/ProductChecker.base.service';
import { Fee, Product, PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { Injectable } from '@nestjs/common';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { TicketsService } from '@lib/common/tickets/Tickets.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { ModuleRef } from '@nestjs/core';
import { EventsService } from '@lib/common/events/Events.service';
import { OperationsService } from '@lib/common/operations/Operations.service';

const TICKETS_PER_CART_LIMIT = 5;
// const CATEGORY_PER_USER_LIMIT = Infinity;
const STATIC_FEE = 100;
const PERCENT_FEE = 0.01;

@Injectable()
export class CategoriesProduct implements ProductCheckerServiceBase {
    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly timeToolService: TimeToolService,
        private readonly ticketsService: TicketsService,
        private readonly winstonLoggerService: WinstonLoggerService,
        private readonly operationsService: OperationsService,
        private readonly moduleRef: ModuleRef,
    ) {}

    async check(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
    ): Promise<ServiceResponse<PurchaseError>> {
        const product = purchaseEntity.products[productIdx];

        const categoryFetchRes = await this.categoriesService.findOne(product.id);

        if (categoryFetchRes.error) {
            return {
                error: categoryFetchRes.error,
                response: null,
            };
        }

        if (categoryFetchRes.response === null) {
            return {
                error: 'category_not_found',
                response: null,
            };
        }

        const categoryEntity: CategoryEntity = categoryFetchRes.response;

        const categoryStatusCheckRes = await this.categoryStatusCheck(categoryEntity);
        if (categoryStatusCheckRes.error) {
            return {
                error: null,
                response: {
                    reason: 'category_not_live',
                    context: {
                        category: categoryEntity.id,
                    },
                },
            };
        }

        const categoryDateCheckRes = await this.categoryDatesCheck(categoryEntity);
        if (categoryDateCheckRes.error) {
            return {
                error: null,
                response: {
                    reason: 'sale_ended',
                    context: {
                        category: categoryEntity.id,
                    },
                },
            };
        }

        const categoryCoherenceCheckRes = await this.categoryCoherenceCheck(categoryEntity, purchaseEntity.products);
        if (categoryCoherenceCheckRes.error) {
            return {
                error: null,
                response: {
                    reason: 'multiple_group_ids',
                    context: {
                        category: categoryEntity.id,
                    },
                },
            };
        }

        return {
            error: null,
            response: null,
        };
    }

    updatePaymentDetails(
        purchaseEntity: PurchaseEntity,
        categoryEntity: CategoryEntity,
        product: Product,
    ): ServiceResponse<[string, string, number]> {
        switch (categoryEntity.currency) {
            case 'FREE': {
                if (purchaseEntity.currency === null) {
                    return {
                        response: [categoryEntity.interface, purchaseEntity.currency, purchaseEntity.price],
                        error: null,
                    };
                } else {
                    return {
                        response: [purchaseEntity.payment_interface, purchaseEntity.currency, purchaseEntity.price],
                        error: null,
                    };
                }
            }
            default: {
                if (purchaseEntity.currency === null) {
                    return {
                        error: null,
                        response: [
                            categoryEntity.interface,
                            categoryEntity.currency,
                            categoryEntity.price * product.quantity,
                        ],
                    };
                } else if (purchaseEntity.currency !== categoryEntity.currency) {
                    return {
                        error: 'invalid_currency',
                        response: null,
                    };
                } else {
                    return {
                        error: null,
                        response: [
                            purchaseEntity.payment_interface,
                            purchaseEntity.currency,
                            purchaseEntity.price + categoryEntity.price * product.quantity,
                        ],
                    };
                }
            }
        }
    }

    updateProductList(
        purchaseEntity: PurchaseEntity,
        categoryEntity: CategoryEntity,
        product: Product,
    ): ServiceResponse<Product[]> {
        let products: Product[];
        const existingProductIdx = purchaseEntity.products.findIndex(
            (_product: Product): boolean => _product.type === 'category' && _product.id === categoryEntity.id,
        );

        if (existingProductIdx !== -1) {
            products = [...purchaseEntity.products];

            products[existingProductIdx].quantity += product.quantity;
        } else {
            products = [
                ...purchaseEntity.products,
                {
                    ...product,
                    group_id: categoryEntity.group_id,
                },
            ];
        }

        return {
            error: null,
            response: products,
        };
    }

    async categoryStatusCheck(category: CategoryEntity): Promise<ServiceResponse<void>> {
        if (category.status === 'preview') {
            return {
                error: 'category_not_live',
                response: null,
            };
        }
        return {
            error: null,
            response: null,
        };
    }

    async categoryDatesCheck(category: CategoryEntity): Promise<ServiceResponse<void>> {
        if (new Date(category.sale_end).getTime() < this.timeToolService.now().getTime()) {
            return {
                error: 'sale_ended',
                response: null,
            };
        }
        return {
            error: null,
            response: null,
        };
    }

    async categoryCoherenceCheck(category: CategoryEntity, products: Product[]): Promise<ServiceResponse<void>> {
        const currentGroupId = category.group_id;

        for (const product of products) {
            if (product.group_id !== currentGroupId) {
                return {
                    error: 'invalid_group_id',
                    response: null,
                };
            }
        }

        return {
            error: null,
            response: null,
        };
    }

    async checkLimits(user: UserDto, purchase: PurchaseEntity, product: Product): Promise<ServiceResponse<void>> {
        const ticketList = purchase.products
            .filter((p: Product): boolean => p.type === 'category')
            .map((p: Product): number => p.quantity);

        const ticketCount = ticketList.length ? ticketList.reduce((p1: number, p2: number): number => p1 + p2) : 0;

        if (ticketCount + product.quantity > TICKETS_PER_CART_LIMIT) {
            return {
                error: 'ticket_per_cart_limit_reached',
                response: null,
            };
        }

        return {
            error: null,
            response: null,
        };
    }

    async add(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        product: Product,
    ): Promise<ServiceResponse<Partial<PurchaseEntity>>> {
        const categoryFetchRes = await this.categoriesService.findOne(product.id);

        if (categoryFetchRes.error) {
            return {
                error: categoryFetchRes.error,
                response: null,
            };
        }

        const categoryEntity: CategoryEntity = categoryFetchRes.response;

        const paymentDetails = this.updatePaymentDetails(purchaseEntity, categoryEntity, product);

        if (paymentDetails.error) {
            return {
                error: paymentDetails.error,
                response: null,
            };
        }

        const productList = this.updateProductList(purchaseEntity, categoryEntity, product);

        if (productList.error) {
            return {
                error: productList.error,
                response: null,
            };
        }

        const limitCheckRes = await this.checkLimits(user, purchaseEntity, product);

        if (limitCheckRes.error) {
            return {
                error: limitCheckRes.error,
                response: null,
            };
        }

        const updatedPurchaseEntity = {
            ...purchaseEntity,
            products: productList.response,
            payment_interface: paymentDetails.response[0],
            currency: paymentDetails.response[1],
            price: paymentDetails.response[2],
        };

        const checkRes = await this.check(user, updatedPurchaseEntity, updatedPurchaseEntity.products.length - 1);

        if (checkRes.error) {
            return {
                error: checkRes.error,
                response: null,
            };
        }

        if (checkRes.response) {
            return {
                error: checkRes.response.reason,
                response: null,
            };
        }

        // Here all the checks before adding
        return {
            error: null,
            response: {
                products: productList.response,
                payment_interface: paymentDetails.response[0],
                currency: paymentDetails.response[1],
                price: paymentDetails.response[2],
            },
        };
    }

    async createOperation(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
        tickets: string[],
        status: 'confirmed' | 'cancelled',
    ): Promise<ServiceResponse<void>> {
        const product = purchaseEntity.products[productIdx];

        const categoryFetchRes = await this.categoriesService.findOne(product.id);

        if (categoryFetchRes.error) {
            return {
                error: categoryFetchRes.error,
                response: null,
            };
        }

        const categoryEntity: CategoryEntity = categoryFetchRes.response;

        const operationCreationRes = await this.operationsService.create({
            purchase_id: purchaseEntity.id,
            client_id: user.id,
            group_id: product.group_id,
            category_id: product.id,
            ticket_ids: tickets,
            type: 'sell',
            status,
            fee: purchaseEntity.fees[productIdx]?.price || 0,
            quantity: product.quantity,
            price: categoryEntity.price * product.quantity,
        });

        if (operationCreationRes.error) {
            return {
                error: operationCreationRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: null,
        };
    }

    async ok(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
    ): Promise<ServiceResponse<PurchasedItem[]>> {
        const product = purchaseEntity.products[productIdx];
        const ret: PurchasedItem[] = [];

        for (let idx = 0; idx < product.quantity; ++idx) {
            const createdTicketRes = await this.ticketsService.create({
                receipt: purchaseEntity.id,
                owner: user.id,
                category: product.id,
                group_id: product.group_id,
            });

            if (createdTicketRes.error) {
                return {
                    error: createdTicketRes.error,
                    response: null,
                };
            }

            const ticket: TicketEntity = createdTicketRes.response;

            this.winstonLoggerService.log(`Purchase@${purchaseEntity.id}: created Ticket@${ticket.id} (${idx})`);

            ret.push({
                type: 'ticket',
                id: ticket.id,
            });
        }

        const operationRes = await this.createOperation(
            user,
            purchaseEntity,
            productIdx,
            ret.map((pi: PurchasedItem): string => pi.id),
            'confirmed',
        );

        if (operationRes.error) {
            return {
                error: operationRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: ret,
        };
    }

    async ko(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
    ): Promise<ServiceResponse<PurchaseError>> {
        const operationRes = await this.createOperation(user, purchaseEntity, productIdx, null, 'confirmed');

        if (operationRes.error) {
            return {
                error: operationRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: {
                reason: 'payment_failure',
                context: {
                    purchase: purchaseEntity.id,
                },
            },
        };
    }

    async interfaceId(groupId: string): Promise<ServiceResponse<string>> {
        const eventsService = this.moduleRef.get(EventsService, {
            strict: false,
        });

        const eventEntityRes = await eventsService.findOneFromGroupId(groupId);

        if (eventEntityRes.error) {
            return {
                error: eventEntityRes.error,
                response: null,
            };
        }

        const eventEntity: EventEntity = eventEntityRes.response;

        return {
            error: null,
            response: eventEntity.stripe_interface,
        };
    }

    async fees(user: UserDto, purchaseEntity: PurchaseEntity, product: Product): Promise<ServiceResponse<Fee>> {
        const eventsService = this.moduleRef.get(EventsService, {
            strict: false,
        });

        const eventEntityRes = await eventsService.findOneFromGroupId(purchaseEntity.products[0].group_id);

        if (eventEntityRes.error) {
            return {
                error: eventEntityRes.error,
                response: null,
            };
        }

        const eventEntity: EventEntity = eventEntityRes.response;

        const categoryFetchRes = await this.categoriesService.findOne(product.id);

        if (categoryFetchRes.error) {
            return {
                error: categoryFetchRes.error,
                response: null,
            };
        }

        const categoryEntity: CategoryEntity = categoryFetchRes.response;

        if (categoryEntity.currency === 'FREE') {
            return {
                error: null,
                response: null,
            };
        }

        const staticFee = eventEntity.custom_static_fee || STATIC_FEE;
        const percentFee = eventEntity.custom_percent_fee || PERCENT_FEE;

        return {
            error: null,
            response: {
                type: 'ticket721',
                price: (Math.floor(categoryEntity.price * percentFee) + staticFee) * product.quantity,
            },
        };
    }
}
