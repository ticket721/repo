/**
 * Data model returned when generating an update url
 */
export class PaymentStripeGenerateUpdateUrlResponseDto {
    /**
     * Timestamp of creation
     */
    created: number;

    /**
     * Timestamp of expiration
     */
    // tslint:disable-next-line:variable-name
    expires_at: number;

    /**
     * URL to follow
     */
    url: string;
}
