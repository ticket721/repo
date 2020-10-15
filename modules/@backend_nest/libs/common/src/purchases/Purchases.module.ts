import { Module } from '@nestjs/common';
import { PurchasesService } from '@lib/common/purchases/Purchases.service';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchasesRepository } from '@lib/common/purchases/Purchases.repository';
import { UsersModule } from '@lib/common/users/Users.module';

@Module({
    imports: [ExpressCassandraModule.forFeature([PurchaseEntity, PurchasesRepository]), UsersModule],
    providers: [PurchasesService],
    exports: [PurchasesService],
})
export class PurchasesModule {}
