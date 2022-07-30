import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"
import FungibleToken from "../contracts/utilities/FungibleToken.cdc"
import Geeft from "../contracts/Geeft.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"
// INSERT IMPORTS HERE

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
  publicPaths: {String: PublicPath},
  storagePaths: {String: StoragePath}, 
  // NFTs
  ids: {String: [UInt64]}, 
  // Vaults
  amounts: {String: UFix64},
  message: String?, 
  extra: {String: String},
  recipient: Address
) {
  prepare(signer: AuthAccount) {
    if signer.borrow<&Geeft.Collection>(from: Geeft.CollectionStoragePath) == nil {
      signer.save(<- Geeft.createEmptyCollection(), to: Geeft.CollectionStoragePath)
      signer.link<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>(Geeft.CollectionPublicPath, target: Geeft.CollectionStoragePath)
    }
    if signer.getCapability(Geeft.CollectionPublicPath).borrow<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>() == nil {
      signer.unlink(Geeft.CollectionPublicPath)
      signer.link<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>(Geeft.CollectionPublicPath, target: Geeft.CollectionStoragePath)
    }

    // Prepare NFTs

    let preparedNFTs: @{String: Geeft.CollectionContainer} <- {}

    // INSERT COLLECTIONS HERE

    // Prepare Tokens

    let preparedTokens: @{String: Geeft.VaultContainer} <- {}
    for vaultName in amounts.keys {
      let vault = signer.borrow<&{FungibleToken.Provider}>(from: storagePaths[vaultName]!)!
      let batch <- Geeft.createVaultContainer(receiverPath: publicPaths[vaultName]!, storagePath: storagePaths[vaultName]!, assets: <- vault.withdraw(amount: amounts[vaultName]!), to: recipient)
      preparedTokens[vaultName] <-! batch
    }

    Geeft.sendGeeft(createdBy: signer.address, message: message, collections: <- preparedNFTs, vaults: <- preparedTokens, extra: extra, recipient: recipient)
  }

  execute {

  }
}