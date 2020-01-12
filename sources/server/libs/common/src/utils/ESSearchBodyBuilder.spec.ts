import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder';
import { ServiceResponse } from '@app/server/utils/ServiceResponse';

class ExampleInputDto extends SortablePagedSearch {
    name?: SearchableField<string>;
    obj?: SearchableField<any>;
    age?: SearchableField<number>;
}

describe('ESSearch Body Builder', function() {
    it('uses $eq', function() {
        const input: ExampleInputDto = {
            name: {
                $eq: 'Jean',
            },
            age: {
                $eq: 22,
            },
        };

        const esb: ServiceResponse<EsSearchOptionsStatic> = ESSearchBodyBuilder(
            input,
        );

        expect(esb.error).toEqual(null);
        expect(esb.response).toEqual({
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    name: 'Jean',
                                },
                            },
                            {
                                term: {
                                    age: 22,
                                },
                            },
                        ],
                    },
                },
            },
        });
    });

    it('uses $eq with nested fields and nested sort', function() {
        const input: ExampleInputDto = {
            obj: {
                $eq: {
                    nested: {
                        fields: {
                            should: {
                                work: '!',
                            },
                        },
                    },
                },
            },
            $sort: [
                {
                    $field_name: 'obj.nested',
                    $order: 'asc',
                    $nested: true,
                },
            ],
        };

        const esb: ServiceResponse<EsSearchOptionsStatic> = ESSearchBodyBuilder(
            input,
        );

        expect(esb.error).toEqual(null);
        // Yes the end query is pretty unreadable :/
        expect(esb.response).toEqual({
            body: {
                query: {
                    bool: {
                        must: {
                            nested: {
                                path: 'obj',
                                query: {
                                    bool: {
                                        must: {
                                            nested: {
                                                path: 'obj.nested',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            nested: {
                                                                path:
                                                                    'obj.nested.fields',
                                                                query: {
                                                                    bool: {
                                                                        must: {
                                                                            nested: {
                                                                                path:
                                                                                    'obj.nested.fields.should',
                                                                                query: {
                                                                                    bool: {
                                                                                        must: {
                                                                                            term: {
                                                                                                'obj.nested.fields.should.work':
                                                                                                    '!',
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                sort: [
                    {
                        'obj.nested': {
                            order: 'asc',
                            nested_path: 'obj',
                        },
                    },
                ],
            },
        });
    });

    it('uses $page_index without $page_size', function() {
        const input: ExampleInputDto = {
            $page_index: 1,
            $page_size: null,
            name: {
                $eq: 'Jean',
            },
            age: {
                $eq: 22,
            },
        };

        const esb: ServiceResponse<EsSearchOptionsStatic> = ESSearchBodyBuilder(
            input,
        );

        expect(esb.error).toEqual('page_index_without_page_size');
        expect(esb.response).toEqual(null);
    });

    it('uses all but $eq', function() {
        const input: ExampleInputDto = {
            $sort: [
                {
                    $field_name: 'name',
                    $order: 'desc',
                },
            ],
            $page_index: 0,
            $page_size: 10,
            name: {
                $ne: 'Jean',
                $lt: 'Jacques',
                $gt: 'George',
                $in: ['Marc'],
                $nin: ['Marie'],
                $lte: 'Samuel',
                $gte: 'Simon',
                $contains: '*s*',
                $ncontains: '*d*',
            },
            age: {
                $ne: 22,
                $lt: 23,
                $gt: 24,
                $in: [25],
                $nin: [26],
                $lte: 27,
                $gte: 28,
                $contains: 29,
                $ncontains: 30,
            },
        };

        const esb: ServiceResponse<EsSearchOptionsStatic> = ESSearchBodyBuilder(
            input,
        );

        expect(esb.error).toEqual(null);
        expect(esb.response).toEqual({
            body: {
                sort: [
                    {
                        name: 'desc',
                    },
                ],
                from: 0,
                size: 10,
                query: {
                    bool: {
                        must_not: [
                            {
                                term: {
                                    name: 'Jean',
                                },
                            },
                            {
                                terms: {
                                    name: ['Marie'],
                                },
                            },
                            {
                                wildcard: {
                                    name: {
                                        value: '*d*',
                                    },
                                },
                            },
                            {
                                term: {
                                    age: 22,
                                },
                            },
                            {
                                terms: {
                                    age: [26],
                                },
                            },
                            {
                                wildcard: {
                                    age: {
                                        value: 30,
                                    },
                                },
                            },
                        ],
                        must: [
                            {
                                terms: {
                                    name: ['Marc'],
                                },
                            },
                            {
                                wildcard: {
                                    name: {
                                        value: '*s*',
                                    },
                                },
                            },
                            {
                                range: {
                                    name: {
                                        lt: 'Jacques',
                                    },
                                },
                            },
                            {
                                range: {
                                    name: {
                                        gt: 'George',
                                    },
                                },
                            },
                            {
                                range: {
                                    name: {
                                        lte: 'Samuel',
                                    },
                                },
                            },
                            {
                                range: {
                                    name: {
                                        gte: 'Simon',
                                    },
                                },
                            },
                            {
                                terms: {
                                    age: [25],
                                },
                            },
                            {
                                wildcard: {
                                    age: {
                                        value: 29,
                                    },
                                },
                            },
                            {
                                range: {
                                    age: {
                                        lt: 23,
                                    },
                                },
                            },
                            {
                                range: {
                                    age: {
                                        gt: 24,
                                    },
                                },
                            },
                            {
                                range: {
                                    age: {
                                        lte: 27,
                                    },
                                },
                            },
                            {
                                range: {
                                    age: {
                                        gte: 28,
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        });
    });
});
