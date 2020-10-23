import { Module } from '@nestjs/common';
import { PurchasesService } from '@lib/common/purchases/Purchases.service';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchasesRepository } from '@lib/common/purchases/Purchases.repository';
import { UsersModule } from '@lib/common/users/Users.module';
import { ToolBoxModule } from '@lib/common/toolbox/ToolBox.module';
import { NonePaymentHandler } from '@lib/common/purchases/None.paymenthandler';

@Module({
    imports: [ExpressCassandraModule.forFeature([PurchaseEntity, PurchasesRepository]), UsersModule, ToolBoxModule],
    providers: [
        PurchasesService,
        {
            provide: 'payment/none',
            useClass: NonePaymentHandler,
        },
    ],
    exports: [PurchasesService],
})
export class PurchasesModule {}
