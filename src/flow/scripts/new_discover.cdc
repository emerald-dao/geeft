import NFTCatalog from "../contracts/utilities/NFTCatalog.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"
import FLOAT from "../contracts/projects/FLOAT/FLOAT.cdc"
import FungibleToken from "../contracts/utilities/FungibleToken.cdc"

pub fun main(user: Address, vaultInfos: {String: String}): Discovery {
  let acct = getAuthAccount(user)

  var collections: {String: Collection} = {}
  let catalog: {String: NFTCatalog.NFTCatalogMetadata} = NFTCatalog.getCatalog()

  for collectionName in catalog.keys {
    let collectionMetadata: NFTCatalog.NFTCatalogMetadata = catalog[collectionName]!
    let publicPath: PublicPath = collectionMetadata.collectionData.publicPath
    let storagePath: StoragePath = collectionMetadata.collectionData.storagePath
    let structs: {UInt64: MetadataViews.Display?} = {}

    acct.unlink(publicPath)
    
    if Type<@FLOAT.NFT>() == collectionMetadata.nftType {
      acct.link<&{MetadataViews.ResolverCollection, FLOAT.CollectionPublic}>(publicPath, target: storagePath)
      if let collection = acct.getCapability(publicPath).borrow<&{MetadataViews.ResolverCollection, FLOAT.CollectionPublic}>() {
        for id in collection.getIDs() {
          if collection.borrowFLOAT(id: id)!.getEventMetadata()?.transferrable == true {
            let viewResolver: &{MetadataViews.Resolver} = collection.borrowViewResolver(id: id)
            structs[id] = MetadataViews.getDisplay(viewResolver)
          }
        }
      }
    } else {
      acct.link<&{MetadataViews.ResolverCollection}>(publicPath, target: storagePath)
      if let collection = acct.getCapability(publicPath).borrow<&{MetadataViews.ResolverCollection}>() {
        for id in collection.getIDs() {
          let viewResolver: &{MetadataViews.Resolver} = collection.borrowViewResolver(id: id)
          structs[id] = MetadataViews.getDisplay(viewResolver)
        }
      }
    }

    if structs.length > 0 {
      collections[collectionName] = Collection(_image: collectionMetadata.collectionDisplay.squareImage.file, _nfts: structs)
    }
  }

  var vaults: {String: UFix64} = {}

  for token in vaultInfos.keys {
    let publicPath: PublicPath = PublicPath(identifier: vaultInfos[token]!)!
    let vault = acct.getCapability(publicPath).borrow<&{FungibleToken.Balance}>()!
    vaults[token] = vault.balance
  }

  return Discovery(_collections: collections, _vaults: vaults)
}

pub struct Discovery {
  pub let collections: {String: Collection}
  pub let vaults: {String: UFix64}

  init(_collections: {String: Collection}, _vaults: {String: UFix64}) {
    self.collections = _collections
    self.vaults = _vaults
  }
}

pub struct Collection {
  pub let image: AnyStruct{MetadataViews.File}
  pub let nfts: {UInt64: MetadataViews.Display?}

  init(_image: AnyStruct{MetadataViews.File}, _nfts: {UInt64: MetadataViews.Display?}) {
    self.image = _image
    self.nfts = _nfts
  }
}