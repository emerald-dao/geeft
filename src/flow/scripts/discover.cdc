import MetadataViews from "../contracts/utilities/MetadataViews.cdc"
import FungibleToken from "../contracts/utilities/FungibleToken.cdc"

pub fun main(user: Address, nftInfos: {String: [String]}, vaultInfos: {String: String}): Discovery {
  var collections: {String: {UInt64: MetadataViews.Display?}} = {}
  let acct = getAuthAccount(user)

  for nft in nftInfos.keys {
    let publicPath = nftInfos[nft]![0]
    let storagePath = nftInfos[nft]![1]
    let tempPublicPath: PublicPath = PublicPath(identifier: "Geeft".concat(publicPath))!
    acct.link<&{MetadataViews.ResolverCollection}>(tempPublicPath, target: StoragePath(identifier: storagePath)!)

    let structs: {UInt64: MetadataViews.Display?} = {}
    if let collection = acct.getCapability(tempPublicPath).borrow<&{MetadataViews.ResolverCollection}>() {
      for id in collection.getIDs() {
        let viewResolver: &{MetadataViews.Resolver} = collection.borrowViewResolver(id: id)
        structs[id] = MetadataViews.getDisplay(viewResolver)
      }
    }

    collections[nft] = structs
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
  pub let collections: {String: {UInt64: MetadataViews.Display?}}
  pub let vaults: {String: UFix64}

  init(_collections: {String: {UInt64: MetadataViews.Display?}}, _vaults: {String: UFix64}) {
    self.collections = _collections
    self.vaults = _vaults
  }
}