import { Injectable } from '@nestjs/common';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

/**
 * Store Object
 */
export interface FileObject {
    /**
     * Url to access the object
     */
    url: string;
}

/**
 * Abstract file store
 */
@Injectable()
export abstract class FilestoreService {
    /**
     * Saves the provided buffer as a file
     *
     * @param content
     * @param contentType
     */
    abstract async save(content: Buffer, contentType?: string): Promise<ServiceResponse<FileObject>>;
}
