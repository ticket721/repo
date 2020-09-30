import { FileObject, FilestoreService } from '@lib/common/filestore/Filestore.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { FSService } from '@lib/common/fs/FS.service';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { Injectable } from '@nestjs/common';

/**
 * Accepted Mimetypes
 */
const mimetypeMapping = {
    'image/bmp': '.bmp',
    'image/gif': '.gif',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/svg+xml': '.svg',
};

/**
 * This is a test version of the filestore service, used to store images localy
 */
@Injectable()
export class TestFileStoreService implements FilestoreService {
    /**
     * Dependency injection
     *
     * @param configService
     * @param fsService
     */
    constructor(private readonly configService: ConfigService, private readonly fsService: FSService) {}

    /**
     * Saves the provided buffer as a file
     *
     * @param content
     * @param contentType
     */
    async save(content: Buffer, contentType: string = ''): Promise<ServiceResponse<FileObject>> {
        const id = uuid();

        this.fsService.writeFile(
            path.join(this.configService.get('IMAGE_SERVE_DIRECTORY'), `${id}${mimetypeMapping[contentType] || ''}`),
            content,
        );

        return {
            error: null,
            response: {
                url: `${this.configService.get('IMAGE_SERVE_PREFIX')}${id}${mimetypeMapping[contentType] || ''}`,
            },
        };
    }
}
