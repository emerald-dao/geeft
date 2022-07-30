import Geeft from "../contracts/Geeft.cdc"
import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"

pub fun main(user: Address): Bool {
  return getAccount(user).getCapability(Geeft.CollectionPublicPath)
            .borrow<&Geeft.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection, Geeft.CollectionPublic}>() != nil
}