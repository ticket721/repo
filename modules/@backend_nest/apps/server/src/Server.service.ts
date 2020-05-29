import { Injectable } from '@nestjs/common';
import pack from '../../../package.json';
import { APIInfos } from './Server.types';
import { ConfigService } from '@lib/common/config/Config.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';

/**
 * Utility to recover the APIInfos
 */
@Injectable()
export class ServerService {
    /**
     * Recovers the ConfigService
     * @param configService
     * @param outrospectionService
     */
    constructor(
        private readonly configService: ConfigService,
        private readonly outrospectionService: OutrospectionService,
    ) {}

    /**
     * Utility to get the API Information
     */
    async getAPIInfos(): Promise<APIInfos> {
        const instanceSignature = await this.outrospectionService.getInstanceSignature();

        return {
            version: pack.version,
            name: 't721api',
            env: `${this.configService.get('NODE_ENV')}@${process.env['TAG'] || 'bare'}`,
            position: instanceSignature.position,
        };
    }
}
