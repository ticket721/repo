import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoriesRepository } from '@lib/common/categories/Categories.repository';
import { CategoriesRightsConfig } from '@lib/common/categories/Categories.rights';

@Module({
    imports: [ExpressCassandraModule.forFeature([CategoryEntity, CategoriesRepository])],
    providers: [
        {
            provide: '@rights/category',
            useValue: CategoriesRightsConfig,
        },
        CategoriesService,
    ],
    exports: [CategoriesService],
})
export class CategoriesModule {}
