import { cassandraArrayResultHelper } from '@lib/common/utils/cassandraArrayResult.helper';

interface TestType {
    name: string;
    value: number;
}

describe('cassandraArrayResult', function() {
    it('Type[] => Type[]', function() {
        const input: TestType[] = [
            {
                name: 'test',
                value: 123,
            },
        ];

        const result = cassandraArrayResultHelper<TestType>(input);

        expect(result).toEqual([
            {
                name: 'test',
                value: 123,
            },
        ]);
    });

    it('Type => Type[]', function() {
        const input: TestType = {
            name: 'test',
            value: 123,
        };

        const result = cassandraArrayResultHelper<TestType>(input);

        expect(result).toEqual([
            {
                name: 'test',
                value: 123,
            },
        ]);
    });

    it('null => Type[]', function() {
        const input: TestType = null;

        const result = cassandraArrayResultHelper<TestType>(input);

        expect(result).toEqual([]);
    });

    it('undefined => Type[]', function() {
        const input: TestType = undefined;

        const result = cassandraArrayResultHelper<TestType>(input);

        expect(result).toEqual([]);
    });
});
