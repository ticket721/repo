import { Inject, Injectable } from '@nestjs/common';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ConfigService } from '@lib/common/config/Config.service';
// import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';

/**
 * Outrospection options to properly fetch position infos
 */
export interface OutrospectionOptions {
    /**
     * Instance type name
     */
    name: string;
}

/**
 * Unique identifier of the instance
 */
export interface InstanceSignature {
    /**
     * Summary string
     */
    signature: string;

    /**
     * True if first instance of the batch
     */
    master: boolean;

    /**
     * Name of instance type
     */
    name: string;

    /**
     * Position of the instance in the current replica set
     */
    position: number;

    /**
     * Total number of instances of this type inside the replica set
     */
    total: number;
}

/**
 * Service to recover the current position of the instance inside the replica
 * set.
 */
@Injectable()
export class OutrospectionService {
    /**
     * True if current instance is in master mode. Useful when some instances of
     * a given type have to do non scalable tasks.
     */
    private readonly master: boolean = false;

    /**
     * Current position of the instance in the replica set. Starting at 1.
     */
    private readonly position: number = null;

    /**
     * Regular Expression to match the end of the hostname
     */
    private readonly positionRegexp = /^-[0123456789]+$/;

    /**
     * Dependency Injection and position retrieval
     *
     * @param outrospectionOptions
     * @param configService
     * @param shutdownService
     * @param hostnameGetter
     */
    constructor(
        @Inject('OUTROSPECTION_MODULE_OPTIONS')
        private readonly outrospectionOptions: OutrospectionOptions,
        configService: ConfigService,
        shutdownService: ShutdownService,
        @Inject('OUTROSPECTION_HOSTNAME_GETTER') hostnameGetter: () => string,
        // private readonly globalConfigService: GlobalConfigService,
    ) {
        if (configService.get('NODE_ENV') === 'development') {
            this.master = true;
            this.position = 1;
        } else {
            const hostname: string = hostnameGetter();

            if (
                hostname.indexOf(outrospectionOptions.name) !== 0 ||
                !this.positionRegexp.test(hostname.slice(outrospectionOptions.name.length))
            ) {
                const error = new Error(
                    `Invalid instance name '${outrospectionOptions.name}', cannot extract position in hostname '${hostname}'`,
                );
                shutdownService.shutdownWithError(error);
                throw error;
            }

            this.position = parseInt(hostname.slice(outrospectionOptions.name.length + 1), 10) + 1;

            if (this.position === 1) {
                this.master = true;
            }
        }
    }

    /**
     * Asynchrinous getter to recover the current position
     */
    public async getInstanceSignature(): Promise<InstanceSignature> {
        const total = 1;

        return {
            signature: `${this.outrospectionOptions.name} [${this.position} / ${total}]${this.master ? ' MASTER' : ''}`,
            master: this.master,
            name: this.outrospectionOptions.name,
            position: this.position,
            total,
        };
    }
}
