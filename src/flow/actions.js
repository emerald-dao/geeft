import { browser } from '$app/env';
import { get } from 'svelte/store';

import * as fcl from '@onflow/fcl';
import './config';

import { user, transactionStatus, transactionInProgress, addresses, network, txId, openGiftStatus, sendGiftStatus, setupStatus } from './stores';
import { contractData } from './contractData';

///////////////
// Cadence code 
///////////////
// Scripts
import discoverScript from "./scripts/discover.cdc?raw";
import readGeeftsScript from "./scripts/read_geefts.cdc?raw";
import readGeeftInfoScript from "./scripts/geeft_info.cdc?raw";
import areSetupScript from "./scripts/are_setup.cdc?raw";
import getImportsScript from "./scripts/get_imports.cdc?raw";
// Transactions
import setupTx from "./transactions/setup.cdc?raw";
import createGeeftTx from "./transactions/create_geeft.cdc?raw";
import openGeeftTx from "./transactions/open_geeft.cdc?raw";
import { message, recipient, selectedNFTs, selectedVaults } from '$lib/stores/CreationStore';

if (browser) {
  // set Svelte $user store to currentUser,
  // so other components can access it
  fcl.currentUser.subscribe(user.set, []);
}

// Lifecycle FCL Auth functions
export const logOut = () => fcl.unauthenticate();
export const logIn = async () => await fcl.authenticate();
export const authenticate = () => {
  if (get(user).loggedIn) {
    logOut();
  } else {
    logIn();
  }
};

function translateError(error) {
  if (error.includes('The recipient does not have a Geeft Collection')) {
    return 'The recipient must set up a Geeft Collection first by going to https://geeft.ecdao.org/ and clicking "Setup" on the main page.'
  }
  return error
}

function switchNetwork(newNetwork) {
  if (newNetwork === 'emulator') {
    fcl
      .config()
      .put('accessNode.api', 'http://localhost:8080')
      .put('discovery.wallet', 'http://localhost:8701/fcl/authn')
  } else if (newNetwork === 'testnet') {
    saveFileInStore(network, newNetwork)
    fcl
      .config()
      .put('accessNode.api', 'https://rest-testnet.onflow.org')
      .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn');
  } else if (newNetwork === 'mainnet') {
    saveFileInStore(network, newNetwork)
    fcl
      .config()
      .put('accessNode.api', 'https://rest-mainnet.onflow.org')
      .put('discovery.wallet', 'https://fcl-discovery.onflow.org/authn');
  }
}

function initTransactionState() {
  transactionInProgress.set(true);
  transactionStatus.set(-1);
}

export function replaceWithProperValues(script, contractName = '', contractAddress = '') {
  const addressList = get(addresses);
  return script
    .replace('"../contracts/Geeft.cdc"', addressList.Geeft)
    .replace('"../contracts/utilities/MetadataViews.cdc"', addressList.MetadataViews)
    .replace('"../contracts/utilities/NonFungibleToken.cdc"', addressList.NonFungibleToken)
    .replace('"../contracts/utilities/FungibleToken.cdc"', addressList.FungibleToken)
    .replace('"../contracts/projects/FLOAT/FLOAT.cdc"', addressList.FLOAT)
    .replace('"../contracts/utilities/NFTCatalog.cdc"', addressList.NFTCatalog)
}

// ****** Transactions ****** //

