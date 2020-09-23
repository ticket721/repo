import { FileObject, FilestoreService } from '@lib/common/filestore/Filestore.service';
import { ConfigService }                from '@lib/common/config/Config.service';
import { ServiceResponse }  from '@lib/common/utils/ServiceResponse.type';

export class S3FileStoreService implements FilestoreService {
    constructor(
        private readonly configService: ConfigService
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
