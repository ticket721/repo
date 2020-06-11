import { Inject, Injectable } from '@nestjs/common';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ConfigService } from '@lib/common/config/Config.service';

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
     * Name of the instance
     */
    instanceName: string;
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
     * Name of current instance (hostname)
     */
    private readonly instanceName: string = null;

    /**
     * Dependency Injection and position retrieval
     *
     * @param name
     * @param configService
     * @param shutdownService
     * @param hostnameGetter
     */
    constructor(
        @Inject('OUTROSPECTION_INSTANCE_NAME') private readonly name,
        configService: ConfigService,
        shutdownService: ShutdownService,
        @Inject('OUTROSPECTION_HOSTNAME_GETTER') hostnameGetter: () => string,
    ) {
        this.master = configService.get('MASTER') === 'true';
        this.instanceName = hostnameGetter();
    }

    /**
     * Asynchrinous getter to recover the current position
     */
    public async getInstanceSignature(): Promise<InstanceSignature> {
        return {
            signature: `${this.name}${this.master ? ' MASTER' : ''}`,
            master: this.master,
            name: this.name,
            instanceName: this.instanceName,
        };
    }
}
