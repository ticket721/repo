import { MetadataEntity } from '@lib/common/metadatas/entities/Metadata.entity';

describe('Metadata Entity', function() {
    describe('constructor', function() {
        it('should build entity from nothing', function() {
            const metadataEntity = new MetadataEntity();

            expect(metadataEntity).toEqual({});
        });

        it('should build entity from raw entity', function() {
            const rawMetadataEntity: MetadataEntity = {
                id: 'abcd',
                links: [
                    {
                        type: 'entity',
                        id: 'value',
                        field: 'id',
                    },
                ],
                writers: [
                    {
                        type: 'entity',
                        id: 'value',
                        field: 'id',
                    },
                ],
                readers: [
                    {
                        type: 'entity',
                        id: 'value',
                        field: 'id',
                    },
                ],
                public_read: false,
                public_write: false,
                bool_: {
                    field: true,
                },
                str_: {
                    field: 'true',
                },
                int_: {
                    field: 1,
                },
                date_: {
                    field: new Date(Date.now()),
                },
                double_: {
                    field: 0.1,
                },
                class_name: 'history',
                type_name: 'create',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const metadataEntity = new MetadataEntity(rawMetadataEntity);

            expect(metadataEntity).toEqual(rawMetadataEntity);
        });

        it('should build entity from raw entity without id', function() {
            const rawMetadataEntity: MetadataEntity = {
                id: null,
                links: [
                    {
                        type: 'entity',
                        id: 'value',
                        field: 'id',
                    },
                ],
                writers: [
                    {
                        type: 'entity',
                        id: 'value',
                        field: 'id',
                    },
                ],
                readers: [
                    {
                        type: 'entity',
                        id: 'value',
                        field: 'id',
                    },
                ],
                public_read: false,
                public_write: false,
                bool_: {
                    field: true,
                },
                str_: {
                    field: 'true',
                },
                int_: {
                    field: 1,
                },
                date_: {
                    field: new Date(Date.now()),
                },
                double_: {
                    field: 0.1,
                },
                class_name: 'history',
                type_name: 'create',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const metadataEntity = new MetadataEntity(rawMetadataEntity);

            expect(metadataEntity).toEqual(rawMetadataEntity);
        });
    });
});
