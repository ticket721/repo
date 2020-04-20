export interface ConfigsState {
    ethereum_endpoint_url: string;
    ethereum_network_id: number;
    ethereum_network_genesis_hash: string;
}

export const InitialConfigsState: ConfigsState = {
    ethereum_endpoint_url: null,
    ethereum_network_id: null,
    ethereum_network_genesis_hash: null
};
