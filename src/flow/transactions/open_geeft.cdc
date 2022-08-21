import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"
import Geeft from "../contracts/Geeft.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"
import FungibleToken from "../contracts/utilities/FungibleToken.cdc"
import NFTCatalog from "../contracts/utilities/NFTCatalog.cdc"

// INSERT IMPORTS HERE

transaction(id: UInt64, collectionNames: [String]) {
  prepare(signer: AuthAccount) {
    let GeeftCollection = signer.borrow<&Geeft.Collection>(from: Geeft.CollectionStoragePath)
                            ?? panic("The signer does not have a Geeft Collection set up.")

    /*** Collection Setups ***/
    let catalog: {String: NFTCatalog.NFTCatalogMetadata} = NFTCatalog.getCatalog()

    // INSERT COLLECTIONS HERE
    for collectionName in collectionNames {
      let collectionMetadata: NFTCatalog.NFTCatalogMetadata = catalog[collectionName]!
      if signer.borrow<&NonFungibleToken.Collection>(from: collectionMetadata.collectionData.storagePath) == nil {
        signer.save(<- collectionMetadata.createEmptyCollection(), to: collectionMetadata.collectionData.storagePat)
      }
      if signer.getCapability<collectionMetadata.collectionData.publicLinkedType>(/public/publicPath).borrow() == nil {
          signer.unlink(/public/publicPath)
          signer.link<collectionMetadata.collectionData.publicLinkedType>(/public/publicPath, target: /storage/storagePath)
      }
    }

    /*** Vault Setups ***/

    // INSERT VAULTS HERE
    
    GeeftCollection.openGeeft(id: id)

    /*** We're done ***/
  }

  execute {

  }
}