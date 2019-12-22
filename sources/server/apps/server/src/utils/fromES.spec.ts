import { use, expect }     from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ESSearchHit }     from './ESSearchReturn';
import { fromES }          from './fromES';

use(chaiAsPromised);
use(chaiAsPromised);

interface Test {
    name: string;
}

describe('fromES', function () {

    it('build from valid object', function () {

        const hit: ESSearchHit<Test> = {
            _source: {
                name: 'salut'
            },
            _score: 1,
            _id: '0',
            _type: 'test',
            _index: 'index'
        };

        const res = fromES<Test>(hit);

        expect(res).to.deep.equal({
            name: 'salut'
        });

    });

    it('build from null _source', function () {

        const hit: ESSearchHit<Test> = {
            _source: null,
            _score: 1,
            _id: '0',
            _type: 'test',
            _index: 'index'
        };

        const res = fromES<Test>(hit);

        expect(res).to.equal(null);

    });

    it('build from null hit', function () {

        const res = fromES<Test>(null);

        expect(res).to.equal(null);

    });

});

