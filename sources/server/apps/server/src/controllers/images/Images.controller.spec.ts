import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from '@app/server/controllers/images/Images.controller';
import { ImagesService } from '@lib/common/images/Images.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { FSService } from '@lib/common/fs/FS.service';
import {
    anything,
    capture,
    deepEqual,
    instance,
    mock,
    verify,
    when,
} from 'ts-mockito';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';
import * as path from 'path';
import { ImageEntity } from '@lib/common/images/entities/Image.entity';
import { keccak256 } from '@ticket721sources/global';
import { StatusCodes } from '@lib/common/utils/codes';

const context: {
    imagesController: ImagesController;
    imagesServiceMock: ImagesService;
    configServiceMock: ConfigService;
    fsService: FSService;
} = {
    imagesController: null,
    imagesServiceMock: null,
    configServiceMock: null,
    fsService: null,
};

describe('Images Controller', function() {
    beforeEach(async function() {
        context.imagesServiceMock = mock(ImagesService);
        context.configServiceMock = mock(ConfigService);
        context.fsService = mock(FSService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ImagesService,
                    useValue: instance(context.imagesServiceMock),
                },
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },
                {
                    provide: FSService,
                    useValue: instance(context.fsService),
                },
            ],
            controllers: [ImagesController],
        }).compile();

        context.imagesController = module.get<ImagesController>(
            ImagesController,
        );
    });

    describe('upload', function() {
        test('should upload images', async function() {
            const esReturn: ESSearchReturn<ImageEntity> = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 0,
                    max_score: 0,
                    hits: [],
                },
            };

            const buffer = Buffer.from('o'.repeat(10000));
            const hash = keccak256(buffer.toString('hex')).toLowerCase();

            when(context.configServiceMock.get('IMAGE_MAX_SIZE')).thenReturn(
                '10',
            );
            when(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).thenReturn('/images');
            when(
                context.fsService.writeFile(
                    path.join(
                        '/images',
                        'ec677b12-d420-43a6-a597-ef84bf09f845.png',
                    ),
                    anything(),
                ),
            );
            when(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });
            when(
                context.imagesServiceMock.create(
                    deepEqual({
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash,
                        links: 0,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    size: 10000,
                    mimetype: 'image/png',
                    encoding: 'utf8',
                    hash,
                    links: 0,
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            });

            const res = await context.imagesController.upload(
                [
                    {
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        buffer: Buffer.from('o'.repeat(10000)),
                    },
                ],
                {
                    id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                } as UserDto,
            );

            expect(res).toEqual({
                ids: [
                    {
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash:
                            '0xc1ebe97418be29324a90d8036d927135dbdc6381bbcd1d9c084ecb64ffe32eeb',
                        links: 0,
                    },
                ],
            });

            verify(
                context.fsService.writeFile(
                    path.join(
                        '/images',
                        'ec677b12-d420-43a6-a597-ef84bf09f845.png',
                    ),
                    anything(),
                ),
            ).called();
            verify(
                context.imagesServiceMock.create(
                    deepEqual({
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash,
                        links: 0,
                    }),
                ),
            ).called();
            verify(context.configServiceMock.get('IMAGE_MAX_SIZE')).called();
            verify(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).called();
            verify(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        test('should hit and skip', async function() {
            const buffer = Buffer.from('o'.repeat(10000));
            const hash = keccak256(buffer.toString('hex')).toLowerCase();
            const created_at = new Date(Date.now());
            const updated_at = new Date(Date.now());

            const imageEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                size: 10000,
                mimetype: 'image/png',
                encoding: 'utf8',
                hash,
                links: 0,
                created_at,
                updated_at,
            };

            const esReturn: ESSearchReturn<ImageEntity> = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1,
                    hits: [
                        {
                            _type: '',
                            _index: '',
                            _id: '',
                            _score: 1,
                            _source: imageEntity,
                        },
                    ],
                },
            };

            when(context.configServiceMock.get('IMAGE_MAX_SIZE')).thenReturn(
                '10',
            );
            when(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).thenReturn('/images');
            when(
                context.fsService.writeFile(
                    path.join(
                        '/images',
                        'ec677b12-d420-43a6-a597-ef84bf09f845.png',
                    ),
                    anything(),
                ),
            );
            when(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });

            const res = await context.imagesController.upload(
                [
                    {
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        buffer: Buffer.from('o'.repeat(10000)),
                    },
                ],
                {
                    id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                } as UserDto,
            );

            expect(res).toEqual({
                ids: [
                    {
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash:
                            '0xc1ebe97418be29324a90d8036d927135dbdc6381bbcd1d9c084ecb64ffe32eeb',
                        links: 0,
                    },
                ],
            });

            verify(
                context.fsService.writeFile(
                    path.join(
                        '/images',
                        'ec677b12-d420-43a6-a597-ef84bf09f845.png',
                    ),
                    anything(),
                ),
            ).never();
            verify(
                context.imagesServiceMock.create(
                    deepEqual({
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash,
                        links: 0,
                    }),
                ),
            ).never();
            verify(context.configServiceMock.get('IMAGE_MAX_SIZE')).called();
            verify(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).never();
            verify(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        test('should fail on max size error', async function() {
            const buffer = Buffer.from('o'.repeat(10000000));
            const hash = keccak256(buffer.toString('hex')).toLowerCase();

            when(context.configServiceMock.get('IMAGE_MAX_SIZE')).thenReturn(
                '1',
            );

            await expect(
                context.imagesController.upload(
                    [
                        {
                            size: 10000000,
                            mimetype: 'image/png',
                            encoding: 'utf8',
                            buffer: Buffer.from('o'.repeat(10000000)),
                        },
                    ],
                    {
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    } as UserDto,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.BadRequest,
                    message: 'image_exceeds_size_limit',
                },
                status: StatusCodes.BadRequest,
                message: {
                    status: StatusCodes.BadRequest,
                    message: 'image_exceeds_size_limit',
                },
            });

            verify(
                context.fsService.writeFile(
                    path.join(
                        '/images',
                        'ec677b12-d420-43a6-a597-ef84bf09f845.png',
                    ),
                    anything(),
                ),
            ).never();
            verify(
                context.imagesServiceMock.create(
                    deepEqual({
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash,
                        links: 0,
                    }),
                ),
            ).never();
            verify(context.configServiceMock.get('IMAGE_MAX_SIZE')).called();
            verify(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).never();
            verify(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).never();
        });

        test('should fail on unknown mimetype', async function() {
            const buffer = Buffer.from('o'.repeat(1000000));
            const hash = keccak256(buffer.toString('hex')).toLowerCase();

            when(context.configServiceMock.get('IMAGE_MAX_SIZE')).thenReturn(
                '10',
            );

            await expect(
                context.imagesController.upload(
                    [
                        {
                            size: 1000000,
                            mimetype: 'unknown/type',
                            encoding: 'utf8',
                            buffer: Buffer.from('o'.repeat(1000000)),
                        },
                    ],
                    {
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    } as UserDto,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.BadRequest,
                    message: 'unsupported_image_type',
                },
                status: StatusCodes.BadRequest,
                message: {
                    status: StatusCodes.BadRequest,
                    message: 'unsupported_image_type',
                },
            });

            verify(
                context.fsService.writeFile(
                    path.join(
                        '/images',
                        'ec677b12-d420-43a6-a597-ef84bf09f845.png',
                    ),
                    anything(),
                ),
            ).never();
            verify(
                context.imagesServiceMock.create(
                    deepEqual({
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash,
                        links: 0,
                    }),
                ),
            ).never();
            verify(context.configServiceMock.get('IMAGE_MAX_SIZE')).called();
            verify(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).never();
            verify(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).never();
        });

        test('should get collision check error', async function() {
            const esReturn: ESSearchReturn<ImageEntity> = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 0,
                    max_score: 0,
                    hits: [],
                },
            };

            const buffer = Buffer.from('o'.repeat(10000));
            const hash = keccak256(buffer.toString('hex')).toLowerCase();

            when(context.configServiceMock.get('IMAGE_MAX_SIZE')).thenReturn(
                '10',
            );
            when(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).thenReturn('/images');
            when(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: 'error',
                response: null,
            });

            await expect(
                context.imagesController.upload(
                    [
                        {
                            size: 10000,
                            mimetype: 'image/png',
                            encoding: 'utf8',
                            buffer,
                        },
                    ],
                    {
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    } as UserDto,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'image_collision_check_error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'image_collision_check_error',
                },
            });

            verify(
                context.fsService.writeFile(
                    path.join(
                        '/images',
                        'ec677b12-d420-43a6-a597-ef84bf09f845.png',
                    ),
                    anything(),
                ),
            ).never();
            verify(
                context.imagesServiceMock.create(
                    deepEqual({
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash,
                        links: 0,
                    }),
                ),
            ).never();
            verify(context.configServiceMock.get('IMAGE_MAX_SIZE')).called();
            verify(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).never();
            verify(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        test('should get db save error', async function() {
            const esReturn: ESSearchReturn<ImageEntity> = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 0,
                    max_score: 0,
                    hits: [],
                },
            };

            const buffer = Buffer.from('o'.repeat(10000));
            const hash = keccak256(buffer.toString('hex')).toLowerCase();

            when(context.configServiceMock.get('IMAGE_MAX_SIZE')).thenReturn(
                '10',
            );
            when(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).thenReturn('/images');
            when(
                context.fsService.writeFile(
                    path.join(
                        '/images',
                        'ec677b12-d420-43a6-a597-ef84bf09f845.png',
                    ),
                    anything(),
                ),
            );
            when(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });
            when(
                context.imagesServiceMock.create(
                    deepEqual({
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash,
                        links: 0,
                    }),
                ),
            ).thenResolve({
                error: 'error',
                response: null,
            });

            await expect(
                context.imagesController.upload(
                    [
                        {
                            size: 10000,
                            mimetype: 'image/png',
                            encoding: 'utf8',
                            buffer: Buffer.from('o'.repeat(10000)),
                        },
                    ],
                    {
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    } as UserDto,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'image_db_save_error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'image_db_save_error',
                },
            });

            verify(
                context.fsService.writeFile(
                    path.join(
                        '/images',
                        'ec677b12-d420-43a6-a597-ef84bf09f845.png',
                    ),
                    anything(),
                ),
            ).never();
            verify(
                context.imagesServiceMock.create(
                    deepEqual({
                        size: 10000,
                        mimetype: 'image/png',
                        encoding: 'utf8',
                        hash,
                        links: 0,
                    }),
                ),
            ).called();
            verify(context.configServiceMock.get('IMAGE_MAX_SIZE')).called();
            verify(
                context.configServiceMock.get('IMAGE_SERVE_DIRECTORY'),
            ).never();
            verify(
                context.imagesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1,
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            hash: hash,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });
    });
});
