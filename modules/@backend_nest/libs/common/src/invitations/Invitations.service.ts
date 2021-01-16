import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { InvitationsRepository } from './Invitations.repository';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { InvitationEntity } from '@lib/common/invitations/entities/Invitation.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

/**
 * Service to CRUD InvitationEntities
 */
export class InvitationsService extends CRUDExtension<InvitationsRepository, InvitationEntity> {
    /**
     * Dependency injection
     *
     * @param invitationsRepository
     * @param invitationEntity
     */
    constructor(
        @InjectRepository(InvitationsRepository)
        invitationsRepository: InvitationsRepository,
        @InjectModel(InvitationEntity)
        invitationEntity: BaseModel<InvitationEntity>,
    ) {
        super(
            invitationEntity,
            invitationsRepository,
            /* istanbul ignore next */
            (e: InvitationEntity) => {
                return new invitationEntity(e);
            },
            /* istanbul ignore next */
            (d: InvitationEntity) => {
                return new InvitationEntity(d);
            },
        );
    }

    /**
     * Find invitation by its id
     *
     * @param invitationId
     */
    async findOne(invitationId: string): Promise<ServiceResponse<InvitationEntity>> {
        // Recover Invitation
        const invitationRes = await this.search({
            id: invitationId,
        });

        if (invitationRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        if (invitationRes.response.length === 0) {
            return {
                error: 'not_found',
                response: null,
            };
        }

        return {
            response: invitationRes.response[0],
            error: null,
        };
    }
}
