import {
    EmailDriver,
    EmailDriverResponse,
    EmailDriverResponseStatus,
    EmailDriverSendOptions,
} from '@lib/common/email/drivers/Email.driver.base';
import EmailTemplates from 'email-templates';
import path from 'path';
import fs from 'fs';
import { ConfigService } from '@lib/common/config/Config.service';
import Mailjet from 'node-mailjet';

/**
 * Mailjet driver to send emails in production
 */
/* istanbul ignore next */
export class MailjetDriver implements EmailDriver {
    /**
     * Mailjet instance to use to dispatch request
     */
    private mailjet: any;
    /**
     * Path where template sources can be found
     */
    private templatePath: string = null;

    /**
     * Configures the driver
     *
     * @param configService
     */
    public configure(configService: ConfigService): void {
        const apiKey: string = configService.get('MAILJET_API_KEY');
        const apiSecret: string = configService.get('MAILJET_API_SECRET');

        this.mailjet = Mailjet.connect(apiKey, apiSecret);
        this.templatePath = configService.get('EMAIL_TEMPLATE_PATH');
    }

    /**
     * Sends an email, according to the provided options
     *
     * @param options
     */
    public async send(options: EmailDriverSendOptions): Promise<EmailDriverResponse> {
        // Recover template path
        const templatePath = path.resolve(path.join(this.templatePath, options.template));

        // Recover locale to extract mail_subject
        const localeData = JSON.parse(
            fs.readFileSync(path.join(templatePath, 'locales', `${options.locale}.json`)).toString(),
        );

        // Prepare email rendered
        const email = new EmailTemplates({
            send: false,
            i18n: {
                logDebugFn: console.log,
                logger: console,
                directory: path.join(templatePath, 'locales'),
                locales: ['en', 'fr'],
            },
        });

        // Render email
        const mail = await email.render(templatePath, {
            ...options.locals,
            locale: options.locale,
        });

        // here should send
        try {
            await this.mailjet.post('send').request({
                FromEmail: 'noreply@ticket721.com',
                FromName: 'Ticket721',
                Subject: localeData['mail_subject'],
                'Html-part': mail,
                Recipients: [
                    {
                        Email: options.to,
                    },
                ],
            });
            return {
                options,
                status: EmailDriverResponseStatus.Sent,
            };
        } catch (e) {
            return {
                options,
                status: EmailDriverResponseStatus.Error,
                reason: e,
            };
        }
    }
}
