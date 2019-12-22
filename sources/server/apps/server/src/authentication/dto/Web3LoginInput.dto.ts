import { ApiProperty } from '@nestjs/swagger';
import { IsString }    from 'class-validator';

/**
 * Expected input when authenticating a web3 account
 */
export class Web3LoginInputDto {

    /**
     * Timestamp used for the signature. Base 10 format
     */
    @ApiProperty()
    @IsString()
    timestamp: string;

    /**
     * Signature of the Web3Register data type
     */
    @ApiProperty()
    @IsString()
    signature: string;
}
