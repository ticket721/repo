export { isV3EncryptedWallet, encryptWallet, EncryptedWallet, createWallet, loadWallet } from './wallet';
export { getPasswordStrength, PasswordStrengthReport } from './password';
export { isAddress, toAcceptedAddressFormat } from './address';
export { setVerbosity } from './log';
export { isKeccak256, toAcceptedKeccak256Format, keccak256, keccak256FromBuffer } from './hash';
export { Wallet } from 'ethers';
export { WithdrawAuthorization } from './signers/WithdrawAuthorization';
export { Web3LoginSigner } from './signers/Web3Login';
export { Web3RegisterSigner } from './signers/Web3Register';
export { RefractMtx, MetaTransaction, TransactionParameters } from './signers/RefractMtx';
export { MintAuthorization } from './signers/MintAuthorization';
export { MintTokensAuthorization } from './signers/MintTokensAuthorization';
export { uuidEq, toB32, leftPad, serialize, toHex, decimalToHex, isFutureDateRange, isValidDateRange, log2 } from './utils';
export { isTransactionHash, toAcceptedTransactionHashFormat, isTrackingId } from './transactions';
export { getT721ControllerGroupID, encode } from './abi';
export { b64Encode, b64Decode } from './encoding';
export { currencies, symbolOf } from './currency';
export {
    EventCreationPayload,
    checkEvent,
    CategoryCreationPayload,
    PayloadError,
    ErrorNode,
    ErrorLeaf,
    EventImagesMetadataPayload,
    EventTextMetadataPayload,
    DateCreationPayload,
    DateLocationPayload,
} from './event';

/**
 * Longitude / Latitude Coordinates
 */
export class Coordinates {
    /**
     * Longitude
     */
    lon: number;

    /**
     * Latitude
     */
    lat: number;
}

/**
 * Information about a city
 */
export interface City {
    /**
     * Name of the city
     */
    name: string;

    /**
     * Name with extended ascii support
     */
    nameAscii: string;

    /**
     * Name of the region
     */
    nameAdmin: string;

    /**
     * Name of the country
     */
    country: string;

    /**
     * Coordinates of the city
     */
    coord: Coordinates;

    /**
     * Population count of the city
     */
    population: number;

    /**
     * Unique identifier of the city
     */
    id: number;
}

/**
 * Fuzzy Search Result
 */
export interface MatchingCity {
    /**
     * Score of the result
     */
    score: number;

    /**
     * Resulting city
     */
    city: City;
}


