import { Module } from '@nestjs/common';
import { CheckoutAcsetbuilderHelper } from '@lib/common/checkout/acset_builders/Checkout.acsetbuilder.helper';
import { CheckoutAcsetlifecycleHelper } from '@lib/common/checkout/acset_lifecycles/Checkout.acsetlifecycles.helper';
import { MintingModule } from '@lib/common/minting/Minting.module';

@Module({
    imports: [MintingModule],
    providers: [
        {
            provide: `ACTION_SET_BUILDER/checkout_create`,
            useClass: CheckoutAcsetbuilderHelper,
        },
        {
            provide: `ACTION_SET_LIFECYCLES/@checkout/creation`,
            useClass: CheckoutAcsetlifecycleHelper,
        },
    ],
})
export class CheckoutModule {}
