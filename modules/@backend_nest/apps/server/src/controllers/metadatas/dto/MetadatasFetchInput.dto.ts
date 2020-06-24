import { Link } from '@lib/common/utils/Link.type';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data model required when fetching metadatas
 */
export class MetadatasFetchInputDto {
    /**
     * Read rights to try to obtaim
     */
    @ValidateNested({ each: true })
    @IsOptional()
    @Type(() => Link)
    useReadRights?: Link[];

    /**
     * Fetch metadata with provided links: AND statement is applied !
     */
    @ValidateNested({ each: true })
    @Type(() => Link)
    withLinks: Link[];

    /**
     * Class Name of the metadatas to fetch
     */
    @IsString()
    metadataClassName: string;

    /**
     * Type Name of the metadatas to fetch. Can be omitted.
     */
    @IsString()
    @IsOptional()
    metadataTypeName?: string;
}
