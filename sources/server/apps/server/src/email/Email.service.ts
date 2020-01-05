import {
    EmailDriver,
    EmailDriverResponse,
    EmailDriverResponseStatus,
    EmailDriverSendOptions,
} from '@app/server/email/drivers/Email.driver.base';
import { Injectable } from '@nestjs/common';
import { ServiceResponse } from '@app/server/utils/ServiceResponse';

/**
 * Service to send emails with selected EmailDriver
 */
@Injectable()
export class EmailService {
    /**
     * Dependency Injection
     *
     * @param emailDriver
     */
    constructor(private readonly emailDriver: EmailDriver) {}

    /**
     * Send an email to the target email address. Compiles and injects locals
     * into selected template.
     *
     * @param options
     */
    async send(
        options: EmailDriverSendOptions,
    ): Promise<ServiceResponse<EmailDriverSendOptions>> {
        const result: EmailDriverResponse = await this.emailDriver.send(
            options,
        );
        switch (result.status) {
            case EmailDriverResponseStatus.Sent: {
                return {
                    error: null,
                    response: options,
                };
            }

            case EmailDriverResponseStatus.Error: {
                return {
                    error: result.reason,
                    response: options,
                };
            }
        }
    }
}
