
const CONTRACT_NAME = 'MetaMarketplace_v0';
const SCOPE_NAME = 't721';
let SCOPE_INDEX = 0;
const CHAIN_ID = 1;
const ZADDRESS = '0x0000000000000000000000000000000000000000';

const setScopeIndex = (si) => {
    SCOPE_INDEX = si;
}

module.exports = {
    CONTRACT_NAME,
    SCOPE_INDEX,
    SCOPE_NAME,
    CHAIN_ID,
    ZADDRESS,
    setScopeIndex
}
