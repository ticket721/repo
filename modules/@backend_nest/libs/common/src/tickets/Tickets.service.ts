import { Injectable } from '@nestjs/common';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { TicketsRepository } from '@lib/common/tickets/Tickets.repository';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { PurchasesService } from '@lib/common/purchases/Purchases.service';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { fromES } from '@lib/common/utils/fromES.helper';
import { Product, PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';

/**
 * Data model required when pre-generating the tickets
 */
export interface TicketsServicePredictionInput {
    /**
     * Buyer address
     */
    buyer: string;

    /**
     * Category ID
     */
    categoryId: string;

    /**
     * AUthorization ID
     */
    authorizationId: string;

    /**
     * Group ID
     */
    groupId: string;
}

/**
 * Service to CRUD the Tickets Resources
 */
@Injectable()
export class TicketsService extends CRUDExtension<TicketsRepository, TicketEntity> {
    /**
     * Dependency Injection
     *
     * @param ticketsRepository
     * @param ticketEntity
     * @param purchasesService
     * @param timeToolService
     */
    constructor(
        @InjectRepository(TicketsRepository)
        ticketsRepository: TicketsRepository,
        @InjectModel(TicketEntity)
        ticketEntity: BaseModel<TicketEntity>,
        private readonly purchasesService: PurchasesService,
        private readonly timeToolService: TimeToolService,
    ) {
        super(
            ticketEntity,
            ticketsRepository,
            /* istanbul ignore next */
            (te: TicketEntity) => {
                return new ticketEntity(te);
            },
            /* istanbul ignore next */
            (te: TicketEntity) => {
                return new TicketEntity(te);
            },
        );
    }

    private countPurchasesTickets(purchases: PurchaseEntity[], category: string): number {
        let ret = 0;

        for (const purchase of purchases) {
            const product = purchase.products.find((_product: Product): boolean => _product.id === category);

            if (product) {
                ret += product.quantity;
            }
        }

        return ret;
    }

    async getTicketCount(category: string, currentPurchaseId?: string): Promise<ServiceResponse<number>> {
        const countRes = await this.countElastic({
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                category,
                            },
                        },
                    },
                },
            },
        });

        if (countRes.error) {
            return {
                error: countRes.error,
                response: null,
            };
        }

        const esPurchaseQuery = {
            body: {
                query: {
                    bool: {
                        filter: {
                            script: {
                                script: {
                                    source: `
                                            return doc['closed_at'].empty && !doc['checked_out_at'].empty && (params.now - doc['checked_out_at'].getValue().toInstant().toEpochMilli()) < 15 * 60 * 1000;
                                        `,
                                    lang: 'painless',
                                    params: {
                                        now: this.timeToolService.now().getTime(),
                                    },
                                },
                            },
                        },

                        ...(currentPurchaseId
                            ? {
                                  must_not: {
                                      term: {
                                          id: currentPurchaseId,
                                      },
                                  },
                              }
                            : {}),

                        must: [
                            {
                                nested: {
                                    path: 'products',
                                    query: {
                                        bool: {
                                            must: {
                                                term: {
                                                    'products.id': category,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        };

        const purchaseCountRes = await this.purchasesService.countElastic(esPurchaseQuery);

        if (purchaseCountRes.error) {
            return {
                error: purchaseCountRes.error,
                response: null,
            };
        }

        const purchaseRes = await this.purchasesService.searchElastic(esPurchaseQuery);

        if (purchaseRes.error) {
            return {
                error: purchaseRes.error,
                response: null,
            };
        }

        const purchases: PurchaseEntity[] = purchaseRes.response.hits.hits.map(fromES);
        const inCheckedOutCartsCount = this.countPurchasesTickets(purchases, category);

        return {
            error: null,
            response: countRes.response.count + inCheckedOutCartsCount,
        };
    }
}
