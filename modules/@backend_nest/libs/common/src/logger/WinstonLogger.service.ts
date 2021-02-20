import { LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

/**
 * Format utility
 */
const { combine, timestamp, printf, json } = format;

/**
 * Utility to handle all the logs of the API
 */
export class WinstonLoggerService implements LoggerService {
    /**
     * Instance of the Logger
     */
    logger: Logger;

    /**
     * Builds the logger. Console is used when not in production
     */
    constructor(section: string) {
        this.logger = createLogger({
            level: process.env['LOG_LEVEL'] || 'info',
            format: combine(timestamp(), json()),
            defaultMeta: { section },
            transports: [
                new transports.File({
                    filename: `error.log`,
                    level: 'error',
                    dirname: process.env['LOG_DIR'] || '/tmp',
                }),
                new transports.File({
                    filename: `combined.log`,
                    dirname: process.env['LOG_DIR'] || '/tmp',
                }),
            ],
        });

        const myFormat = printf(data => {
            return `[ ${data.timestamp} | ${data.section ? data.section + ' | ' : ''}${data.level} ] ${data.message}`;
        });

        this.logger.add(
            new transports.Console({
                format: combine(timestamp(), myFormat),
            }),
        );
    }

    /**
     * `info` level log
     *
     * @param message
     */
    log(message: string) {
        this.logger.info(message);
    }

    /**
     * `error` level log
     *
     * @param e
     */
    error(e: Error | string) {
        if ((e as any).message && (e as any).stack) {
            this.logger.error((e as Error).message);
            this.logger.error((e as Error).stack);
        } else {
            this.logger.error(e as string);
        }
    }

    /**
     * `warn` level log
     *
     * @param message
     */
    warn(message: string) {
        this.logger.warn(message);
    }

    /**
     * `debug` level log
     *
     * @param message
     */
    debug(message: string) {
        this.logger.debug(message);
    }

    /**
     * `verbose` level log
     *
     * @param message
     */
    verbose(message: string) {
        this.logger.verbose(message);
    }
}
