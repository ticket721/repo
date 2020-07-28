import { Module }                 from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { RightEntity }            from '@lib/common/rights/entities/Right.entity';
import { RightsRepository }       from '@lib/common/rights/Rights.repository';

@Module({
    imports: [ExpressCassandraModule.forFeature([RightEntity, RightsRepository])],
})
export class StripeInterfacesModule {

}
