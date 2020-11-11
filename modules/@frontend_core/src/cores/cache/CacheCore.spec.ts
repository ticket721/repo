import { instance, mock, when } from 'ts-mockito';
import { T721SDK } from '@common/sdk';
import { CacheCore } from './CacheCore';
import { keccak256 } from '@common/global';

describe('CacheCore', (): void => {
    describe('key', key_tests);
    describe('elapsedTicks', elapsed_ticks_tests);
    describe('shouldFetch', should_fetch_tests);
});

export function key_tests(): void {
    const mockT721Sdk: T721SDK = mock(T721SDK);

    test('should return correct keccak256 hash', () => {
        global['window'] = {};
        global['window']['t721Sdk'] = instance(mockT721Sdk);

        const method: string = 'validmethod';
        const args: any = [{ args: 'args' }];
        const unhashedKey: string = JSON.stringify({
            method,
            args,
        });

        when(mockT721Sdk[method]).thenReturn(true);

        expect(CacheCore.key(method, args)).toEqual(keccak256(unhashedKey));
    });
}

export function elapsed_ticks_tests(): void {
    test('should return correct elapsed ticks since start timestamp', () => {
        const returnElapsedTicks: number = 20;
        const tickInterval: number = 100;

        expect(
            CacheCore.elapsedTicks({
                intervalId: 0,
                tickInterval,
                startTimestamp: Date.now() - returnElapsedTicks * tickInterval,
            }),
        ).toEqual(returnElapsedTicks);
    });
}

export function should_fetch_tests(): void {
    test('should return false when there is no corresponding mounted component', () => {
        const key: string = 'key';
        expect(
            CacheCore.shouldFetch(
                {
                    settings: {
                        intervalId: 0,
                        tickInterval: 100,
                        startTimestamp: Date.now() - 8 * 100,
                    },
                    items: {},
                    properties: {
                        [key]: {
                            lastFetch: 4,
                            lastResp: 7,
                            method: 'method',
                            args: 'args',
                            requestedBy: [],
                            refreshRates: [],
                            score: 1,
                        },
                    },
                },
                key,
            ),
        ).toEqual(false);
    });

    test(`should return false when all mounted component rates are set to default value (0 || null)
    and item has already been fetch once`, () => {
        const key: string = 'key';
        expect(
            CacheCore.shouldFetch(
                {
                    settings: {
                        intervalId: 0,
                        tickInterval: 100,
                        startTimestamp: Date.now() - 8 * 100,
                    },
                    items: {},
                    properties: {
                        [key]: {
                            lastFetch: 4,
                            lastResp: 7,
                            method: 'method',
                            args: 'args',
                            requestedBy: ['id1', 'id2', 'id3', 'id4'],
                            refreshRates: [0, null, 0, 0],
                            score: 1,
                        },
                    },
                },
                key,
            ),
        ).toEqual(false);
    });

    test(`should return false when lastFetch is greater than lastResp`, () => {
        const key: string = 'key';
        expect(
            CacheCore.shouldFetch(
                {
                    settings: {
                        intervalId: 0,
                        tickInterval: 100,
                        startTimestamp: Date.now() - 8 * 100,
                    },
                    items: {},
                    properties: {
                        [key]: {
                            lastFetch: 6,
                            lastResp: 4,
                            method: 'method',
                            args: 'args',
                            requestedBy: ['id1', 'id2'],
                            refreshRates: [1, 2],
                            score: 1,
                        },
                    },
                },
                key,
            ),
        ).toEqual(false);
    });

    test(`should return false when lastFetch is not null/undefined
    and current tick does not exceed refresh rate`, () => {
        const key: string = 'key';
        expect(
            CacheCore.shouldFetch(
                {
                    settings: {
                        intervalId: 0,
                        tickInterval: 100,
                        startTimestamp: Date.now() - 8 * 100,
                    },
                    items: {},
                    properties: {
                        [key]: {
                            lastFetch: 4,
                            lastResp: 7,
                            method: 'method',
                            args: 'args',
                            requestedBy: ['id1', 'id2'],
                            refreshRates: [2, 4],
                            score: 1,
                        },
                    },
                },
                key,
            ),
        ).toEqual(false);
    });

    test(`should return true when lastFetch is null/undefined`, () => {
        const key: string = 'key';
        expect(
            CacheCore.shouldFetch(
                {
                    settings: {
                        intervalId: 0,
                        tickInterval: 100,
                        startTimestamp: Date.now() - 8 * 100,
                    },
                    items: {},
                    properties: {
                        [key]: {
                            lastFetch: null,
                            lastResp: null,
                            method: 'method',
                            args: 'args',
                            requestedBy: ['id1', 'id2'],
                            refreshRates: [2, 4],
                            score: 1,
                        },
                    },
                },
                key,
            ),
        ).toEqual(true);
    });

    test(`should return true when current tick exceeded refresh rate`, () => {
        const key: string = 'key';
        expect(
            CacheCore.shouldFetch(
                {
                    settings: {
                        intervalId: 0,
                        tickInterval: 100,
                        startTimestamp: Date.now() - 8 * 100,
                    },
                    items: {},
                    properties: {
                        [key]: {
                            lastFetch: 4,
                            lastResp: 5,
                            method: 'method',
                            args: 'args',
                            requestedBy: ['id1', 'id2'],
                            refreshRates: [2, 4],
                            score: 1,
                        },
                    },
                },
                key,
            ),
        ).toEqual(true);
    });
}
