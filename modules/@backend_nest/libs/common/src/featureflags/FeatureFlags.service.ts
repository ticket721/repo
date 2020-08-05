import { Injectable } from '@nestjs/common';
import { FSService } from '@lib/common/fs/FS.service';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ConfigService } from '@lib/common/config/Config.service';

/**
 * Flag content
 */
export interface Flag {
    /**
     * True if feature should be displayed
     */
    active: boolean;
}

/**
 * All flags
 */
export interface Flags {
    [key: string]: Flag;
}

/**
 * Service to generate custom feature flags for each users
 */
@Injectable()
export class FeatureFlagsService {
    /**
     * Dependency Injection
     *
     * @param fsService
     * @param configService
     */
    constructor(private readonly fsService: FSService, private readonly configService: ConfigService) {}

    /**
     * Compute flags values depending on configuration
     *
     * @param user
     * @param config
     */
    public computeFlags(user: UserDto, config: Flags): Flags {
        // Admins should have all flags always active
        if (user.admin) {
            for (const key of Object.keys(config)) {
                config[key].active = true;
            }
        }

        return config;
    }

    /**
     * Recover config and compute flags for specific user
     *
     * @param user
     */
    public getFlags(user: UserDto): ServiceResponse<Flags> {
        const flagsPath = this.configService.get('FEATURE_FLAGS_CONFIG');

        if (!flagsPath) {
            return {
                error: null,
                response: {},
            };
        } else {
            try {
                const featureFlagsConfig = JSON.parse(this.fsService.readFile(flagsPath));
                return {
                    error: null,
                    response: this.computeFlags(user, featureFlagsConfig),
                };
            } catch (e) {
                return {
                    error: e.message,
                    response: null,
                };
            }
        }
    }
}
