import { Module } from '@nestjs/common';
import { FSService } from '@lib/common/fs/FS.service';

/**
 * FileSystem Module. Using it as an injected dependency makes testing a lot easier
 */
@Module({
    providers: [FSService],
    exports: [FSService],
})
export class FSModule {}
