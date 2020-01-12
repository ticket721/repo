import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';

@Module({
    imports: [ExpressCassandraModule.forFeature([])],
    providers: [],
    exports: [],
})
export class EventsModule {}
