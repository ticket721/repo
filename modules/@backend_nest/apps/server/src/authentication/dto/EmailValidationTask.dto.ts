/**
 * Data structure required by the validation email task
 */
export class EmailValidationTaskDto {
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

    /**
     * User id
     */
    id: string;

    /**
     * Redirection url
     */
    redirectUrl: string;
}
