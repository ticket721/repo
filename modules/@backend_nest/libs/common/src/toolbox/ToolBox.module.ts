import { Module } from '@nestjs/common';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';

@Module({
    providers: [UUIDToolService],
    exports: [UUIDToolService],
})
export class ToolBoxModule {}
