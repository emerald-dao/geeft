import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"
import Geeft from "../contracts/Geeft.cdc"
import ExampleNFT from "../contracts/projects/ExampleNFT/ExampleNFT.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"

transaction() {
  prepare(signer: AuthAccount) {
    // if signer.borrow<&Geeft.Collection>(from: Geeft.CollectionStoragePath) == nil {
    //   signer.save(<- Geeft.createEmptyCollection(), to: Geeft.CollectionStoragePath)
    //   signer.link<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>(Geeft.CollectionPublicPath, target: Geeft.CollectionStoragePath)
    // }
    // if signer.getCapability(Geeft.CollectionPublicPath).borrow<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>() == nil {
    //   signer.unlink(Geeft.CollectionPublicPath)
    //   signer.link<&Geeft.Collection{MetadataViews.ResolverCollection, Geeft.CollectionPublic, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic}>(Geeft.CollectionPublicPath, target: Geeft.CollectionStoragePath)
    // }

    // let admin <- ExampleNFT.createMinter()
    // let nft1 <- admin.mintNFT(name: "Jacob #1", description: "Jacob #1 Description", thumbnail: "")
    // let nft2 <- admin.mintNFT(name: "Jacob #2", description: "Jacob #2 Description", thumbnail: "")
    // let nft3 <- admin.mintNFT(name: "Jacob #3", description: "Jacob #3 Description", thumbnail: "")
    // destroy admin 
    
    // let collection <- ExampleNFT.createEmptyCollection()
    // collection.deposit(token: <- nft1)
    // collection.deposit(token: <- nft2)
    // collection.deposit(token: <- nft3)

    // signer.save(<- collection, to: /storage/ExampleNFTCollection)
    // signer.link<&ExampleNFT.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(/public/ExampleNFTCollection, target: /storage/ExampleNFTCollection)

  }

  execute {

  }
}