import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    Post,
    UseGuards,
} from '@nestjs/common';
import { TxsService } from '@lib/common/txs/Txs.service';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';
import { AuthGuard } from '@nestjs/passport';
import {
    Roles,
    RolesGuard,
} from '@app/server/authentication/guards/RolesGuard.guard';
import { User } from '@app/server/authentication/decorators/User.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { search } from '@lib/common/utils/ControllerBasics';
import { TxsSearchInputDto } from '@app/server/controllers/txs/dto/TxsSearchInput.dto';
import { TxsSearchResponseDto } from '@app/server/controllers/txs/dto/TxsSearchResponse.dto';
import { TxsSubscribeResponseDto } from '@app/server/controllers/txs/dto/TxsSubscribeResponse.dto';
import { TxsSubscribeInputDto } from '@app/server/controllers/txs/dto/TxsSubscribeInput.dto';
import { ConfigService } from '@lib/common/config/Config.service';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { TxsInfosResponseDto } from '@app/server/controllers/txs/dto/TxsInfosResponse.dto';
import { TxsMtxInputDto } from '@app/server/controllers/txs/dto/TxsMtxInput.dto';
import { TxsMtxResponseDto } from '@app/server/controllers/txs/dto/TxsMtxResponse.dto';

@ApiBearerAuth()
@ApiTags('txs')
@Controller('txs')
export class TxsController {
    constructor(
        private readonly txsService: TxsService,
        private readonly configService: ConfigService,
        private readonly contractsService: ContractsService,
    ) {}

    @Post('mtx')
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @HttpCode(200)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    async mtx(
        @Body() body: TxsMtxInputDto,
        @User() user: UserDto,
    ): Promise<TxsMtxResponseDto> {
        const txRes = await this.txsService.mtx(
            body.payload,
            body.signature,
            user,
        );

        if (txRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: txRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            tx: txRes.response,
        };
    }

    @Get('infos')
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @HttpCode(200)
    async infos(): Promise<TxsInfosResponseDto> {
        const artifacts = await this.contractsService.getContractArtifacts();
        const networkId = parseInt(
            this.configService.get('ETHEREUM_NODE_NETWORK_ID'),
            10,
        );
        const relayer =
            artifacts['t721admin::T721Admin'].networks[networkId].address;

        return {
            relayer,
        };
    }

    /**
     * Search for dates
     *
     * @param body
     * @param user
     */
    @Post('/search')
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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    async search(
        @Body() body: TxsSearchInputDto,
        @User() user: UserDto,
    ): Promise<TxsSearchResponseDto> {
        const txs = await search<TxEntity, TxsService>(this.txsService, body);

        return {
            txs,
        };
    }

    /**
     * Add transaction to follow
     *
     * @param body
     * @param user
     */
    @Post('/subscribe')
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
    @ApiResponse({
        status: StatusCodes.BadRequest,
        description: StatusNames[StatusCodes.BadRequest],
    })
    @HttpCode(200)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    async subscribe(
        @Body() body: TxsSubscribeInputDto,
        @User() user: UserDto,
    ): Promise<TxsSubscribeResponseDto> {
        const txHash: string = body.transaction_hash.toLowerCase();

        if (!this.txsService.txHashRegExp.test(txHash)) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_tx_hash',
                },
                StatusCodes.BadRequest,
            );
        }

        const subscriptionResult = await this.txsService.subscribe(txHash);

        if (subscriptionResult.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: subscriptionResult.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            tx: subscriptionResult.response,
        };
    }
}
