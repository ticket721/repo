import { Module }               from '@nestjs/common';
import { FilestoreService }     from '@lib/common/filestore/Filestore.service';
import { S3FileStoreService }   from '@lib/common/filestore/S3FileStore.service';
import { TestFileStoreService } from '@lib/common/filestore/TestFileStore.service';
import { ConfigModule }         from '@lib/common/config/Config.module';
import { FSModule }             from '@lib/common/fs/FS.module';

@Module({
    imports: [
        ... (process.env.NODE_ENV === 'production'

                ?
                [
                    ConfigModule,
                    FSModule
                ]

                :
                [
                    ConfigModule,
                ]
        )
    ],
    providers: [{
        provide: FilestoreService,
        useClass: process.env.NODE_ENV === 'production' ? TestFileStoreService : S3FileStoreService
    }]
})
export class FilestoreModule {
}

