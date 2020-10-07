import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoriesRepository } from '@lib/common/categories/Categories.repository';

@Module({
    imports: [ExpressCassandraModule.forFeature([CategoryEntity, CategoriesRepository])],
    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule {}
