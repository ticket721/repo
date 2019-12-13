import {use, expect} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

import {setVerbosity}                                                        from '../log';
import { createWallet, EncryptedWallet, encryptWallet, isV3EncryptedWallet } from './index';
import { isAddress }                                                         from '../address';
import { Wallet } from 'ethers';

setVerbosity(true);

describe('Wallet', function() {

    it('generate wallet', async function() {
        const wallet: Wallet = await createWallet();
        expect(isAddress(wallet.address)).to.be.true;
    });

    it('encrypt wallet', async function() {
        const wallet: Wallet = await createWallet();
        let _progress = 0;
        const encrypted = await encryptWallet(wallet, 'salut123', (progress: number) => {
            if (progress === 1) {
                _progress = 1;
            }
        });
        expect(_progress).to.equal(1);
        expect(encrypted).to.not.be.undefined;
        expect(typeof encrypted).to.equal('string');
    });

    it('check encrypted wallet format', async function() {
        const wallet: Wallet = await createWallet();
        const encrypted = await encryptWallet(wallet, 'salut123');
        const parsedEncrypted: EncryptedWallet = JSON.parse(encrypted);
        expect(isV3EncryptedWallet(parsedEncrypted)).to.be.true;
    });

    it('check invalid encrypted wallet format', async function() {
        const wallet: Wallet = await createWallet();
        const encrypted = await encryptWallet(wallet, 'salut123');
        const parsedEncrypted: EncryptedWallet = JSON.parse(encrypted);
        parsedEncrypted.version = 2;
        expect(isV3EncryptedWallet(parsedEncrypted)).to.be.false;
    });

    it('check invalid null encrypted wallet format', async function() {
        expect(isV3EncryptedWallet(null)).to.be.false;
    });

});
