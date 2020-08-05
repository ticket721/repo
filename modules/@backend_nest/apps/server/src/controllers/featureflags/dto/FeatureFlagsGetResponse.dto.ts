import { Flags } from '@lib/common/featureflags/FeatureFlags.service';

/**
 * Data model returned when requesting user feature flags
 */
export class FeatureFlagsGetResponseDto {
    /**
     * Flags
     */
    flags: Flags;
}
