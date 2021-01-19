import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { InvitationsRepository } from '@lib/common/invitations/Invitations.repository';
import { InvitationEntity } from '@lib/common/invitations/entities/Invitation.entity';
import { InvitationsService } from '@lib/common/invitations/Invitations.service';

/**
 * Invitations Modules. Lowest level of the event
 */
@Module({
    imports: [ExpressCassandraModule.forFeature([InvitationEntity, InvitationsRepository])],
    providers: [InvitationsService],
    exports: [InvitationsService],
})
export class InvitationsModule {}
