import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"
import Geeft from "../contracts/Geeft.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"
import FungibleToken from "../contracts/utilities/FungibleToken.cdc"

// INSERT IMPORTS HERE

transaction(id: UInt64) {
  prepare(signer: AuthAccount) {
    let GeeftCollection = signer.borrow<&Geeft.Collection>(from: Geeft.CollectionStoragePath)
                            ?? panic("The signer does not have a Geeft Collection set up.")

    /*** Collection Setups ***/

    // INSERT COLLECTIONS HERE

    /*** Vault Setups ***/

    // INSERT VAULTS HERE
    
    GeeftCollection.openGeeft(id: id)

    /*** We're done ***/
  }

  execute {

  }
}