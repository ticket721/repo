import {
    Controller,
    HttpCode,
    HttpException,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    Roles,
    RolesGuard,
} from '@app/server/authentication/guards/RolesGuard.guard';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesUploadResponseDto } from '@app/server/controllers/images/dto/ImagesUploadResponse.dto';
import { ImagesUploadInputDto } from '@app/server/controllers/images/dto/ImagesUploadInput.dto';
import { ImagesService } from '@lib/common/images/Images.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { keccak256 } from '@ticket721sources/global';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { ImageEntity } from '@lib/common/images/entities/Image.entity';
import { fromES } from '@lib/common/utils/fromES';
import * as path from 'path';
import { FSService } from '@lib/common/fs/FS.service';

const mimetypeMapping = {
    'image/bmp': '.bmp',
    'image/gif': '.gif',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/svg+xml': '.svg',
};

@ApiBearerAuth()
@ApiTags('images')
@Controller('images')
export class ImagesController {
    constructor(
        private readonly imagesService: ImagesService,
        private readonly configService: ConfigService,
        private readonly fsService: FSService,
    ) {}

    @Post('/')
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
    @ApiResponse({
        status: StatusCodes.BadRequest,
        description: StatusNames[StatusCodes.BadRequest],
    })
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @HttpCode(200)
    @ApiBody({
        type: ImagesUploadInputDto,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('images'))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    async upload(
        @UploadedFiles() files,
        @User() user: UserDto,
    ): Promise<ImagesUploadResponseDto> {
        const maxSize: number =
            parseInt(this.configService.get('IMAGE_MAX_SIZE'), 10) * 1000000;

        const result: ImageEntity[] = [];

        for (const file of files) {
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

            if (mimetypeMapping[file.mimetype] === undefined) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'unsupported_image_type',
                    },
                    StatusCodes.BadRequest,
                );
            }

            const body = ESSearchBodyBuilder({
                $page_size: 1,
                hash: {
                    $eq: file.hash,
                },
            } as SortablePagedSearch);

            const collision = await this.imagesService.searchElastic(
                body.response,
            );

            if (collision.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: 'image_collision_check_error',
                    },
                    StatusCodes.InternalServerError,
                );
            }

            if (collision.response.hits.total === 1) {
                result.push(fromES(collision.response.hits.hits[0]));
                continue;
            }

            const res = await this.imagesService.create({
                mimetype: file.mimetype,
                size: file.size,
                hash: file.hash,
                encoding: file.encoding,
                links: 0,
            });

            if (res.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: 'image_db_save_error',
                    },
                    StatusCodes.InternalServerError,
                );
            }

            const imagePath = path.join(
                this.configService.get('IMAGE_SERVE_DIRECTORY'),
                `${res.response.id}${mimetypeMapping[file.mimetype]}`,
            );

            this.fsService.writeFile(imagePath, file.buffer);

            result.push(res.response);
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
