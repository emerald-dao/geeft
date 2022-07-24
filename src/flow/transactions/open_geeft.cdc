import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"
import Geeft from "../contracts/Geeft.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"
// INSERT IMPORTS HERE

transaction(id: UInt64) {
  prepare(signer: AuthAccount) {
    let GeeftCollection = signer.borrow<&Geeft.Collection>(from: Geeft.CollectionStoragePath)
                            ?? panic("The signer does not have a Geeft Collection set up.")
    
    let geeft: @Geeft.NFT <- GeeftCollection.withdraw(withdrawID: id) as! @Geeft.NFT
    let nfts <- geeft.openNFTs()

    /*** Collections ***/

    // INSERT COLLECTIONS HERE

    assert(nfts.keys.length == 0, message: "There are still NFTs left in the Geeft.")
    destroy nfts

    /*** Vaults ***/
    
    let tokens <- geeft.openTokens()

    assert(tokens.length == 0, message: "There are still tokens left in the Geeft.")
    destroy tokens

    /*** We're done ***/
    destroy geeft
  }

  execute {

  }
}