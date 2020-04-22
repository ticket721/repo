import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { MintAuthorization, toAcceptedAddressFormat } from '@common/global';

describe('Authorization Entity', function() {
    describe('constructor', function() {
        it('should build from nothing', function() {
            const authorizationEntity = new AuthorizationEntity();

            expect(authorizationEntity).toEqual({});
        });

        it('should build from rawAuthorizationEntity', function() {
            const rawAuthorizationEntity: AuthorizationEntity = {
                id: 'authorization_id',
                granter: toAcceptedAddressFormat('0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c'),
                grantee: toAcceptedAddressFormat('0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c'),
                mode: 'sealSale',
                codes: MintAuthorization.toCodesFormat('1'),
                args: MintAuthorization.toArgsFormat('prices', 'groupId', 'category', '1', 123),
                selectors: MintAuthorization.toSelectorFormat('groupId', 'category'),
                signature: '0xabcd',
                cancelled: false,
                dispatched: false,
                consumed: false,
                readable_signature: true,
                user_expiration: new Date(Date.now() + 60 * 60 * 1000),
                be_expiration: new Date(Date.now() + 2 * 60 * 60 * 1000),
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const authorizationEntity = new AuthorizationEntity(rawAuthorizationEntity);

            expect(authorizationEntity).toEqual(rawAuthorizationEntity);
        });

        it('should build from rawAuthorizationEntity with no id', function() {
            const rawAuthorizationEntity: AuthorizationEntity = {
                id: null,
                granter: toAcceptedAddressFormat('0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c'),
                grantee: toAcceptedAddressFormat('0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c'),
                mode: 'sealSale',
                codes: MintAuthorization.toCodesFormat('1'),
                args: MintAuthorization.toArgsFormat('prices', 'groupId', 'category', '1', 123),
                selectors: MintAuthorization.toSelectorFormat('groupId', 'category'),
                signature: '0xabcd',
                cancelled: false,
                dispatched: false,
                consumed: false,
                readable_signature: true,
                user_expiration: new Date(Date.now() + 60 * 60 * 1000),
                be_expiration: new Date(Date.now() + 2 * 60 * 60 * 1000),
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const authorizationEntity = new AuthorizationEntity(rawAuthorizationEntity);

            expect(authorizationEntity).toEqual(rawAuthorizationEntity);
        });
    });
});
