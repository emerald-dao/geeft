import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"
import FungibleToken from "../contracts/utilities/FungibleToken.cdc"
import Geeft from "../contracts/Geeft.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"

/* ids
{
  "FLOAT": [1, 2, 3],
  "Flovatar: [1, 2, 3]
}
*/

/* storagePaths
{
  "FLOAT": "FLOATCollectionStoragePath",
  "Flovatar": "FlovatarCollection"
}
*/

transaction(
  ids: {String: [UInt64]}, 
  storagePaths: {String: String}, 
  message: String?, 
  extra: {String: String},
  recipient: Address
) {
  prepare(signer: AuthAccount) {
    if signer.borrow<&Geeft.Collection>(from: Geeft.CollectionStoragePath) == nil {
      signer.save(<- Geeft.createEmptyCollection(), to: Geeft.CollectionStoragePath)
      signer.link<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>(Geeft.CollectionPublicPath, target: Geeft.CollectionStoragePath)
    }
    let preparedNFTs: @{String: [NonFungibleToken.NFT]} <- {}
    for collectionName in ids.keys {
      let batch: @[NonFungibleToken.NFT] <- []
      let collection = signer.borrow<&{NonFungibleToken.Provider}>(from: StoragePath(identifier: storagePaths[collectionName]!)!)!
      let cType: Type = collection.getType()
      for id in ids[collectionName]! {
        batch.append(<- collection.withdraw(withdrawID: id))
      }
      preparedNFTs[collectionName] <-! batch
    }

    let preparedTokens: @{String: FungibleToken.Vault} <- {}

    Geeft.sendGeeft(message: message, nfts: <- preparedNFTs, tokens: <- preparedTokens, extra: extra, recipient: recipient)
  }

  execute {

  }
}