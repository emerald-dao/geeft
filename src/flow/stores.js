import { writable, get, derived } from 'svelte/store';
import { contractData } from './contractData';

export const user = writable({ loggedIn: false });
export const network = writable('mainnet');
export const transactionStatus = writable(null);
export const transactionInProgress = writable(false);
export const txId = writable(null);
export const addresses = derived(
	[network],
	([$network]) => {
		return {
			Geeft: contractData.utility.Geeft.networks[$network],
			NonFungibleToken: contractData.utility.NonFungibleToken.networks[$network],
			MetadataViews: contractData.utility.MetadataViews.networks[$network],
			FungibleToken: contractData.utility.FungibleToken.networks[$network],
			FlowToken: contractData.utility.FlowToken.networks[$network],
			ECTreasury: contractData.utility.ECTreasury.networks[$network],
			FLOAT: contractData.utility.FLOAT.networks[$network],
			NFTCatalog: contractData.utility.NFTCatalog.networks[$network]
		}
	}
)

export const sendGiftStatus = writable({ success: false, inProgress: false, error: null });
export const openGiftStatus = writable({ success: false, inProgress: false, error: null });
export const setupStatus = writable({ success: false, inProgress: false, error: null });