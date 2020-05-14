import {
    EmailDriver,
    EmailDriverResponse,
    EmailDriverResponseStatus,
    EmailDriverSendOptions,
} from '@lib/common/email/drivers/Email.driver.base';
import EmailTemplates from 'email-templates';
import PreviewEmail from 'preview-email';
import path from 'path';
import { ConfigService } from '@lib/common/config/Config.service';
import fs from 'fs';

/**
 * Development driver. If preview is enabled, emails are opened in the browser
 */
/* istanbul ignore next */
export class DevDriver implements EmailDriver {
    /**
     * True if emails are opened in the browser
     */
    private preview: boolean = false;

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
        if (configService.get('EMAIL_BROWSER_PREVIEW') === 'true') {
            this.preview = true;
        }

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
                // logDebugFn: console.log,
                // logger: console,
                directory: path.join(templatePath, 'locales'),
                locales: ['en', 'fr'],
            },
        });

        // Render email
        const mail = await email.render(templatePath, {
            ...options.locals,
            locale: options.locale,
        });

        // Preview config
        const message = {
            from: 'noreply@ticket721.com',
            to: options.to,
            subject: localeData['mail_subject'],
            html: mail,
        };

        if (this.preview) {
            // Run preview
            await PreviewEmail(message, {
                open: {
                    wait: false,
                },
            });
        }

        return {
            options,
            status: EmailDriverResponseStatus.Sent,
        };
    }
}
