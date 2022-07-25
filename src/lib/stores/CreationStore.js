import { writable, get, derived } from 'svelte/store';

export const collections = writable({});
export const currentCollection = writable("FLOAT");

export const tokens = writable({});
export const currentToken = writable("FlowToken");

export const displayNFTs = writable(true);

export const selectedNFTs = writable({});
export const selectedVaults = writable({});
export const message = writable(null);
export const recipient = writable(null);
export const geeftMessage = writable(null);