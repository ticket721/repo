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
import { ConfigService } from '@lib/common/config/Config.service';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { FilestoreService } from '@lib/common/filestore/Filestore.service';

/**
 * Image controller to upload images
 */
@ApiBearerAuth()
@ApiTags('images')
@Controller('images')
export class ImagesController {
    /**
     * Dependency Injection
     *
     * @param configService
     * @param fileStoreService
     */
    constructor(private readonly configService: ConfigService, private readonly fileStoreService: FilestoreService) {}

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

        const result: string[] = [];

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

            const fileSaveResponse = await this.fileStoreService.save(file.buffer, file.mimetype);

            if (fileSaveResponse.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: 'error_while_uploading_image',
                    },
                    StatusCodes.InternalServerError,
                );
            }

            result.push(fileSaveResponse.response.url);
        }

        return {
            urls: result,
        };
    }
}
