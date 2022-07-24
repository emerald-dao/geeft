import { writable, get, derived } from 'svelte/store';

export const collections = writable({});
export const currentCollection = writable("FLOAT");
export const selected = writable({});
export const message = writable(null);
export const recipient = writable(null);
export const geeftMessage = writable(null);