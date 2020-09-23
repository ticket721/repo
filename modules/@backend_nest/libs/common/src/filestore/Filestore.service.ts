import { Injectable }      from '@nestjs/common';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

export interface FileObject {
    url: string;
}

@Injectable()
export abstract class FilestoreService {
    abstract async save(content: Buffer, contentType?: string): Promise<ServiceResponse<FileObject>>;
}
