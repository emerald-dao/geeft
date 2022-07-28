import { browser } from '$app/env';
import { get } from 'svelte/store';

import * as fcl from '@onflow/fcl';
import './config';

import { user, transactionStatus, transactionInProgress, addresses, network, txId, openGiftStatus } from './stores';
import { contractData } from './contractData';

///////////////
// Cadence code 
///////////////
// Scripts
import discoverScript from "./scripts/discover.cdc?raw";
import readGeeftsScript from "./scripts/read_geefts.cdc?raw";
import readGeeftInfoScript from "./scripts/geeft_info.cdc?raw";
import readGeeftContentsScript from "./scripts/geeft_contents.cdc?raw";
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
  console.log(addressList)
  return script
    .replace('"../contracts/Geeft.cdc"', addressList.Geeft)
    .replace('"../contracts/utilities/MetadataViews.cdc"', addressList.MetadataViews)
    .replace('"../contracts/utilities/NonFungibleToken.cdc"', addressList.NonFungibleToken)
    .replace('"../contracts/projects/ExampleNFT/ExampleNFT.cdc"', addressList.ExampleNFT)
    .replace('"../contracts/utilities/FungibleToken.cdc"', addressList.FungibleToken)
    .replace('"../contracts/projects/FLOAT/FLOAT.cdc"', addressList.FLOAT)
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

  initTransactionState();

  let storagePaths = [];

  const selectedNFTsStore = get(selectedNFTs);
  let collectionIds = [];
  for (const collectionName in selectedNFTsStore) {
    collectionIds.push({ key: collectionName, value: selectedNFTsStore[collectionName] });
    storagePaths.push({ key: collectionName, value: contractData.NFT[collectionName].storagePath });
  }

  const selectedVaultsStore = get(selectedVaults);
  let vaultAmounts = [];
  for (const vaultName in selectedVaultsStore) {
    vaultAmounts.push({ key: vaultName, value: parseFloat(selectedVaultsStore[vaultName]).toFixed(2) });
    storagePaths.push({ key: vaultName, value: contractData.Token[vaultName].storagePath });
  }
  console.log(vaultAmounts)


  try {
    const transactionId = await fcl.mutate({
      cadence: replaceWithProperValues(createGeeftTx),
      args: (arg, t) => [
        arg(storagePaths, t.Dictionary({ key: t.String, value: t.String })),
        arg(collectionIds, t.Dictionary({ key: t.String, value: t.Array(t.UInt64) })),
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

  console.log(geeft);

  // TODO
  // Get imports from the collections that are in it
  let imports = '';
  let collectionAdditions = '';
  const currentNetwork = get(network);

  for (const collectionName in geeft.nfts) {
    const collectionInfo = contractData.NFT[collectionName];
    const { storagePath, publicPath, collectionPublic, networks } = collectionInfo;
    collectionAdditions += `
    if signer.borrow<&${collectionName}.Collection>(from: /storage/${storagePath}) == nil {
      signer.save(<- ${collectionName}.createEmptyCollection(), to: /storage/${storagePath})
    }
    if signer.getCapability<&${collectionName}.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection${collectionPublic ? `, ${collectionName}.${collectionPublic}` : null}}>(/public/${publicPath}).borrow() == nil {
        signer.unlink(/public/${publicPath})
        signer.link<&${collectionName}.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection${collectionPublic ? `, ${collectionName}.${collectionPublic}` : null}}>(/public/${publicPath}, target: /storage/${storagePath})
    }
    let ${collectionName}Collection = signer.borrow<&${collectionName}.Collection>(from: /storage/${storagePath})!
    let ${collectionName}CollectionNFTs: @[NonFungibleToken.NFT] <- nfts.remove(key: "${collectionName}") ?? panic("${collectionName} does not exist in here.")
    while ${collectionName}CollectionNFTs.length > 0 {
      ${collectionName}Collection.deposit(token: <- ${collectionName}CollectionNFTs.removeFirst())
    }
    assert(${collectionName}CollectionNFTs.length == 0, message: "Did not empty out ${collectionName}")
    destroy ${collectionName}CollectionNFTs\n
    `;
    imports += `import ${collectionName} from ${networks[currentNetwork]}\n`
  }

  let vaultAdditions = '';
  geeft.tokens.forEach(vaultName => {
    const vaultInfo = contractData.Token[vaultName];
    const { storagePath, balancePath, receiverPath, networks } = vaultInfo;
    vaultAdditions += `
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
    let ${vaultName}Vault = signer.borrow<&${vaultName}.Vault>(from: /storage/${storagePath})!
    let ${vaultName}Tokens: @FungibleToken.Vault <- tokens.remove(key: "${vaultName}") ?? panic("${vaultName} does not exist in here.")
    ${vaultName}Vault.deposit(from: <- ${vaultName}Tokens)\n
    `;
    imports += `import ${vaultName} from ${networks[get(network)]}\n`
  });

  try {
    const transactionId = await fcl.mutate({
      cadence: replaceWithProperValues(openGeeftTx).replace("// INSERT COLLECTIONS HERE", collectionAdditions).replace("// INSERT VAULTS HERE", vaultAdditions).replace("// INSERT IMPORTS HERE", imports),
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
          openGiftStatus.set({ success: true });
        } else {
          openGiftStatus.set({ success: false });
        }
        setTimeout(() => transactionInProgress.set(false), 2000);
      }
    });
  } catch (e) {
    console.log(e);
    transactionStatus.set(99);
    openGiftStatus.set({ success: false });
  }
}

// ****** Scripts ****** //

export const discover = async (address) => {
  if (!address) return {};
  const collections = contractData.NFT;
  const collectionInfos = [];
  for (const collectionName in collections) {
    const collectionInfo = collections[collectionName];
    collectionInfos.push({ key: collectionName, value: [collectionInfo.publicPath, collectionInfo.storagePath] });
  }

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
        arg(collectionInfos, t.Dictionary({ key: t.String, value: t.Array(t.String) })),
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

export const readGeeftContents = async (address, geeftId) => {
  try {
    console.log("Hey")
    const { nfts } = await readGeeftInfo(address, geeftId);

    let collectionAdditions = '';
    let collectionImports = '';
    for (const collectionName in nfts) {
      const { networks } = contractData.NFT[collectionName];
      collectionAdditions += `
      answerNFTs["${collectionName}"] = []
      let ${collectionName}NFTs: @[NonFungibleToken.NFT] <- nfts.remove(key: "${collectionName}")!

      while ${collectionName}NFTs.length > 0 {
        let nft <- ${collectionName}NFTs.removeFirst()
        let specificNFT <- nft as! @${collectionName}.NFT
        let resolver = &specificNFT as &{MetadataViews.Resolver}
        answerNFTs["${collectionName}"]!.append(MetadataViews.getDisplay(resolver))
        destroy specificNFT
      }
      destroy ${collectionName}NFTs\n
      `;
      collectionImports += `import ${collectionName} from ${networks[get(network)]}\n`
    }

    console.log(replaceWithProperValues(readGeeftContentsScript).replace('// INSERT COLLECTIONS HERE', collectionAdditions).replace('// INSERT IMPORTS HERE', collectionImports))

    const response = await fcl.query({
      cadence: replaceWithProperValues(readGeeftContentsScript).replace('// INSERT COLLECTIONS HERE', collectionAdditions).replace('// INSERT IMPORTS HERE', collectionImports),
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
}