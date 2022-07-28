import Geeft from "../contracts/Geeft.cdc"
import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"
import MetadataViews from "../contracts/utilities/MetadataViews.cdc"
import FungibleToken from "../contracts/utilities/FungibleToken.cdc"

// INSERT IMPORTS HERE

pub fun main(user: Address, id: UInt64): GeeftContent {
  let acct = getAuthAccount(user)
  let GeeftCollection = acct.borrow<&Geeft.Collection>(from: Geeft.CollectionStoragePath)
                            ?? panic("The user does not have a Geeft Collection set up.")
  let geeft: &Geeft.NFT = GeeftCollection.borrowGeeft(id: id) ?? panic("This Geeft does not exist in this collection.")

  let nfts: @{String: [NonFungibleToken.NFT]} <- geeft.openNFTs()
  let answerNFTs: {String: [MetadataViews.Display?]} = {}

  // INSERT COLLECTIONS HERE

  acct.save(<- nfts, to: /storage/SomeRandomGeeftThingWOOOOOOOOOOO)

  let tokens: @{String: FungibleToken.Vault} <- geeft.openTokens()
  let answerTokens: {String: UFix64} = {}

  for vaultName in tokens.keys {
    answerTokens[vaultName] = tokens[vaultName]?.balance!
  }

  destroy tokens

  return GeeftContent(_nfts: answerNFTs, _tokens: answerTokens)
}

pub struct GeeftContent {
  pub let nfts: {String: [MetadataViews.Display?]}
  pub let tokens: {String: UFix64}

  init(_nfts: {String: [MetadataViews.Display?]}, _tokens: {String: UFix64}) {
    self.nfts = _nfts 
    self.tokens = _tokens
  }
}