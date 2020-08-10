import { Module } from '@nestjs/common';
import { FeatureFlagsService } from '@lib/common/featureflags/FeatureFlags.service';
import { ToolBoxModule } from '@lib/common/toolbox/ToolBox.module';
import { FSModule } from '@lib/common/fs/FS.module';

@Module({
    imports: [ToolBoxModule, FSModule],
    providers: [FeatureFlagsService],
    exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
