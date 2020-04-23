import { BytesToolService } from '@lib/common/toolbox/Bytes.tool.service';

describe('Bytes Tool', function() {
    const context: {
        bytesToolService: BytesToolService;
    } = {
        bytesToolService: null,
    };

    beforeEach(function() {
        context.bytesToolService = new BytesToolService();
    });

    it('should generate a random hex string of length 4', function() {
        const randHex = context.bytesToolService.randomBytes(2);

        expect(randHex).toMatch(/^[0-9a-f]{4}$/);
    });

    it('should generate a random hex string of length 60', function() {
        const randHex = context.bytesToolService.randomBytes(30);

        expect(randHex).toMatch(/^[0-9a-f]{60}$/);
    });
});
