import { WithdrawService } from '@lib/common/withdraw/Withdraw.service';
import { mock } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';

describe('Withdraw Service', function() {
    const context: {
        withdrawService: WithdrawService;
    } = {
        withdrawService: null,
    };

    beforeEach(async function() {
        context.withdrawService = mock(WithdrawService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [WithdrawService],
        }).compile();

        context.withdrawService = module.get<WithdrawService>(WithdrawService);
    });

    describe('placeholder', function() {
        it('should call the placehold method', async function() {
            context.withdrawService.placeholder();
        });
    });
});
