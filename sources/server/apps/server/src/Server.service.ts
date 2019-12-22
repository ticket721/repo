import { Injectable }    from '@nestjs/common';
import * as pack         from '../../../package.json';
import * as branch       from 'git-branch';
import { APIInfos }      from './Server.types';
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
     * @param config
     */
    constructor(private readonly config: ConfigService) {}

    /**
     * Utility to get the API Information
     */
    getAPIInfos(): APIInfos {
        return {
            version: pack.version,
            name: 't721api',
            env: `${this.config.get('NODE_ENV')}@${currentBranch}`,
        };
    }
}
