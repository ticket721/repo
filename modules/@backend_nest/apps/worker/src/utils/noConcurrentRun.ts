const runningMap: {[key: string]: boolean} = {};

export async function noConcurrentRun(name: string, fn: () => Promise<void>): Promise<void> {

    if (!runningMap[name]) {
        runningMap[name] = true;
        let error = null;

        try {
            await fn();
        } catch (e) {
            error = e;
        }

        runningMap[name] = false;

        if (error) {
            throw error;
        }
    }

}
