import { AxiosResponse }              from 'axios';
import { T721SDK }                    from '../../index';
import { FeatureFlagsGetResponseDto } from '@app/server/controllers/featureflags/dto/FeatureFlagsGetResponse.dto';

export async function featureFlagsFetch(
    token: string
): Promise<AxiosResponse<FeatureFlagsGetResponseDto>> {

    const self: T721SDK = this;

    return self.get('/feature-flags/', {
        Authorization: `Bearer ${token}`
    });
}
