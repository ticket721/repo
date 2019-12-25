import {setVerbosity}                                                        from '../log';
import { createWallet, EncryptedWallet, encryptWallet, isV3EncryptedWallet } from './index';
import { isAddress }                                                         from '../address';
import { Wallet } from 'ethers';

setVerbosity(true);

describe('Wallet', function() {

    test('generate wallet', async function() {
        const wallet: Wallet = await createWallet();
        expect(isAddress(wallet.address)).toBeTruthy();
    });

    test('encrypt wallet', async function() {
        const wallet: Wallet = await createWallet();
        let _progress = 0;
        const encrypted = await encryptWallet(wallet, 'salut123', (progress: number) => {
            if (progress === 1) {
                _progress = 1;
            }
        });
        expect(_progress).toEqual(1);
        expect(encrypted).toBeDefined();
        expect(typeof encrypted).toEqual('string');
    });

    test('check encrypted wallet format', async function() {
        const wallet: Wallet = await createWallet();
        const encrypted = await encryptWallet(wallet, 'salut123');
        const parsedEncrypted: EncryptedWallet = JSON.parse(encrypted);
        expect(isV3EncryptedWallet(parsedEncrypted)).toBeTruthy();
    });

    test('check invalid encrypted wallet format', async function() {
        const wallet: Wallet = await createWallet();
        const encrypted = await encryptWallet(wallet, 'salut123');
        const parsedEncrypted: EncryptedWallet = JSON.parse(encrypted);
        parsedEncrypted.version = 2;
        expect(isV3EncryptedWallet(parsedEncrypted)).toBeFalsy();
    });

    test('check invalid null encrypted wallet format', async function() {
        expect(isV3EncryptedWallet(null)).toBeFalsy();
    });

});
