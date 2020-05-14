import { Global, Module } from '@nestjs/common';
import { CurrenciesService } from '@lib/common/currencies/Currencies.service';

@Global()
@Module({
    providers: [CurrenciesService],
    exports: [CurrenciesService],
})
export class CurrenciesModule {}
