import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"
import Geeft from "../contracts/Geeft.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"

transaction() {
  prepare(signer: AuthAccount) {
    if signer.borrow<&Geeft.Collection>(from: Geeft.CollectionStoragePath) == nil {
      signer.save(<- Geeft.createEmptyCollection(), to: Geeft.CollectionStoragePath)
      signer.link<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>(Geeft.CollectionPublicPath, target: Geeft.CollectionStoragePath)
    }
    if signer.getCapability(Geeft.CollectionPublicPath).borrow<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>() == nil {
      signer.unlink(Geeft.CollectionPublicPath)
      signer.link<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>(Geeft.CollectionPublicPath, target: Geeft.CollectionStoragePath)
    }
  }

  execute {

  }
}