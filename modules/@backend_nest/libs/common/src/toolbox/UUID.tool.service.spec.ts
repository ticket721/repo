import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';

describe('UUID Tool Service', function() {
    const context: {
        uuidToolService: UUIDToolService;
    } = {
        uuidToolService: null,
    };

    beforeEach(function() {
        context.uuidToolService = new UUIDToolService();
    });

    describe('generate', function() {
        it('should generate an uuid 4 string', function() {
            const uuid = context.uuidToolService.generate();

            expect(uuid).toMatch(/^[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}$/);
        });
    });
});
