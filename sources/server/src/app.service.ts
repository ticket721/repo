import { Injectable }    from '@nestjs/common';
import * as pack         from '../package.json';
import { APIInfos }      from './app.types';
import * as branch       from 'git-branch';
import { ConfigService } from './config/config.service';

/**
 * Stores current branch to prevent spam requests
 */
const currentBranch = branch.sync();

/**
 * Utility to recover the APIInfos
 */
@Injectable()
export class AppService {

    /**
     * ConfigService to recover NODE_ENV
     */
    config: ConfigService;

    /**
     * Recovers the ConfigService
     * @param config
     */
    constructor(config: ConfigService) {
        this.config = config;
    }

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
