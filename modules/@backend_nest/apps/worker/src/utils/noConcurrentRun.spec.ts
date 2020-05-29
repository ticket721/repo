import { noConcurrentRun } from '@app/worker/utils/noConcurrentRun';

describe('noConcurrentRun', function() {

    it('should run the function', async function() {

        let called = false;

        const fn = async (): Promise<void> => {
            called = true;
        };

        await noConcurrentRun('shouldRunTheFunction', fn);

        expect(called).toBeTruthy();

    });

    it('should forward errors and still be callacble', async function() {

        let called = false;

        const errorfn = async (): Promise<void> => {
            throw new Error('unexpected error')
        };

        const fn = async (): Promise<void> => {
            called = true;
        };

        await expect(noConcurrentRun('shouldForwardErrors', errorfn)).rejects.toMatchObject(new Error('unexpected error'));

        await noConcurrentRun('shouldForwardErrors', fn);

        expect(called).toBeTruthy();

    });

    it('should prevent concurrent runs', async function() {

        let resolve = null;
        let mainStop = null;
        let called = 0;

        const remote = new Promise((ok, ko) => {
            resolve = ok
        });

        const stop = new Promise((ok, ko) => {
            mainStop = ok;
        });

        const fn = async (): Promise<void> => {
            await remote;
            ++called;
        };

        const uselessFn = async (): Promise<void> => {
            ++called;
        };

        noConcurrentRun('shouldPreventConcurrentRuns', fn).then(() => {
            mainStop();
        });

        await noConcurrentRun('shouldPreventConcurrentRuns', uselessFn)

        resolve();

        await stop;

        expect(called).toEqual(1);

    });

});
