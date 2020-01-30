import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from '@app/server/controllers/images/Images.controller';
import { ImagesService } from '@lib/common/images/Images.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { FSService } from '@lib/common/fs/FS.service';
import { instance, mock } from 'ts-mockito';

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
        test('should upload images', async function() {});
    });
});
