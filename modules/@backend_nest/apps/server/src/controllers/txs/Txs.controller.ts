import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpException, Post, UseFilters, UseGuards } from '@nestjs/common';
import { TxsService } from '@lib/common/txs/Txs.service';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { TxsSearchInputDto } from '@app/server/controllers/txs/dto/TxsSearchInput.dto';
import { TxsSearchResponseDto } from '@app/server/controllers/txs/dto/TxsSearchResponse.dto';
import { TxsSubscribeResponseDto } from '@app/server/controllers/txs/dto/TxsSubscribeResponse.dto';
import { TxsSubscribeInputDto } from '@app/server/controllers/txs/dto/TxsSubscribeInput.dto';
import { ConfigService } from '@lib/common/config/Config.service';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { TxsInfosResponseDto } from '@app/server/controllers/txs/dto/TxsInfosResponse.dto';
import { isTransactionHash } from '@common/global';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { TxsCountInputDto } from '@app/server/controllers/txs/dto/TxsCountInput.dto';
import { TxsCountResponseDto } from '@app/server/controllers/txs/dto/TxsCountResponse.dto';

/**
 * Transaction Controller. Fetch and recover transactions
 */
@ApiBearerAuth()
@ApiTags('txs')
@Controller('txs')
export class TxsController extends ControllerBasics<TxEntity> {
    /**
     * Dependency Injection
     *
     * @param txsService
     * @param configService
     * @param contractsService
     */
    constructor(
        private readonly txsService: TxsService,
        private readonly configService: ConfigService,
        private readonly contractsService: ContractsService,
    ) {
        super();
    }

    /**
     * Recover Relayer address to use in meta transactions
     */
    @Get('infos')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK])
    async infos(): Promise<TxsInfosResponseDto> {
        const artifacts = await this.contractsService.getContractArtifacts();
        const networkId = parseInt(this.configService.get('ETHEREUM_NODE_NETWORK_ID'), 10);
        const relayer = artifacts['t721admin::T721Admin'].networks[networkId].address;

        return {
            relayer,
        };
    }

    /**
     * Search for transactions
     *
     * @param body
     * @param user
     */
    @Post('/search')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.BadRequest, StatusCodes.InternalServerError])
    async search(@Body() body: TxsSearchInputDto, @User() user: UserDto): Promise<TxsSearchResponseDto> {
        const txs = await this._search(this.txsService, body);
        return { txs };
    }

    /**
     * Count for transactions
     *
     * @param body
     * @param user
     */
    @Post('/count')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.BadRequest, StatusCodes.InternalServerError])
    async count(@Body() body: TxsCountInputDto, @User() user: UserDto): Promise<TxsCountResponseDto> {
        const txs = await this._count(this.txsService, body);
        return { txs };
    }

    /**
     * Add transaction to follow
     *
     * @param body
     * @param user
     */
    @Post('/subscribe')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async subscribe(@Body() body: TxsSubscribeInputDto, @User() user: UserDto): Promise<TxsSubscribeResponseDto> {
        const txHash: string = body.transaction_hash.toLowerCase();

        if (!isTransactionHash(txHash)) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_tx_hash',
                },
                StatusCodes.BadRequest,
            );
        }

        const subscription = await this._serviceCall<TxEntity>(
            this.txsService.subscribe(txHash),
            StatusCodes.InternalServerError,
        );

        return {
            tx: subscription,
        };
    }
}
