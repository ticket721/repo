import {
    Controller,
    HttpCode,
    HttpException,
    Post,
    UploadedFiles,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesUploadResponseDto } from '@app/server/controllers/images/dto/ImagesUploadResponse.dto';
import { ImagesUploadInputDto } from '@app/server/controllers/images/dto/ImagesUploadInput.dto';
import { ImagesService } from '@lib/common/images/Images.service';
import { ConfigService }       from '@lib/common/config/Config.service';
import { keccak256 }           from '@common/global';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { ImageEntity }         from '@lib/common/images/entities/Image.entity';
import * as path               from 'path';
import { FSService }           from '@lib/common/fs/FS.service';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ControllerBasics }    from '@lib/common/utils/ControllerBasics.base';
import { UUIDToolService }     from '@lib/common/toolbox/UUID.tool.service';
import { ApiResponses }        from '@app/server/utils/ApiResponses.controller.decorator';
import { ValidGuard }          from '@app/server/authentication/guards/ValidGuard.guard';
import { SearchInputType }     from '@lib/common/utils/SearchInput.type';

/**
 * Accepted Mimetypes
 */
const mimetypeMapping = {
    'image/bmp': '.bmp',
    'image/gif': '.gif',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/svg+xml': '.svg',
};

/**
 * Image controller to upload images
 */
@ApiBearerAuth()
@ApiTags('images')
@Controller('images')
export class ImagesController extends ControllerBasics<ImageEntity> {
    /**
     * Dependency Injection
     *
     * @param imagesService
     * @param configService
     * @param fsService
     * @param uuidToolService
     */
    constructor(
        private readonly imagesService: ImagesService,
        private readonly configService: ConfigService,
        private readonly fsService: FSService,
        private readonly uuidToolService: UUIDToolService,
    ) {
        super();
    }

    /**
     * Upload Image(s)
     *
     * @param files
     * @param user
     */
    @Post('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @UseInterceptors(FilesInterceptor('images'))
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiBody({
        type: ImagesUploadInputDto,
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponses([StatusCodes.Created, StatusCodes.BadRequest, StatusCodes.InternalServerError])
    async upload(@UploadedFiles() files, @User() user: UserDto): Promise<ImagesUploadResponseDto> {
        const maxSize: number = parseInt(this.configService.get('IMAGE_MAX_SIZE'), 10) * 1000000;

        const result: ImageEntity[] = [];

        for (const file of files) {
            /* istanbul ignore next */
            if (file.size > maxSize) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'image_exceeds_size_limit',
                    },
                    StatusCodes.BadRequest,
                );
            }

            file.hash = keccak256(file.buffer.toString('hex')).toLowerCase();

            /* istanbul ignore next */
            if (mimetypeMapping[file.mimetype] === undefined) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'unsupported_image_type',
                    },
                    StatusCodes.BadRequest,
                );
            }

            const collision = await this._search<ImageEntity>(this.imagesService, {
                $page_size: 1,
                hash: {
                    $eq: file.hash,
                },
            } as SearchInputType<ImageEntity>);

            if (collision.length === 1) {
                result.push(collision[0]);
                continue;
            }

            const imageId = this.uuidToolService.generate();

            const imagePath = path.join(
                this.configService.get('IMAGE_SERVE_DIRECTORY'),
                `${imageId}${mimetypeMapping[file.mimetype]}`,
            );

            /* istanbul ignore next */
            try {
                this.fsService.writeFile(imagePath, file.buffer);
            } catch (e) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: 'error_while_uploading_image',
                    },
                    StatusCodes.InternalServerError,
                );
            }

            const imageEntity: ImageEntity = await this._new<ImageEntity>(this.imagesService, {
                id: imageId,
                mimetype: file.mimetype,
                size: file.size,
                hash: file.hash,
                encoding: file.encoding,
                links: 0,
            });

            result.push(imageEntity);
        }

        for (const res of result) {
            delete res.created_at;
            delete res.updated_at;
        }

        return {
            ids: result,
        };
    }
}
