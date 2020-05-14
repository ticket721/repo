import { Module } from '@nestjs/common';
import { CartAcsetbuilderHelper } from '@lib/common/cart/acset_builders/Cart.acsetbuilder.helper';

@Module({
    providers: [
        {
            provide: `ACTION_SET_BUILDER/cart_create`,
            useClass: CartAcsetbuilderHelper,
        },
    ],
})
export class CartModule {}
