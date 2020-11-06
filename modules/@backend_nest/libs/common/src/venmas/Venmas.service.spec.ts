import { Test, TestingModule } from '@nestjs/testing';
import { VenmasService } from './venmas.service';

describe('VenmasService', () => {
  let service: VenmasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VenmasService],
    }).compile();

    service = module.get<VenmasService>(VenmasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
