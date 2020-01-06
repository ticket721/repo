import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { EmailValidationTaskDto } from '@app/server/authentication/dto/EmailValidationTask.dto';
import { EmailService } from '@app/server/email/Email.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@lib/common/config/Config.service';

/**
 * Task collection for the Authentication module
 */
@Injectable()
@Processor('mailing')
export class AuthenticationTasks {
    /**
     * Dependency Injection
     *
     * @param emailService
     * @param jwtService
     * @param configService
     * @param mailingQueue
     */
    constructor(
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectQueue('mailing') private readonly mailingQueue: Queue,
    ) {}

    /**
     * Task called by bull when a validation email should be sent
     * @param job
     */
    @Process('@@mailing/validationEmail')
    async validationEmail(job: Job<EmailValidationTaskDto>): Promise<void> {
        await job.progress(10);
        const signature = await this.jwtService.signAsync(job.data, {
            expiresIn: '1 day',
        });

        await job.progress(50);
        const validationLink = `${this.configService.get(
            'VALIDATION_URL',
        )}?token=${encodeURIComponent(signature)}`;
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
            throw new Error(res.error);
        }

        await job.progress(100);
    }
}
