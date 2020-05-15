import { Body, Controller, HttpCode, HttpException, Injectable, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { MetadatasFetchInputDto } from '@app/server/controllers/metadatas/dto/MetadatasFetchInput.dto';
import { MetadataEntity } from '@lib/common/metadatas/entities/Metadata.entity';
import { MetadatasFetchResponseDto } from '@app/server/controllers/metadatas/dto/MetadatasFetchResponse.dto';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { MetadatasService } from '@lib/common/metadatas/Metadatas.service';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';

/**
 * Controller Handling Metadatas
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('metadatas')
@Controller('metadatas')
export class MetadatasController extends ControllerBasics<MetadataEntity> {
    /**
     * Dependency Injection
     *
     * @param metadatasService
     * @param metadatasService
     */
    constructor(private readonly metadatasService: MetadatasService) {
        super();
    }

    /**
     * Fetches Metadatas
     *
     * @param body
     * @param user
     */
    @Post('/fetch')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async fetch(@Body() body: MetadatasFetchInputDto, @User() user: UserDto): Promise<MetadatasFetchResponseDto> {
        const metadataReq = await this.metadatasService.fetch(
            user,
            body.withLinks,
            body.useReadRights,
            body.metadataClassName,
            body.metadataTypeName,
        );

        if (metadataReq.error) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: metadataReq.error,
                },
                StatusCodes.Unauthorized,
            );
        }

        return {
            metadatas: metadataReq.response,
        };
    }
}
