import { browser } from '$app/env';
import { get } from 'svelte/store';

import * as fcl from '@onflow/fcl';
import './config';

import { user, transactionStatus, transactionInProgress, addresses, network, txId } from './stores';
import { contractData } from './contractData';

///////////////
// Cadence code 
///////////////
// Scripts
import discoverScript from "./scripts/discover.cdc?raw";
import readGeeftsScript from "./scripts/read_geefts.cdc?raw";
import readGeeftInfoScript from "./scripts/geeft_info.cdc?raw";
// Transactions
import setupTx from "./transactions/setup.cdc?raw";
import createGeeftTx from "./transactions/create_geeft.cdc?raw";
import openGeeftTx from "./transactions/open_geeft.cdc?raw";
import { message, recipient, selected } from '$lib/stores/CreationStore';

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
    .replace('"../contracts/projects/ExampleNFT/ExampleNFT.cdc"', addressList.ExampleNFT)
    .replace('"../contracts/utilities/FungibleToken.cdc"', addressList.FungibleToken)
}

// ****** Transactions ****** //

export const setup = async () => {

  initTransactionState();

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
    fcl.tx(transactionId).subscribe((res) => {
      transactionStatus.set(res.status);
      console.log(res);
      if (res.status === 4) {
        setTimeout(() => transactionInProgress.set(false), 2000);
      }
    });
  } catch (e) {
    console.log(e);
    transactionStatus.set(99);
  }
}

export const createGeeft = async () => {
  console.log("Hello")
  console.log(get(selected))

  initTransactionState();

  const selectedStore = get(selected);
  let firstArg = [];
  let secondArg = [];
  for (const collectionName in selectedStore) {
    firstArg.push({ key: collectionName, value: selectedStore[collectionName] })
    secondArg.push({ key: collectionName, value: contractData.NFT[collectionName].storagePath })
  }

  try {
    const transactionId = await fcl.mutate({
      cadence: replaceWithProperValues(createGeeftTx),
      args: (arg, t) => [
        arg(firstArg, t.Dictionary({ key: t.String, value: t.Array(t.UInt64) })),
        arg(secondArg, t.Dictionary({ key: t.String, value: t.String })),
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
        setTimeout(() => transactionInProgress.set(false), 2000);
      }
    });
  } catch (e) {
    console.log(e);
    transactionStatus.set(99);
  }
}

export const openGeeft = async (geeft) => {

  initTransactionState();

  // TODO
  // Get list of NFTs here from script
  const collections = Object.keys(geeft.nfts);

  // TODO
  // Get imports from the collections that are in it
  let imports = '';
  let additions = '';

  // Collection 1
  for (var i = 0; i < collections.length; i++) {
    const collectionName = collections[i];
    const collectionInfo = contractData.NFT[collectionName];
    console.log(collectionInfo)
    const { storagePath, publicPath, collectionPublic, networks } = collectionInfo;
    additions += `
    if signer.borrow<&${collectionName}.Collection>(from: /storage/${storagePath}) == nil {
      signer.save(<- Geeft.createEmptyCollection(), to: /storage/${storagePath})
    }
    if signer.getCapability<&${collectionName}.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection, ${collectionName}.${collectionPublic}}>(/public/${publicPath}).borrow() == nil {
        signer.unlink(/public/${publicPath})
        signer.link<&${collectionName}.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection, ${collectionName}.${collectionPublic}}>(/public/${publicPath}, target: /storage/${storagePath})
    }
    let ${collectionName}Collection = signer.borrow<&${collectionName}.Collection>(from: /storage/${storagePath})!
    let ${collectionName}CollectionNFTs: @[NonFungibleToken.NFT] <- nfts.remove(key: "${collectionName}") ?? panic("${collectionName} does not exist in here.")
    while ${collectionName}CollectionNFTs.length > 0 {
      ${collectionName}Collection.deposit(token: <- ${collectionName}CollectionNFTs.removeFirst())
    }
    log(${collectionName}CollectionNFTs.length)
    // assert(${collectionName}CollectionNFTs.length == 0, message: "Did not empty out ${collectionName}")
    destroy ${collectionName}CollectionNFTs\n
    `;
    imports += `import ${collectionName} from ${networks[get(network)]}\n`
  }

  console.log(replaceWithProperValues(openGeeftTx).replace("// INSERT COLLECTIONS HERE", additions).replace("// INSERT IMPORTS HERE", imports))

  try {
    const transactionId = await fcl.mutate({
      cadence: replaceWithProperValues(openGeeftTx).replace("// INSERT COLLECTIONS HERE", additions).replace("// INSERT IMPORTS HERE", imports),
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
        setTimeout(() => transactionInProgress.set(false), 2000);
      }
    });
  } catch (e) {
    console.log(e);
    transactionStatus.set(99);
  }
}

// ****** Scripts ****** //

export const discover = async (address) => {
  if (!address) return {};
  const nfts = Object.keys(contractData.NFT);
  const nftInfos = [];
  for (var i = 0; i < nfts.length; i++) {
    const nftName = nfts[i];
    const nftInfo = contractData.NFT[nftName];
    nftInfos.push({ key: nftName, value: [nftInfo.publicPath, nftInfo.storagePath] });
  }
  console.log(nftInfos)

  try {
    const response = await fcl.query({
      cadence: replaceWithProperValues(discoverScript),
      args: (arg, t) => [
        arg(address, t.Address),
        arg(nftInfos, t.Dictionary({ key: t.String, value: t.Array(t.String) }))
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

    console.log(response);
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const readGeeftInfo = async () => {
  try {
    const response = await fcl.query({
      cadence: replaceWithProperValues(readGeeftInfoScript),
      args: (arg, t) => [
        arg("0xf8d6e0586b0a20c7", t.Address),
        arg('35', t.UInt64)
      ],
    });

    console.log(response);
    return response;
  } catch (e) {
    console.log(e);
  }
};

// Function to upload metadata to the contract in batches of 500
export async function uploadMetadataToContract(contractName, metadatas, batchSize) {
  const userAddr = get(user).addr;
  // Get The MetadataId we should start at
  let names = [];
  let descriptions = [];
  let thumbnails = [];
  let extras = [];
  for (var i = 0; i < metadatas.length; i++) {
    const { name, description, image, ...rest } = metadatas[i];
    names.push(name);
    descriptions.push(description);
    thumbnails.push(image);
    let extra = [];
    for (const attribute in rest) {
      extra.push({ key: attribute, value: rest[attribute] });
    }
    extras.push(extra);
  }

  console.log('Uploading ' + batchSize + ' NFTs to the contract.')

  const transaction = replaceWithProperValues(createMetadatasTx, contractName, userAddr)
    .replaceAll('500', batchSize);

  initTransactionState();

  try {
    const transactionId = await fcl.mutate({
      cadence: transaction,
      args: (arg, t) => [
        arg(names, t.Array(t.String)),
        arg(descriptions, t.Array(t.String)),
        arg(thumbnails, t.Array(t.String)),
        arg(extras, t.Array(t.Dictionary({ key: t.String, value: t.String })))
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999,
    });

    fcl.tx(transactionId).subscribe((res) => {
      transactionStatus.set(res.status);
      console.log(res);
      if (res.status === 4) {
        setTimeout(() => transactionInProgress.set(false), 2000);
      }
    });

    const { status, statusCode, errorMessage } = await fcl.tx(transactionId).onceSealed();
    if (status === 4 && statusCode === 0) {
      return { success: true };
    }
    return { success: false, error: errorMessage };
  } catch (e) {
    console.log(e);
    transactionStatus.set(99);
    return { success: false, error: e }
  }
}
