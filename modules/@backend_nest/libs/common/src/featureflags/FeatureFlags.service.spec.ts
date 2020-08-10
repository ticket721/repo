import { FeatureFlagsService, Flags } from '@lib/common/featureflags/FeatureFlags.service';
import { FSService } from '@lib/common/fs/FS.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { NestError } from '@lib/common/utils/NestError';

describe('FeatureFlags Service', function() {
    const context: {
        featureFlagsService: FeatureFlagsService;
        fsServiceMock: FSService;
        configServiceMock: ConfigService;
    } = {
        featureFlagsService: null,
        fsServiceMock: null,
        configServiceMock: null,
    };

    beforeEach(async function() {
        context.fsServiceMock = mock(FSService);
        context.configServiceMock = mock(ConfigService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: FSService,
                    useValue: instance(context.fsServiceMock),
                },
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },
                FeatureFlagsService,
            ],
        }).compile();

        context.featureFlagsService = app.get<FeatureFlagsService>(FeatureFlagsService);
    });

    describe('computeFlags', function() {
        it('should return same config for non admin user', function() {
            const flags: Flags = {
                flag_one: {
                    active: true,
                },
                flag_two: {
                    active: false,
                },
            };

            const user: UserDto = {
                admin: false,
            } as UserDto;

            expect(context.featureFlagsService.computeFlags(user, flags)).toEqual(flags);
        });

        it('should return same config for admin user', function() {
            const flags: Flags = {
                flag_one: {
                    active: true,
                },
                flag_two: {
                    active: false,
                },
            };

            const user: UserDto = {
                admin: true,
            } as UserDto;

            expect(context.featureFlagsService.computeFlags(user, flags)).toEqual({
                flag_one: {
                    active: true,
                },
                flag_two: {
                    active: true,
                },
            });
        });
    });

    describe('getFlags', function() {
        it('should properly recover config from file', function() {
            const flags: Flags = {
                flag_one: {
                    active: true,
                },
                flag_two: {
                    active: false,
                },
            };

            const user: UserDto = {
                admin: false,
            } as UserDto;

            const config = './path/to/config.json';

            const spiedService = spy(context.featureFlagsService);

            when(context.configServiceMock.get('FEATURE_FLAGS_CONFIG')).thenReturn(config);
            when(context.fsServiceMock.readFile(config)).thenReturn(JSON.stringify(flags));
            when(spiedService.computeFlags(deepEqual(user), deepEqual(flags))).thenReturn(flags);

            const flagResponse = context.featureFlagsService.getFlags(user);

            expect(flagResponse.error).toEqual(null);
            expect(flagResponse.response).toEqual(flags);

            verify(context.configServiceMock.get('FEATURE_FLAGS_CONFIG')).once();
            verify(context.fsServiceMock.readFile(config)).once();
            verify(spiedService.computeFlags(deepEqual(user), deepEqual(flags))).once();
        });

        it('should fail on invalid format', function() {
            const user: UserDto = {
                admin: false,
            } as UserDto;

            const config = './path/to/config.json';

            when(context.configServiceMock.get('FEATURE_FLAGS_CONFIG')).thenReturn(config);
            when(context.fsServiceMock.readFile(config)).thenReturn('ca marche pas');

            const flagResponse = context.featureFlagsService.getFlags(user);

            expect(flagResponse.error).toEqual('Unexpected token c in JSON at position 0');
            expect(flagResponse.response).toEqual(null);

            verify(context.configServiceMock.get('FEATURE_FLAGS_CONFIG')).once();
            verify(context.fsServiceMock.readFile(config)).once();
        });

        it('should fail on invalid path', function() {
            const user: UserDto = {
                admin: false,
            } as UserDto;

            const config = './path/to/config.json';

            when(context.configServiceMock.get('FEATURE_FLAGS_CONFIG')).thenReturn(config);
            when(context.fsServiceMock.readFile(config)).thenThrow(new NestError('Cannot find file'));

            const flagResponse = context.featureFlagsService.getFlags(user);

            expect(flagResponse.error).toEqual('Cannot find file');
            expect(flagResponse.response).toEqual(null);

            verify(context.configServiceMock.get('FEATURE_FLAGS_CONFIG')).once();
            verify(context.fsServiceMock.readFile(config)).once();
        });
    });
});
