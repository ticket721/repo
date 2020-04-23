/**
 * Data structure required by the reseting password task
 */
export class ResetPasswordTaskDto {
    /**
     * Email recipient
     */
    email: string;

    /**
     * Locale to use
     */
    locale: string;

    /**
     * Username
     */
    username: string;
}
