import { ConfigService } from '@lib/common/config/Config.service';

/**
 * Options to send an email
 */
export interface EmailDriverSendOptions {
    /**
     * Template to use
     */
    template: string;

    /**
     * Target of the email
     */
    to: string;

    /**
     * Locale to use to compile the template
     */
    locale: string;

    /**
     * Set of variables to configure the template
     */
    locals: any;
}

/**
 * Status of the dispatch
 */
export enum EmailDriverResponseStatus {
    Sent,
    Error,
}

/**
 * Response upon email dispatch
 */
export interface EmailDriverResponse {
    /**
     * Provided options are returned
     */
    options: EmailDriverSendOptions;

    /**
     * Status of the dispatch
     */
    status: EmailDriverResponseStatus;

    /**
     * Defined in case of error, with information about the error
     */
    reason?: string;
}

/**
 * Base class for the email driver implementations
 */
export abstract class EmailDriver {
    /**
     * Sends an email, according to the provided options
     *
     * @param options
     */
    public abstract async send(
        options: EmailDriverSendOptions,
    ): Promise<EmailDriverResponse>;

    /**
     * Configures the driver
     *
     * @param configService
     */
    public abstract configure(configService: ConfigService): void;
}
