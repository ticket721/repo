import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, JobOptions } from 'bull';
import { AuthenticationTasks } from '@app/worker/authentication/Authentication.tasks';
import { EmailService } from '@lib/common/email/Email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@lib/common/config/Config.service';
import { getQueueToken } from '@nestjs/bull';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';

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
    outrospectionServiceMock: OutrospectionService;
} = {
    authenticationTasks: null,
    emailServiceMock: null,
    jwtServiceMock: null,
    configServiceMock: null,
    mailingQueueMock: null,
    outrospectionServiceMock: null,
};

describe('Authentication Tasks', function() {
    beforeEach(async function() {
        context.emailServiceMock = mock(EmailService);
        context.jwtServiceMock = mock(JwtService);
        context.configServiceMock = mock(ConfigService);
        context.mailingQueueMock = mock(QueueMock);
        context.outrospectionServiceMock = mock(OutrospectionService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: EmailService,
                    useValue: instance(context.emailServiceMock),
                },
                {
                    provide: JwtService,
                    useValue: instance(context.jwtServiceMock),
                },
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },
                {
                    provide: getQueueToken('mailing'),
                    useValue: instance(context.mailingQueueMock),
                },
                {
                    provide: OutrospectionService,
                    useValue: instance(context.outrospectionServiceMock),
                },
                AuthenticationTasks,
            ],
        }).compile();

        context.authenticationTasks = module.get<AuthenticationTasks>(
            AuthenticationTasks,
        );
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
