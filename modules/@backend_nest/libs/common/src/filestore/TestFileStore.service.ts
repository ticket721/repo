import { FileObject, FilestoreService } from '@lib/common/filestore/Filestore.service';
import { ConfigService }                from '@lib/common/config/Config.service';
import { ServiceResponse }              from '@lib/common/utils/ServiceResponse.type';
import { FSService }                    from '@lib/common/fs/FS.service';

export class TestFileStoreService implements FilestoreService {
    constructor(
        private readonly configService: ConfigService,
        private readonly fsService: FSService
    ) {}

    async save(name: string, content: Buffer): Promise<ServiceResponse<FileObject>> {



        return {
            error: null,
            response: {
                url: 'test'
            }
        }
    }
}
