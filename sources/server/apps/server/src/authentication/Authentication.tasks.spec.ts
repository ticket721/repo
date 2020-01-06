import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, JobOptions } from 'bull';
import { AuthenticationTasks } from '@app/server/authentication/Authentication.tasks';
import { EmailService } from '@app/server/email/Email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@lib/common/config/Config.service';
import { getQueueToken } from '@nestjs/bull';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

class JobMock {
    data: any;
    async progress(num: number): Promise<void> {}
}

const context: {
    authenticationTasks: AuthenticationTasks;
    emailServiceMock: EmailService;
    jwtServiceMock: JwtService;
    configServiceMock: ConfigService;
    mailingQueueMock: QueueMock;
} = {
    authenticationTasks: null,
    emailServiceMock: null,
    jwtServiceMock: null,
    configServiceMock: null,
    mailingQueueMock: null,
};

describe('Authentication Tasks', function() {
    beforeEach(async function() {
        const emailServiceMock: EmailService = mock(EmailService);
        const jwtServiceMock: JwtService = mock(JwtService);
        const configServiceMock: ConfigService = mock(ConfigService);
        const mailingQueueMock: QueueMock = mock(QueueMock);

        const EmailServiceProvider = {
            provide: EmailService,
            useValue: instance(emailServiceMock),
        };

        const JwtServiceProvider = {
            provide: JwtService,
            useValue: instance(jwtServiceMock),
        };

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(configServiceMock),
        };

        const MailingQueueProvider = {
            provide: getQueueToken('mailing'),
            useValue: instance(mailingQueueMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailServiceProvider,
                JwtServiceProvider,
                ConfigServiceProvider,
                MailingQueueProvider,
                AuthenticationTasks,
            ],
        }).compile();

        context.authenticationTasks = module.get<AuthenticationTasks>(
            AuthenticationTasks,
        );
        context.emailServiceMock = emailServiceMock;
        context.jwtServiceMock = jwtServiceMock;
        context.mailingQueueMock = mailingQueueMock;
        context.configServiceMock = configServiceMock;
    });

    describe('validationEmail', function() {
        it('should send an email', async function() {
            const jobMock: JobMock = mock(JobMock);
            const authenticationTasks: AuthenticationTasks =
                context.authenticationTasks;
            const emailServiceMock: EmailService = context.emailServiceMock;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const mailingQueueMock: QueueMock = context.mailingQueueMock;
            const configServiceMock: ConfigService = context.configServiceMock;

            const email = 'iulian@t721.com';
            const locale = 'en';
            const username = 'mortimr';
            const id = '0';

            const payload = {
                email,
                locale,
                username,
                id,
            };

            const signature = 'signature';

            const validationUrl = 'https://ticket721.com';

            const emailPayload = {
                to: email,
                template: 'validate',
                locale,
                locals: {
                    validationLink: `${validationUrl}?token=${encodeURIComponent(
                        signature,
                    )}`,
                    token: signature,
                },
            };

            instance(jobMock).data = payload;

            when(
                jwtServiceMock.signAsync(
                    deepEqual(payload),
                    deepEqual({
                        expiresIn: '1 day',
                    }),
                ),
            ).thenReturn(Promise.resolve(signature));

            when(configServiceMock.get('VALIDATION_URL')).thenReturn(
                validationUrl,
            );

            when(emailServiceMock.send(deepEqual(emailPayload))).thenReturn(
                Promise.resolve({
                    error: null,
                    response: emailPayload,
                }),
            );

            await authenticationTasks.validationEmail(instance(jobMock) as Job);

            verify(emailServiceMock.send(deepEqual(emailPayload))).called();

            verify(configServiceMock.get('VALIDATION_URL')).called();

            verify(
                jwtServiceMock.signAsync(
                    deepEqual(payload),
                    deepEqual({
                        expiresIn: '1 day',
                    }),
                ),
            ).called();

            verify(jobMock.progress(10)).called();
            verify(jobMock.progress(50)).called();
            verify(jobMock.progress(100)).called();
        });

        it('should throw', async function() {
            const jobMock: JobMock = mock(JobMock);
            const authenticationTasks: AuthenticationTasks =
                context.authenticationTasks;
            const emailServiceMock: EmailService = context.emailServiceMock;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const mailingQueueMock: QueueMock = context.mailingQueueMock;
            const configServiceMock: ConfigService = context.configServiceMock;

            const email = 'iulian@t721.com';
            const locale = 'en';
            const username = 'mortimr';
            const id = '0';

            const payload = {
                email,
                locale,
                username,
                id,
            };

            const signature = 'signature';

            const validationUrl = 'https://ticket721.com';

            const emailPayload = {
                to: email,
                template: 'validate',
                locale,
                locals: {
                    validationLink: `${validationUrl}?token=${encodeURIComponent(
                        signature,
                    )}`,
                    token: signature,
                },
            };

            instance(jobMock).data = payload;

            when(
                jwtServiceMock.signAsync(
                    deepEqual(payload),
                    deepEqual({
                        expiresIn: '1 day',
                    }),
                ),
            ).thenReturn(Promise.resolve(signature));

            when(configServiceMock.get('VALIDATION_URL')).thenReturn(
                validationUrl,
            );

            when(emailServiceMock.send(deepEqual(emailPayload))).thenReturn(
                Promise.resolve({
                    error: 'unexpected_error',
                    response: null,
                }),
            );

            await expect(
                authenticationTasks.validationEmail(instance(jobMock) as Job),
            ).rejects.toMatchObject({
                message: 'unexpected_error',
            });

            verify(emailServiceMock.send(deepEqual(emailPayload))).called();

            verify(configServiceMock.get('VALIDATION_URL')).called();

            verify(
                jwtServiceMock.signAsync(
                    deepEqual(payload),
                    deepEqual({
                        expiresIn: '1 day',
                    }),
                ),
            ).called();

            verify(jobMock.progress(10)).called();
            verify(jobMock.progress(50)).called();
            verify(jobMock.progress(100)).never();
        });
    });
});
