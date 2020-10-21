import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoriesRepository } from '@lib/common/categories/Categories.repository';
import { CategoriesProduct } from '@lib/common/categories/Categories.product';
import { ToolBoxModule } from '@lib/common/toolbox/ToolBox.module';
import { TicketsModule } from '@lib/common/tickets/Tickets.module';
import { WinstonLoggerModule } from '@lib/common/logger/WinstonLogger.module';
import { OperationsModule } from '@lib/common/operations/Operations.module';

@Module({
    imports: [
        ExpressCassandraModule.forFeature([CategoryEntity, CategoriesRepository]),
        ToolBoxModule,
        TicketsModule,
        WinstonLoggerModule,
        OperationsModule,
    ],
    providers: [
        CategoriesService,
        {
            provide: 'product/category',
            useClass: CategoriesProduct,
        },
    ],
    exports: [CategoriesService],
})
export class CategoriesModule {}
