import { cassandraArrayResult } from '@lib/common/utils/cassandraArrayResult';

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

        const result = cassandraArrayResult<TestType>(input);

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

        const result = cassandraArrayResult<TestType>(input);

        expect(result).toEqual([
            {
                name: 'test',
                value: 123,
            },
        ]);
    });

    it('null => Type[]', function() {
        const input: TestType = null;

        const result = cassandraArrayResult<TestType>(input);

        expect(result).toEqual([]);
    });

    it('undefined => Type[]', function() {
        const input: TestType = undefined;

        const result = cassandraArrayResult<TestType>(input);

        expect(result).toEqual([]);
    });
});
