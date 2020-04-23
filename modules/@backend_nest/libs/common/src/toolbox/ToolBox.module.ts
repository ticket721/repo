import { Module } from '@nestjs/common';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { BytesToolService } from '@lib/common/toolbox/Bytes.tool.service';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';

@Module({
    providers: [UUIDToolService, BytesToolService, TimeToolService],
    exports: [UUIDToolService, BytesToolService, TimeToolService],
})
export class ToolBoxModule {}
