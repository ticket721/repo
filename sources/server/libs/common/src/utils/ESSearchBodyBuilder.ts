import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ServiceResponse } from '@app/server/utils/ServiceResponse';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { Sort } from '@lib/common/utils/Sort';

function digger(
    body: Partial<EsSearchOptionsStatic>,
    ...args: string[]
): Partial<EsSearchOptionsStatic> {
    if (!args.length) {
        return body;
    }

    if (!body[args[0]]) {
        body[args[0]] = {};
    }

    return {
        ...body,
        [args[0]]: digger(body[args[0]], ...args.slice(1)),
    };
}

function append(point: any, data: any): any {
    if (point) {
        if (Array.isArray(point)) {
            point.push(data);
            return point;
        } else {
            point = [point, data];
            return point;
        }
    } else {
        return data;
    }
}

function SearchableFieldEqualStatement<T>(
    fieldName: string,
    $eq: T,
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must = append(body.body.query.bool.must, {
        term: {
            [fieldName]: $eq,
        },
    });

    return body;
}

function SearchableFieldInStatement<T>(
    fieldName: string,
    $in: T[],
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must = append(body.body.query.bool.must, {
        terms: {
            [fieldName]: $in,
        },
    });

    return body;
}

function SearchableFieldNotEqualStatement<T>(
    fieldName: string,
    $ne: T,
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must_not = append(body.body.query.bool.must_not, {
        term: {
            [fieldName]: $ne,
        },
    });

    return body;
}

function SearchableFieldNotInStatement<T>(
    fieldName: string,
    $nin: T[],
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must_not = append(body.body.query.bool.must_not, {
        terms: {
            [fieldName]: $nin,
        },
    });

    return body;
}

function SearchableFieldContainsStatement<T>(
    fieldName: string,
    $contains: T,
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must = append(body.body.query.bool.must, {
        wildcard: {
            [fieldName]: {
                value: $contains,
            },
        },
    });

    return body;
}

function SearchableFieldNotContainsStatement<T>(
    fieldName: string,
    $ncontains: T,
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must_not = append(body.body.query.bool.must_not, {
        wildcard: {
            [fieldName]: {
                value: $ncontains,
            },
        },
    });

    return body;
}

function SearchableFieldLowerThanStatement<T>(
    fieldName: string,
    $lt: T,
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must = append(body.body.query.bool.must, {
        range: {
            [fieldName]: {
                lt: $lt,
            },
        },
    });

    return body;
}

function SearchableFieldGreaterThanStatement<T>(
    fieldName: string,
    $gt: T,
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must = append(body.body.query.bool.must, {
        range: {
            [fieldName]: {
                gt: $gt,
            },
        },
    });

    return body;
}

function SearchableFieldLowerThanEqualStatement<T>(
    fieldName: string,
    $lte: T,
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must = append(body.body.query.bool.must, {
        range: {
            [fieldName]: {
                lte: $lte,
            },
        },
    });

    return body;
}

function SearchableFieldGreaterThanEqualStatement<T>(
    fieldName: string,
    $gte: T,
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    body = digger(body, 'body', 'query', 'bool');

    body.body.query.bool.must = append(body.body.query.bool.must, {
        range: {
            [fieldName]: {
                gte: $gte,
            },
        },
    });

    return body;
}

function defined(val: any): boolean {
    return val !== null && val !== undefined;
}

export function SearchableFieldConverter<T = any>(
    fieldName: string,
    field: SearchableField<T>,
    body: Partial<EsSearchOptionsStatic>,
): Partial<EsSearchOptionsStatic> {
    if (defined(field.$eq)) {
        body = SearchableFieldEqualStatement<T>(fieldName, field.$eq, body);
    }

    if (defined(field.$ne)) {
        body = SearchableFieldNotEqualStatement<T>(fieldName, field.$ne, body);
    }

    if (defined(field.$in)) {
        body = SearchableFieldInStatement<T>(fieldName, field.$in, body);
    }

    if (defined(field.$nin)) {
        body = SearchableFieldNotInStatement<T>(fieldName, field.$nin, body);
    }

    if (defined(field.$contains)) {
        body = SearchableFieldContainsStatement<T>(
            fieldName,
            field.$contains,
            body,
        );
    }

    if (defined(field.$ncontains)) {
        body = SearchableFieldNotContainsStatement<T>(
            fieldName,
            field.$ncontains,
            body,
        );
    }

    if (defined(field.$lt)) {
        body = SearchableFieldLowerThanStatement<T>(fieldName, field.$lt, body);
    }

    if (defined(field.$gt)) {
        body = SearchableFieldGreaterThanStatement<T>(
            fieldName,
            field.$gt,
            body,
        );
    }

    if (defined(field.$lte)) {
        body = SearchableFieldLowerThanEqualStatement<T>(
            fieldName,
            field.$lte,
            body,
        );
    }

    if (defined(field.$gte)) {
        body = SearchableFieldGreaterThanEqualStatement<T>(
            fieldName,
            field.$gte,
            body,
        );
    }

    return body;
}

export function ESSearchBodyBuilder(
    req: Partial<SortablePagedSearch>,
): ServiceResponse<EsSearchOptionsStatic> {
    let body: Partial<EsSearchOptionsStatic> = {};

    for (const field of Object.keys(req)) {
        if (['$sort', '$page_size', '$page_index'].indexOf(field) === -1) {
            body = SearchableFieldConverter(field, req[field], body);
        } else {
            switch (field) {
                case '$sort': {
                    body = digger(body, 'body', 'sort');
                    body.body.sort = req[field].map((e: Sort) => ({
                        [e.$field_name]: e.$order,
                    }));
                    break;
                }
                case '$page_size': {
                    body = digger(body, 'body', 'size');
                    body.body.size = req[field];
                    break;
                }
                case '$page_index': {
                    if (!defined(req.$page_size)) {
                        return {
                            error: 'page_index_without_page_size',
                            response: null,
                        };
                    }
                    body = digger(body, 'body', 'from');
                    body.body.from = req[field] * req.$page_size;
                    break;
                }
            }
        }
    }

    return {
        error: null,
        response: body,
    };
}
