import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { StripeInterfacesRepository } from '@lib/common/stripeinterface/StripeInterfaces.repository';
import { StripeInterfacesService } from '@lib/common/stripeinterface/StripeInterfaces.service';
import { ToolBoxModule } from '../toolbox/ToolBox.module';

/**
 * Stripe Interfaces utilities
 */
@Module({
    imports: [ExpressCassandraModule.forFeature([StripeInterfaceEntity, StripeInterfacesRepository]), ToolBoxModule],
    providers: [StripeInterfacesService],
    exports: [StripeInterfacesService],
})
export class StripeInterfacesModule {}
