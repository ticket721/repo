import { deepEqual, instance, mock, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import {
    EmailDriver,
    EmailDriverResponse,
    EmailDriverResponseStatus,
    EmailDriverSendOptions,
} from '@lib/common/email/drivers/Email.driver.base';
import { EmailService } from '@lib/common/email/Email.service';
import { ConfigService } from '@lib/common/config/Config.service';

const context: {
    emailDriver: EmailDriver;
    emailService: EmailService;
} = {
    emailDriver: null,
    emailService: null,
};

class EmailDriverMock implements EmailDriver {
    public async send(options: EmailDriverSendOptions): Promise<EmailDriverResponse> {
        return null;
    }

    public configure(configService: ConfigService): void {}
}

describe('Email Service', () => {
    beforeEach(async function() {
        const emailDriverMock: EmailDriver = mock(EmailDriverMock);

        const EmailDriverProvider = {
            provide: EmailDriver,
            useValue: instance(emailDriverMock),
        };

        const app: TestingModule = await Test.createTestingModule({
            providers: [EmailDriverProvider, EmailService],
        }).compile();

        const emailService: EmailService = app.get<EmailService>(EmailService);

        context.emailDriver = emailDriverMock;
        context.emailService = emailService;
    });

    it('should send an email', async function() {
        const emailDriverMock = context.emailDriver;
        const emailService = context.emailService;

        const to = 'iulian@rotaru.fr';
        const template = 'validate';
        const locale = 'en';
        const locals = {
            data: 'yes',
        };

        when(
            emailDriverMock.send(
                deepEqual({
                    to,
                    template,
                    locals,
                    locale,
                }),
            ),
        ).thenReturn(
            Promise.resolve({
                options: {
                    to,
                    template,
                    locals,
                    locale,
                },
                status: EmailDriverResponseStatus.Sent,
            }),
        );

        const result = await emailService.send({
            to,
            template,
            locals,
            locale,
        });

        expect(result.error).toEqual(null);
        expect(result.response).toEqual({
            to,
            template,
            locals,
            locale,
        });
    });

    it('should forward errors', async function() {
        const emailDriverMock = context.emailDriver;
        const emailService = context.emailService;

        const to = 'iulian@rotaru.fr';
        const template = 'validate';
        const locale = 'en';
        const locals = {
            data: 'yes',
        };

        when(
            emailDriverMock.send(
                deepEqual({
                    to,
                    template,
                    locals,
                    locale,
                }),
            ),
        ).thenReturn(
            Promise.resolve({
                options: {
                    to,
                    template,
                    locals,
                    locale,
                },
                status: EmailDriverResponseStatus.Error,
                reason: 'an_error_occured',
            }),
        );

        const result = await emailService.send({
            to,
            template,
            locals,
            locale,
        });

        expect(result.error).toEqual('an_error_occured');
        expect(result.response).toEqual({
            to,
            template,
            locals,
            locale,
        });
    });
});
