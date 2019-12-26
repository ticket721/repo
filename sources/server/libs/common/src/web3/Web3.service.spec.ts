
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
        expect(instance).toBeDefined();

        const net = await web3Service.net();
        expect(net).toEqual(1);

        const net_again = await web3Service.net();
        expect(net_again).toEqual(1);

    });

    it('build https service', async function () {

        const web3Service = new Web3Service({
            Web3: Web3Mock,
            host: '127.0.0.1',
            protocol: 'https',
            port: '8545'
        });

        const instance = web3Service.get();
        expect(instance).toBeDefined();

        const net = await web3Service.net();
        expect(net).toEqual(1);

    });

    it('build invalid service', async function () {

        await expect(() => {
            new Web3Service({
                Web3: Web3Mock,
                host: '127.0.0.1',
                protocol: 'ptth',
                port: '8545'
            });
        }).toThrowError('Unknown protocol ptth to build web3 instance');

    });

});
