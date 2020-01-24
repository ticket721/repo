import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { ImagesService } from '@lib/common/images/Images.service';
import { ImageEntity } from '@lib/common/images/entities/Image.entity';
import { ImagesRepository } from '@lib/common/images/Images.repository';

@Module({
    imports: [
        ExpressCassandraModule.forFeature([ImageEntity, ImagesRepository]),
    ],
    providers: [ImagesService],
    exports: [ImagesService],
})
export class ImagesModule {}
