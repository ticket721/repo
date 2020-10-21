import { Injectable } from '@nestjs/common';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { TicketsRepository } from '@lib/common/tickets/Tickets.repository';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';

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

    // /*
    //  * Utility to pre-generate the ticket entities before the transaction is emitted by computing their deterministic IDs
    //  *
    //  * @param predictionInputs
    //  */
    // async predictTickets(predictionInputs: TicketsServicePredictionInput[]): Promise<ServiceResponse<TicketEntity[]>> {
    //     const ticketforgeInstance = await this.ticketforgeService.get();
    //
    //     const registeredMintings: { [key: string]: number } = {};
    //
    //     for (const input of predictionInputs) {
    //         registeredMintings[input.buyer] = 0;
    //     }
    //
    //     const res: TicketEntity[] = [];
    //
    //     for (const input of predictionInputs) {
    //         const currentMintingNonceRes = await contractCallHelper(
    //             ticketforgeInstance,
    //             'getMintNonce',
    //             {},
    //             input.buyer,
    //         );
    //
    //         if (currentMintingNonceRes.error) {
    //             return {
    //                 error: currentMintingNonceRes.error,
    //                 response: null,
    //             };
    //         }
    //
    //         const finalMintNonce: string = new BigNumber(currentMintingNonceRes.response)
    //             .plus(new BigNumber(registeredMintings[input.buyer]))
    //             .toString();
    //
    //         const ticketIDRes = await contractCallHelper(
    //             ticketforgeInstance,
    //             'getTokenID',
    //             {},
    //             input.buyer,
    //             finalMintNonce,
    //         );
    //
    //         if (ticketIDRes.error) {
    //             return {
    //                 error: ticketIDRes.error,
    //                 response: null,
    //             };
    //         }
    //
    //         const categoryEntityRes = await this.categoriesService.search({
    //             id: input.categoryId,
    //         });
    //
    //         if (categoryEntityRes.error || categoryEntityRes.response.length === 0) {
    //             return {
    //                 error: categoryEntityRes.error || 'category_not_found',
    //                 response: null,
    //             };
    //         }
    //
    //         const ticketEntityCreationRes = await this.create({
    //             id: ticketIDRes.response.toString(),
    //             authorization: input.authorizationId,
    //             owner: input.buyer,
    //             env: 'chain',
    //             status: 'minting',
    //             transaction_hash: null,
    //             category: input.categoryId,
    //             group_id: input.groupId,
    //             parent_id: categoryEntityRes.response[0].parent_id,
    //             parent_type: categoryEntityRes.response[0].parent_type,
    //         });
    //
    //         if (ticketEntityCreationRes.error) {
    //             return {
    //                 error: ticketEntityCreationRes.error,
    //                 response: null,
    //             };
    //         }
    //
    //         const userRes = await this.usersService.findByAddress(input.buyer);
    //
    //         if (userRes.error) {
    //             return {
    //                 error: userRes.error,
    //                 response: null,
    //             };
    //         }
    //
    //         const user: UserDto = userRes.response;
    //
    //         const rights = await this.rightsService.addRights(user, [
    //             {
    //                 entity: 'ticket',
    //                 entityValue: ticketIDRes.response.toString(),
    //                 rights: {
    //                     owner: true,
    //                 },
    //             },
    //         ]);
    //
    //         if (rights.error) {
    //             return {
    //                 error: rights.error,
    //                 response: null,
    //             };
    //         }
    //
    //         const creationMetadataRes = await this.metadatasService.attach(
    //             'ownership',
    //             'ticket',
    //             [
    //                 {
    //                     type: 'ticket',
    //                     id: ticketIDRes.response.toString(),
    //                     field: 'id',
    //                 },
    //             ],
    //             [
    //                 {
    //                     type: 'ticket',
    //                     id: ticketIDRes.response.toString(),
    //                     field: 'id',
    //                 },
    //             ],
    //             [],
    //             {
    //                 date: {
    //                     at: new Date(Date.now()),
    //                 },
    //                 str: {
    //                     username: user.username,
    //                     email: user.email,
    //                     ticket: ticketIDRes.response.toString(),
    //                     address: user.address,
    //                     categoryId: input.categoryId,
    //                 },
    //                 bool: {
    //                     valid: true,
    //                 },
    //             },
    //             user,
    //             this,
    //         );
    //
    //         if (creationMetadataRes.error) {
    //             return {
    //                 error: creationMetadataRes.error,
    //                 response: null,
    //             };
    //         }
    //
    //         res.push(ticketEntityCreationRes.response);
    //
    //         registeredMintings[input.buyer] += 1;
    //     }
    //
    //     return {
    //         error: null,
    //         response: res,
    //     };
    // }
}
