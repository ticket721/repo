import { Module } from '@nestjs/common';
import { FSService } from '@lib/common/fs/FS.service';

@Module({
    providers: [FSService],
    exports: [FSService],
})
export class FSModule {}
