import { writable, get, derived } from 'svelte/store';
import { contractData } from './contractData';

export const user = writable({ loggedIn: false });
export const network = writable('emulator');
export const transactionStatus = writable(null);
export const transactionInProgress = writable(false);
export const txId = writable(null);
export const addresses = derived(
	[network],
	([$network]) => {
		return {
			Geeft: contractData.utility.Geeft.networks[$network],
			ExampleNFT: contractData.NFT.ExampleNFT.networks[$network],
			NonFungibleToken: contractData.utility.NonFungibleToken.networks[$network],
			MetadataViews: contractData.utility.MetadataViews.networks[$network],
			FungibleToken: contractData.utility.FungibleToken.networks[$network],
			FlowToken: contractData.utility.FlowToken.networks[$network],
			ECTreasury: contractData.utility.ECTreasury.networks[$network]
		}
	}
)