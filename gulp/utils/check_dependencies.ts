import { from_root } from './from_root';

export async function check_dependencies() {
    const package_json = await require(from_root('./package.json'));

    if (
        package_json.dependencies['web3-provider-engine'] !== '15.0.7' ||
        package_json.dependencies['@ledgerhq/hw-transport-node-hid'] !== '5.13.1' ||
        package_json.dependencies['@ledgerhq/web3-subprovider'] !== '5.14.0' ||
        package_json.dependencies['@ledgerhq/hw-app-eth'] !== '5.14.0' ||
        package_json.dependencies['@ledgerhq/logs'] !== '5.13.1' ||
        package_json.dependencies['@0x/subproviders'] !== '6.0.8'
    ) {
        console.error(`
            Error detected in package versions required for deployment:
            
                    web3-provider-engine 15.0.7
                    @ledgerhq/hw-transport-node-hid 5.13.1
                    @ledgerhq/web3-subprovider 5.14.0
                    @ledgerhq/hw-app-eth 5.14.0
                    @ledgerhq/logs 5.13.1
                    @0x/subproviders 6.0.8
                    
            and global packages:
                    
                    truffle 5.0.18
        `);
        throw new Error(`Invalid dependencies versions`);
    }

}
