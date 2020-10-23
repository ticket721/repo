import { Injectable } from '@nestjs/common';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { TicketsRepository } from '@lib/common/tickets/Tickets.repository';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

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
     */
    constructor(
        @InjectRepository(TicketsRepository)
        ticketsRepository: TicketsRepository,
        @InjectModel(TicketEntity)
        ticketEntity: BaseModel<TicketEntity>,
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

    async getTicketCount(category: string): Promise<ServiceResponse<number>> {
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

        return {
            error: null,
            response: countRes.response.count,
        };
    }
}
