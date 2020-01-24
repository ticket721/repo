import { Test, TestingModule } from '@nestjs/testing';
import { capture, deepEqual, instance, mock, when } from 'ts-mockito';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { uuid } from '@iaminfinity/express-cassandra';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionsUpdateInputDto } from '@app/server/controllers/actionsets/dto/ActionsUpdateInput.dto';
import { StatusCodes } from '@lib/common/utils/codes';
import { ImagesController } from '@app/server/controllers/images/Images.controller';

const context: {
    imagesController: ImagesController;
} = {
    imagesController: null,
};

describe('Images Controller', function() {
    beforeEach(async function() {
        const module: TestingModule = await Test.createTestingModule({
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
