import { fromES } from './fromES';
import { ESSearchHit } from '@lib/common/utils/ESSearchReturn';

interface Test {
    name: string;
}

describe('fromES', function() {
    test('build from valid object', function() {
        const hit: ESSearchHit<Test> = {
            _source: {
                name: 'salut',
            },
            _score: 1,
            _id: '0',
            _type: 'test',
            _index: 'index',
        };

        const res = fromES<Test>(hit);

        expect(res).toEqual({
            name: 'salut',
        });
    });

    test('build from null _source', function() {
        const hit: ESSearchHit<Test> = {
            _source: null,
            _score: 1,
            _id: '0',
            _type: 'test',
            _index: 'index',
        };

        const res = fromES<Test>(hit);

        expect(res).toEqual(null);
    });

    test('build from null hit', function() {
        const res = fromES<Test>(null);

        expect(res).toEqual(null);
    });
});
