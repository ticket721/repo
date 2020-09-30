/**
 * Data Model returned when generating an onboarding url
 */
export class PaymentStripeGenerateOnboardingUrlResponseDto {
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
