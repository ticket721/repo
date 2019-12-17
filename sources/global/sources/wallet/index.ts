import { Wallet }           from 'ethers';
import { ProgressCallback } from 'ethers/utils';
import { isAddress }        from '../address';
import * as Joi             from '@hapi/joi';
import { log, log_err }     from '../log';

export const createWallet = async (): Promise<Wallet> => {
    log(`wallet::createWallet | creating wallet`);
    const wallet = Wallet.createRandom();
    log(`wallet::createWallet | created ${wallet.address}`);
    return wallet;
};

export interface EncryptedWallet {
    address: string;
    id: string;
    version: number;
    Crypto: {
        cipher: string;
        cipherparams: any;
        ciphertext: string;
        kdf: string;
        kdfparams: any;
        mac: string;
    }
}

export const encryptWallet = async (wallet: Wallet, password: string, cb?: ProgressCallback): Promise<any> => {
    log(`wallet::encryptWallet | encrypting wallet`);
    return wallet.encrypt(password, cb);
};

export const isV3EncryptedWallet = (wallet: EncryptedWallet): boolean => {
    log(`wallet::isV3EncryptedWallet | verifying wallet format`);
    if (!wallet) {
        log_err(`wallet::isV3EncryptedWallet | ${wallet} value provided`);
        return false;
    }

    const V3EncryptedWalletSchema: Joi.ObjectSchema = Joi.object({
        address: Joi.string().custom(isAddress).required(),
        id: Joi.string().uuid().required(),
        version: Joi.number().valid(3).required(),
        Crypto: Joi.object({
            cipher: Joi.string(),
            cipherparams: Joi.object(),
            ciphertext: Joi.string(),
            kdf: Joi.string(),
            kdfparams: Joi.object(),
            mac: Joi.string(),
        }),
        'x-ethers': Joi.any(),
    });

    const { error } = V3EncryptedWalletSchema.validate(wallet);

    if (error) {
        log_err(`wallet::isV3EncryptedWallet | invalid wallet`);
        log_err(error);
        return false;
    }

    return true;

};
