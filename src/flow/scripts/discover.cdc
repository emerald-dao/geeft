import MetadataViews from "../contracts/utilities/MetadataViews.cdc"

pub fun main(user: Address, nftInfos: {String: [String]}): {String: {UInt64: MetadataViews.Display?}} {
  var nfts: {String: {UInt64: MetadataViews.Display?}} = {}
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

    nfts[nft] = structs
  }

  return nfts
}