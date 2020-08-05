import { Injectable } from '@nestjs/common';
import { FSService } from '@lib/common/fs/FS.service';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ConfigService } from '@lib/common/config/Config.service';

export interface Flag {
    active: boolean;
}

export interface Flags {
    [key: string]: Flag;
}

@Injectable()
export class FeatureFlagsService {
    constructor(private readonly fsService: FSService, private readonly configService: ConfigService) {}

    public computeFlags(user: UserDto, config: Flags) {
        // Admins should have all flags always active
        if (user.admin) {
            for (const key of Object.keys(config)) {
                config[key].active = true;
            }
        }

        return config;
    }

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
