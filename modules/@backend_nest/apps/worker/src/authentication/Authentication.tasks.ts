import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { EmailValidationTaskDto } from '@app/server/authentication/dto/EmailValidationTask.dto';
import { EmailService } from '@lib/common/email/Email.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ResetPasswordTaskDto } from '@app/server/authentication/dto/ResetPasswordTask.dto';
import { NestError } from '@lib/common/utils/NestError';
import { b64Encode } from '@common/global';

/**
 * Task collection for the Authentication module
 */
@Injectable()
export class AuthenticationTasks implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param emailService
     * @param jwtService
     * @param mailingQueue
     * @param outrospectionService
     * @param shutdownService
     */
    constructor(
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
        @InjectQueue('mailing') private readonly mailingQueue: Queue,
        private readonly outrospectionService: OutrospectionService,
        private readonly shutdownService: ShutdownService,
    ) {}

    /**
     * Subscribe worker instances only
     */
    /* istanbul ignore next */
    async onModuleInit(): Promise<void> {
        const signature: InstanceSignature = await this.outrospectionService.getInstanceSignature();

        if (signature.name === 'worker') {
            this.mailingQueue
                .process('@@mailing/validationEmail', 1, this.validationEmail.bind(this))
                .then(() => console.log(`Closing Bull Queue @@mailing`))
                .catch(this.shutdownService.shutdownWithError);
            this.mailingQueue
                .process('@@mailing/resetPasswordEmail', 1, this.resetPasswordEmail.bind(this))
                .then(() => console.log(`Closing Bull Queue @@mailing`))
                .catch(this.shutdownService.shutdownWithError);
        }
    }

    /**
     * Task called by bull when a validation email should be sent
     * @param job
     */
    async validationEmail(job: Job<EmailValidationTaskDto>): Promise<void> {
        await job.progress(10);
        const signature = await this.jwtService.signAsync(job.data, {
            expiresIn: '1 day',
        });

        await job.progress(50);
        const validationLink = `${job.data.redirectUrl}?token=${encodeURIComponent(b64Encode(signature))}`;
        const res = await this.emailService.send({
            template: 'validate',
            to: job.data.email,
            locale: job.data.locale,
            locals: {
                validationLink,
                token: signature,
            },
        });

        if (res.error) {
            throw new NestError(res.error);
        }

        await job.progress(100);
    }

    /**
     * Task called by bull when reset password email is sent
     * @param job
     */
    async resetPasswordEmail(job: Job<ResetPasswordTaskDto>): Promise<void> {
        await job.progress(10);
        const signature = await this.jwtService.signAsync(job.data, {
            expiresIn: '1 day',
        });

        await job.progress(50);
        const validationLink = `${job.data.redirectUrl}?token=${encodeURIComponent(b64Encode(signature))}`;
        const res = await this.emailService.send({
            template: 'passwordReset',
            to: job.data.email,
            locale: job.data.locale,
            locals: {
                validationLink,
                token: signature,
            },
        });

        if (res.error) {
            throw new NestError(res.error);
        }

        await job.progress(100);
    }
}
