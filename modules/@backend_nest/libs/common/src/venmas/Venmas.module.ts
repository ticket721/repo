import { Module }                 from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { VenmasService }          from './Venmas.service';
import { VenmasRepository }       from './Venmas.repository';
import { VenmasEntity }           from './entities/Venmas.entity';

@Module({
    imports: [ExpressCassandraModule.forFeature([VenmasEntity, VenmasRepository])],
    providers: [VenmasService],
    exports: [VenmasService]
})
export class VenmasModule {}
