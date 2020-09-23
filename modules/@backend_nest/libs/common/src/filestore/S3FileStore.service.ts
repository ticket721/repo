import { FileObject, FilestoreService } from '@lib/common/filestore/Filestore.service';
import { ConfigService }                from '@lib/common/config/Config.service';
import { ServiceResponse }              from '@lib/common/utils/ServiceResponse.type';
import { S3, config }                   from 'aws-sdk';
import { v4 as uuid }                   from 'uuid';
import { Injectable }                   from '@nestjs/common';

@Injectable()
export class S3FileStoreService implements FilestoreService {

    private s3: S3;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.s3 = new S3();
        console.log('ha');
        config.update({
            accessKeyId: configService.get('IMAGE_S3_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('IMAGE_S3_SECRET_ACCESS_KEY'),
            region: configService.get('IMAGE_S3_REGION')
        });
        console.log('beh');
    }

    async save(content: Buffer, contentType?: string): Promise<ServiceResponse<FileObject>> {

        try {
            const file = await this.s3.upload({
                Bucket: this.configService.get('IMAGE_S3_BUCKET_NAME'),
                Body: content,
                Key: `public/${uuid()}`,
                ContentType: contentType
            }).promise();

            return {
                error: null,
                response: {
                    url: file.Location
                }
            }
        } catch (e) {
            return {
                error: 'cannot_upload_image',
                response: null
            }
        }
    }
}
