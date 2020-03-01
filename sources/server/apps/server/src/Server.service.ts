import { Injectable } from '@nestjs/common';
import pack from '../../../package.json';
import branch from 'git-branch';
import { APIInfos } from './Server.types';
import { ConfigService } from '@lib/common/config/Config.service';

/**
 * Stores current branch to prevent spam requests
 */
const currentBranch = branch.sync();

/**
 * Utility to recover the APIInfos
 */
@Injectable()
export class ServerService {
    /**
     * Recovers the ConfigService
     * @param configService
     */
    constructor /* instanbul ignore next */(private readonly configService: ConfigService) {}

    /**
     * Utility to get the API Information
     */
    getAPIInfos(): APIInfos {
        return {
            version: pack.version,
            name: 't721api',
            env: `${this.configService.get('NODE_ENV')}@${currentBranch}`,
        };
    }
}
