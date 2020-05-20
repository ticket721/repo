async function stall(stallTime = 2000) {
    await new Promise(resolve => setTimeout(resolve, stallTime));
}

export class T721SDKMock {

    constructor() {
        this.actions.create = this.actions.create.bind(this);

    }

    public actions = {
        create: async (token: string, query: any) => {
            await stall();

            return {
                data: `benef ${Math.random()}`,
                status: 0,
                statusText: 'status',
                headers: {},
                config: {},
            }
        },
        update: async (query: any) => {
            await stall();
            return {
                data: `benef ${Math.random()}`,
                status: 0,
                statusText: 'status',
                headers: {},
                config: {},
            }
        },
        search: async (query: any) => {
            await stall();
            return {
                data: `benef ${Math.random()}`,
                status: 0,
                statusText: 'status',
                headers: {},
                config: {},
            }
        }
    }
}