export const setup = async () => {

  initTransactionState();

  setupStatus.set({ inProgress: true, success: false });

  try {
    const transactionId = await fcl.mutate({
      cadence: replaceWithProperValues(setupTx),
      args: (arg, t) => [
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999,
    });
    console.log({ transactionId });

    txId.set(transactionId);

    fcl.tx(transactionId).subscribe((res) => {
      transactionStatus.set(res.status);
      console.log(res);
      if (res.status === 4) {
        if (res.statusCode === 0) {
          setupStatus.set({ success: true, inProgress: false });
        } else {
          setupStatus.set({ success: false, inProgress: false, error: translateError(res.errorMessage) });
        }
        setTimeout(() => transactionInProgress.set(false), 2000);
      }
    });
  } catch (e) {
    console.log(e);
    setupStatus.set({ success: false, inProgress: false, error: translateError(e) });
    transactionStatus.set(99);
  }
}

export const createGeeft = async () => {
  initTransactionState();

  let storagePaths = [];
  let publicPaths = [];

  const selectedNFTsStore = get(selectedNFTs);
  let collectionIds = [];
  let collectionAdditions = '';
  const importInfoForCollections = await getImports(Object.keys(selectedNFTsStore));
  let imports = '';
  for (const collectionName in selectedNFTsStore) {
    if (selectedNFTsStore[collectionName].length === 0) {
      continue;
    }
    collectionIds.push({ key: collectionName, value: selectedNFTsStore[collectionName] });

    collectionAdditions += `
    let ${collectionName}Metadata: NFTCatalog.NFTCatalogMetadata = catalog["${collectionName}"]!
    let ${collectionName}PublicPath: PublicPath = collectionMetadata.collectionData.publicPath
    let ${collectionName}StoragePath: StoragePath = collectionMetadata.collectionData.storagePath
    let ${collectionName}Batch: @[{MetadataViews.Resolver}] <- []
    let ${collectionName}Collection = signer.borrow<&{NonFungibleToken.Provider, MetadataViews.ResolverCollection}>(from: ${collectionName}StoragePath)!
    for id in ids["${collectionName}"]! {
      let nft <- ${collectionName}Collection.withdraw(withdrawID: id) as! @${collectionName}.NFT
      ${collectionName}Batch.append(<- (nft as @{MetadataViews.Resolver}))
    }
    let ${collectionName}Container <- Geeft.createCollectionContainer(publicPath: ${collectionName}PublicPath, storagePath: ${collectionName}StoragePath, assets: <- ${collectionName}Batch, to: recipient)
    preparedNFTs["${collectionName}"] <-! ${collectionName}Container\n
    `;
    imports += `import ${collectionName} from ${importInfoForCollections[collectionName]}\n`
  }

  const selectedVaultsStore = get(selectedVaults);
  let vaultAmounts = [];
  for (const vaultName in selectedVaultsStore) {
    const { storagePath, receiverPath } = contractData.Token[vaultName];
    vaultAmounts.push({ key: vaultName, value: parseFloat(selectedVaultsStore[vaultName]).toFixed(2) });
    publicPaths.push({
      key: vaultName,
      value: { domain: 'public', identifier: receiverPath }
    });
    storagePaths.push({
      key: vaultName,
      value: { domain: 'storage', identifier: storagePath }
    })
  }

  sendGiftStatus.set({ success: false, inProgress: true });

  try {
    const transactionId = await fcl.mutate({
      cadence: replaceWithProperValues(createGeeftTx).replace("// INSERT COLLECTIONS HERE", collectionAdditions).replace("// INSERT IMPORTS HERE", imports),
      args: (arg, t) => [
        arg(collectionIds, t.Dictionary({ key: t.String, value: t.Array(t.UInt64) })),
        arg(publicPaths, t.Dictionary({ key: t.String, value: t.Path })),
        arg(storagePaths, t.Dictionary({ key: t.String, value: t.Path })),
        arg(vaultAmounts, t.Dictionary({ key: t.String, value: t.UFix64 })),
        arg(get(message), t.Optional(t.String)),
        arg([], t.Dictionary({ key: t.String, value: t.String })),
        arg(get(recipient), t.Address)
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999,
    });

    txId.set(transactionId);

    fcl.tx(transactionId).subscribe((res) => {
      transactionStatus.set(res.status);
      console.log(res);
      if (res.status === 4) {
        if (res.statusCode === 0) {
          sendGiftStatus.set({ success: true, inProgress: false });
        } else {
          sendGiftStatus.set({ success: false, inProgress: false, error: translateError(res.errorMessage) });
        }
        setTimeout(() => transactionInProgress.set(false), 2000);
      }
    });
  } catch (e) {
    console.log(e);
    sendGiftStatus.set({ success: false, inProgress: false, error: translateError(e) });
    transactionStatus.set(99);
  }
}

export const openGeeft = async (geeft) => {

  initTransactionState();

  // TODO
  // Get imports from the collections that are in it
  let imports = '';
  let collectionSetups = '';
  const currentNetwork = get(network);

  for (const collectionName in geeft.collections) {
    const collectionInfo = contractData.NFT[collectionName];
    const { storagePath, publicPath, collectionPublic, networks } = collectionInfo;
    collectionSetups += `
    if signer.borrow<&${collectionName}.Collection>(from: /storage/${storagePath}) == nil {
      signer.save(<- ${collectionName}.createEmptyCollection(), to: /storage/${storagePath})
    }
    if signer.getCapability<&${collectionName}.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection${collectionPublic ? `, ${collectionName}.${collectionPublic}` : ''}}>(/public/${publicPath}).borrow() == nil {
        signer.unlink(/public/${publicPath})
        signer.link<&${collectionName}.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection${collectionPublic ? `, ${collectionName}.${collectionPublic}` : ''}}>(/public/${publicPath}, target: /storage/${storagePath})
    }
    `;
    imports += `import ${collectionName} from ${networks[currentNetwork]}\n`
  }

  let vaultSetups = '';
  for (const vaultName in geeft.vaults) {
    const vaultInfo = contractData.Token[vaultName];
    const { storagePath, balancePath, receiverPath, networks } = vaultInfo;
    vaultSetups += `
    if signer.borrow<&${vaultName}.Vault>(from: /storage/${storagePath}) == nil {
      signer.save(<- ${vaultName}.createEmptyVault(), to: /storage/${storagePath})
    }
    if signer.getCapability<&${vaultName}.Vault{FungibleToken.Receiver}>(/public/${receiverPath}).borrow() == nil {
        signer.unlink(/public/${receiverPath})
        signer.link<&${vaultName}.Vault{FungibleToken.Receiver}>(/public/${receiverPath}, target: /storage/${storagePath})
    }
    if signer.getCapability<&${vaultName}.Vault{FungibleToken.Balance}>(/public/${balancePath}).borrow() == nil {
      signer.unlink(/public/${balancePath})
      signer.link<&${vaultName}.Vault{FungibleToken.Balance}>(/public/${balancePath}, target: /storage/${storagePath})
    }
    `;
    imports += `import ${vaultName} from ${networks[get(network)]}\n`
  };

  openGiftStatus.set({ success: false, inProgress: true });

  try {
    const transactionId = await fcl.mutate({
      cadence: replaceWithProperValues(openGeeftTx).replace("// INSERT COLLECTIONS HERE", collectionSetups).replace("// INSERT VAULTS HERE", vaultSetups).replace("// INSERT IMPORTS HERE", imports),
      args: (arg, t) => [
        arg(geeft.id, t.UInt64)
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999,
    });

    txId.set(transactionId);

    fcl.tx(transactionId).subscribe((res) => {
      transactionStatus.set(res.status);
      console.log(res);
      if (res.status === 4) {
        if (res.statusCode === 0) {
          openGiftStatus.set({ success: true, inProgress: false });
        } else {
          openGiftStatus.set({ success: false, inProgress: false, error: translateError(res.errorMessage) });
        }
        setTimeout(() => transactionInProgress.set(false), 2000);
      }
    });
  } catch (e) {
    console.log(e);
    transactionStatus.set(99);
    openGiftStatus.set({ success: false, inProgress: false, error: translateError(e) });
  }
}

// ****** Scripts ****** //

export const discover = async (address) => {
  if (!address) return {};

  const vaults = contractData.Token;
  const vaultInfos = [];
  for (const vaultName in vaults) {
    const vaultInfo = vaults[vaultName];
    vaultInfos.push({ key: vaultName, value: vaultInfo.balancePath });
  }

  try {
    const response = await fcl.query({
      cadence: replaceWithProperValues(discoverScript),
      args: (arg, t) => [
        arg(address, t.Address),
        arg(vaultInfos, t.Dictionary({ key: t.String, value: t.String }))
      ],
    });

    console.log(response);

    return response;
  } catch (e) {
    console.log(e);
  }
};

export const readGeefts = async (address) => {

  try {
    const response = await fcl.query({
      cadence: replaceWithProperValues(readGeeftsScript),
      args: (arg, t) => [
        arg(address, t.Address)
      ],
    });

    return response;
  } catch (e) {
    console.log(e);
  }
};

export const readGeeftInfo = async (address, geeftId) => {
  try {
    const response = await fcl.query({
      cadence: replaceWithProperValues(readGeeftInfoScript),
      args: (arg, t) => [
        arg(address, t.Address),
        arg(geeftId, t.UInt64)
      ],
    });

    console.log(response);
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const areSetup = async (address) => {
  try {
    const response = await fcl.query({
      cadence: replaceWithProperValues(areSetupScript),
      args: (arg, t) => [
        arg(address, t.Address)
      ],
    });

    console.log(response);
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const getImports = async (contractNames) => {
  try {
    const response = await fcl.query({
      cadence: replaceWithProperValues(getImportsScript),
      args: (arg, t) => [
        arg(contractNames, t.Array(t.String))
      ],
    });

    console.log(response);
    return response;
  } catch (e) {
    console.log(e);
  }
}