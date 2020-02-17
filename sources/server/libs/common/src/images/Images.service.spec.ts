import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { ImagesRepository } from '@lib/common/images/Images.repository';
import { ImagesService } from '@lib/common/images/Images.service';
import {
    capture,
    deepEqual,
    instance,
    mock,
    spy,
    verify,
    when,
} from 'ts-mockito';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { Test, TestingModule } from '@nestjs/testing';
import { ImageEntity } from '@lib/common/images/entities/Image.entity';
import { uuid } from '@iaminfinity/express-cassandra';

class EntityModelMock {
    search(
        options: EsSearchOptionsStatic,
        callback?: (err: any, ret: any) => void,
    ): void {
        return;
    }

    _properties = null;
}

describe('Images Service', function() {
    const context: {
        imagesService: ImagesService;
        imagesRepositoryMock: ImagesRepository;
        imageModelMock: EntityModelMock;
    } = {
        imagesService: null,
        imagesRepositoryMock: null,
        imageModelMock: null,
    };

    beforeEach(async function() {
        context.imageModelMock = mock(EntityModelMock);
        context.imagesRepositoryMock = mock(ImagesRepository);

        when(context.imageModelMock._properties).thenReturn({
            schema: {
                fields: {
                    id: {
                        type: 'uuid',
                    },
                },
            },
        });

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ImagesRepository,
                    useValue: instance(context.imagesRepositoryMock),
                },
                {
                    provide: getModelToken(ImageEntity),
                    useValue: instance(context.imageModelMock),
                },
                ImagesService,
            ],
        }).compile();

        context.imagesService = app.get<ImagesService>(ImagesService);
    });

    describe('link', function() {
        it('link image', async function() {
            const imageEntity: ImageEntity = {
                id: 'ed3a1a10-6b40-4f0c-89be-025505c9871b',
                mimetype: 'image/png',
                encoding: 'utf8',
                size: 1000,
                hash: 'hash',
                links: 0,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const spiedImageService = spy(context.imagesService);

            when(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [imageEntity],
            });

            when(
                spiedImageService.update(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                    deepEqual({
                        links: 1,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    ...imageEntity,
                    links: 1,
                },
            });

            const res = await context.imagesService.link(imageEntity.id);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                ...imageEntity,
                links: 1,
            });

            verify(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).called();

            verify(
                spiedImageService.update(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                    deepEqual({
                        links: 1,
                    }),
                ),
            ).called();
        });

        it('link image search error', async function() {
            const imageEntity: ImageEntity = {
                id: 'ed3a1a10-6b40-4f0c-89be-025505c9871b',
                mimetype: 'image/png',
                encoding: 'utf8',
                size: 1000,
                hash: 'hash',
                links: 0,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const spiedImageService = spy(context.imagesService);

            when(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.imagesService.link(imageEntity.id);

            expect(res.error).toEqual('error_while_fetching');

            verify(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).called();
        });

        it('link image empty res', async function() {
            const imageEntity: ImageEntity = {
                id: 'ed3a1a10-6b40-4f0c-89be-025505c9871b',
                mimetype: 'image/png',
                encoding: 'utf8',
                size: 1000,
                hash: 'hash',
                links: 0,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const spiedImageService = spy(context.imagesService);

            when(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.imagesService.link(imageEntity.id);

            expect(res.error).toEqual('image_not_found');

            verify(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).called();
        });

        it('link image update error', async function() {
            const imageEntity: ImageEntity = {
                id: 'ed3a1a10-6b40-4f0c-89be-025505c9871b',
                mimetype: 'image/png',
                encoding: 'utf8',
                size: 1000,
                hash: 'hash',
                links: 0,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const spiedImageService = spy(context.imagesService);

            when(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [imageEntity],
            });

            when(
                spiedImageService.update(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                    deepEqual({
                        links: 1,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.imagesService.link(imageEntity.id);

            expect(res.error).toEqual('image_link_update_error');
            expect(res.response).toEqual(null);

            verify(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).called();

            verify(
                spiedImageService.update(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                    deepEqual({
                        links: 1,
                    }),
                ),
            ).called();
        });
    });

    describe('unlink', function() {
        it('unlink image', async function() {
            const imageEntity: ImageEntity = {
                id: 'ed3a1a10-6b40-4f0c-89be-025505c9871b',
                mimetype: 'image/png',
                encoding: 'utf8',
                size: 1000,
                hash: 'hash',
                links: 1,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const spiedImageService = spy(context.imagesService);

            when(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [imageEntity],
            });

            when(
                spiedImageService.update(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                    deepEqual({
                        links: 0,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    ...imageEntity,
                    links: 0,
                },
            });

            const res = await context.imagesService.unlink(imageEntity.id);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                ...imageEntity,
                links: 0,
            });

            verify(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).called();

            verify(
                spiedImageService.update(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                    deepEqual({
                        links: 0,
                    }),
                ),
            ).called();
        });

        it('unlink image search error', async function() {
            const imageEntity: ImageEntity = {
                id: 'ed3a1a10-6b40-4f0c-89be-025505c9871b',
                mimetype: 'image/png',
                encoding: 'utf8',
                size: 1000,
                hash: 'hash',
                links: 1,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const spiedImageService = spy(context.imagesService);

            when(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.imagesService.unlink(imageEntity.id);

            expect(res.error).toEqual('error_while_fetching');

            verify(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).called();
        });

        it('unlink image empty res', async function() {
            const imageEntity: ImageEntity = {
                id: 'ed3a1a10-6b40-4f0c-89be-025505c9871b',
                mimetype: 'image/png',
                encoding: 'utf8',
                size: 1000,
                hash: 'hash',
                links: 1,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const spiedImageService = spy(context.imagesService);

            when(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.imagesService.unlink(imageEntity.id);

            expect(res.error).toEqual('image_not_found');

            verify(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).called();
        });

        it('unlink image update error', async function() {
            const imageEntity: ImageEntity = {
                id: 'ed3a1a10-6b40-4f0c-89be-025505c9871b',
                mimetype: 'image/png',
                encoding: 'utf8',
                size: 1000,
                hash: 'hash',
                links: 1,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const spiedImageService = spy(context.imagesService);

            when(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [imageEntity],
            });

            when(
                spiedImageService.update(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                    deepEqual({
                        links: 0,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.imagesService.unlink(imageEntity.id);

            expect(res.error).toEqual('image_unlink_update_error');
            expect(res.response).toEqual(null);

            verify(
                spiedImageService.search(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                ),
            ).called();

            verify(
                spiedImageService.update(
                    deepEqual({
                        id: imageEntity.id,
                    }),
                    deepEqual({
                        links: 0,
                    }),
                ),
            ).called();
        });
    });
});
