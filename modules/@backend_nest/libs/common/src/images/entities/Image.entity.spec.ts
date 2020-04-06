import { ImageEntity } from '@lib/common/images/entities/Image.entity';

describe('Image Entity', function() {
    describe('constructor', function() {
        it('should build from nothing', function() {
            const imageEntity = new ImageEntity();

            expect(imageEntity).toEqual({});
        });

        it('should build from raw entity', function() {
            const rawImageEntity = {
                id: 'abcd',
                mimetype: 'mimetype',
                size: 123,
                encoding: 'encoding',
                hash: 'hash',
                links: 123,
                created_at: new Date(),
                updated_at: new Date(),
            } as ImageEntity;

            const imageEntity = new ImageEntity(rawImageEntity);

            expect(imageEntity).toEqual(rawImageEntity);
        });

        it('should build from raw entity with no id', function() {
            const rawImageEntity = {
                id: null,
                mimetype: 'mimetype',
                size: 123,
                encoding: 'encoding',
                hash: 'hash',
                links: 123,
                created_at: new Date(),
                updated_at: new Date(),
            } as ImageEntity;

            const imageEntity = new ImageEntity(rawImageEntity);

            expect(imageEntity).toEqual(rawImageEntity);
        });
    });
});
