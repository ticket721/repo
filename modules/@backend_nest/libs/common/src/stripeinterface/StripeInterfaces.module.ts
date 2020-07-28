import { Module }                     from '@nestjs/common';
import { ExpressCassandraModule }     from '@iaminfinity/express-cassandra';
import { StripeInterfaceEntity }      from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { StripeInterfacesRepository } from '@lib/common/stripeinterface/StripeInterfaces.repository';
import { StripeInterfacesService }    from '@lib/common/stripeinterface/StripeInterfaces.service';

@Module({
    imports: [
        ExpressCassandraModule.forFeature([StripeInterfaceEntity, StripeInterfacesRepository]),
    ],
    providers: [
        StripeInterfacesService
    ],
    exports: [
        StripeInterfacesService
    ]
})
export class StripeInterfacesModule {

}
