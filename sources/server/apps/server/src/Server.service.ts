import { Injectable, OnModuleInit } from '@nestjs/common';
import pack from '../../../package.json';
import branch from 'git-branch';
import { APIInfos } from './Server.types';
import { ConfigService } from '@lib/common/config/Config.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

/**
 * Stores current branch to prevent spam requests
 */
const currentBranch = branch.sync();

/**
 * Utility to recover the APIInfos
 */
@Injectable()
export class ServerService implements OnModuleInit {
    /**
     * Recovers the ConfigService
     * @param configService
     * @param loggerService
     */
    constructor /* instanbul ignore next */(
        private readonly configService: ConfigService,
        private readonly loggerService: WinstonLoggerService,
    ) {}

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

    /**
     * System boot
     */
    async onModuleInit(): Promise<void> {
        const podInfos: number = this.configService.getRole();

        this.loggerService.log(`Started instance #${podInfos}`);
    }
}
