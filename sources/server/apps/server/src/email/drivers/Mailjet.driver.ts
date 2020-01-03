import {
    EmailDriver,
    EmailDriverOptions,
} from '@app/server/email/drivers/Email.driver.base';
import EmailTemplates from 'email-templates';
import path from 'path';

/* istanbul ignore next */
export class MailjetDriver implements EmailDriver {
    public async send(options: EmailDriverOptions): Promise<void> {
        // Recover template path
        const templatePath = path.join(
            __dirname,
            '../templates',
            options.template,
        );

        // Recover locale to extract mail_subject
        const localeData = require(path.join(
            templatePath,
            'locales',
            options.locale,
        ));

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
    }
}
