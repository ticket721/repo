import { use, expect }     from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

import { Web3Service } from '@lib/common/web3/Web3.service';

class Web3Mock {
    constructor(provider: any) {
    }

    eth = {
        net: {
            getId: async (): Promise<number> => 1
        }
    };

    static providers = {
        HttpProvider: class {
            constructor(host: string) {
            }
        }
    }
}

describe('Web3 Service', function () {

    it('build service', async function () {

        const web3Service = new Web3Service({
            Web3: Web3Mock,
            host: '127.0.0.1',
            protocol: 'http',
            port: '8545'
        });

        const instance = web3Service.get();
        expect(instance).to.not.equal(undefined);

        const net = await web3Service.net();
        expect(net).to.equal(1);

    });

    it('build service (pre-fetch net id)', async function () {

        const web3Service = new Web3Service({
            Web3: Web3Mock,
            host: '127.0.0.1',
            protocol: 'http',
            port: '8545'
        });

        const instance = web3Service.get();
        expect(instance).to.not.equal(undefined);

        await web3Service.onModuleInit();

        const net = await web3Service.net();
        expect(net).to.equal(1);

    });

    it('build https service', async function () {

        const web3Service = new Web3Service({
            Web3: Web3Mock,
            host: '127.0.0.1',
            protocol: 'http',
            port: '8545'
        });

        const instance = web3Service.get();
        expect(instance).to.not.equal(undefined);

        const net = await web3Service.net();
        expect(net).to.equal(1);

    });

    it('build invalid service', async function () {

        expect((): void => {
            new Web3Service({
                Web3: Web3Mock,
                host: '127.0.0.1',
                protocol: 'ptth',
                port: '8545'
            })
        }).to.throw('Unknown protocol ptth to build web3 instance')


    });

});
