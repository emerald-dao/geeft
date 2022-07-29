import NonFungibleToken from "./utilities/NonFungibleToken.cdc"
import FungibleToken from "./utilities/FungibleToken.cdc"
import MetadataViews from "./utilities/MetadataViews.cdc"

pub contract Geeft: NonFungibleToken {

  pub var totalSupply: UInt64

  // Paths
  pub let CollectionPublicPath: PublicPath
  pub let CollectionStoragePath: StoragePath

  // Standard Events
  pub event ContractInitialized()
  pub event Withdraw(id: UInt64, from: Address?)
  pub event Deposit(id: UInt64, to: Address?)

  // Geeft Events
  pub event GeeftCreated(id: UInt64, message: String?, from: Address?, to: Address)
  pub event GeeftOpened(id: UInt64, by: Address)

  pub struct GeeftInfo {
    pub let id: UInt64
    pub let from: Address?
    pub let message: String?
    pub let collections: {String: [MetadataViews.Display?]}
    pub let vaults: {String: UFix64?}
    pub let extra: {String: AnyStruct}

    init(id: UInt64, from: Address?, message: String?, collections: {String: [MetadataViews.Display?]}, vaults: {String: UFix64?}, extra: {String: AnyStruct}) {
      self.id = id
      self.from = from
      self.message = message
      self.collections = collections
      self.vaults = vaults
      self.extra = extra
    }
  }

  pub resource CollectionContainer {
    pub let publicPath: PublicPath
    pub let storagePath: StoragePath
    pub let assets: @[{MetadataViews.Resolver}]
    pub let cap: Capability<&{NonFungibleToken.Receiver}>

    init(
      publicPath: PublicPath,
      storagePath: StoragePath,
      assets: @[{MetadataViews.Resolver}],
      to: Address
    ) {
      self.publicPath = publicPath
      self.storagePath = storagePath
      self.assets <- assets
      self.cap = getAccount(to).getCapability<&{NonFungibleToken.Receiver}>(publicPath)
    }

    pub fun send() {
      let collection = self.cap.borrow() ?? panic("The recipient has not setup their Collection yet.")
      while self.assets.length > 0 {
        collection.deposit(token: <- (self.assets.removeFirst() as! @NonFungibleToken.NFT))
      }
    }

    pub fun getDisplays(): [MetadataViews.Display?] {
      var i = 0
      let answer: [MetadataViews.Display?] = []
      while i < self.assets.length {
        let viewResolver = &self.assets[i] as &{MetadataViews.Resolver}
        answer.append(MetadataViews.getDisplay(viewResolver))
        i = i + 1
      }

      return answer
    }

    destroy () {
      destroy self.assets
    }
  }

  pub resource VaultContainer {
    pub let receiverPath: PublicPath
    pub let storagePath: StoragePath
    pub var assets: @FungibleToken.Vault?
    pub let cap: Capability<&{FungibleToken.Receiver}>

    init(
      receiverPath: PublicPath,
      storagePath: StoragePath,
      assets: @FungibleToken.Vault,
      to: Address
    ) {
      self.receiverPath = receiverPath
      self.storagePath = storagePath
      self.assets <- assets
      self.cap = getAccount(to).getCapability<&{FungibleToken.Receiver}>(receiverPath)
    }

    pub fun send() {
      let vault = self.cap.borrow() ?? panic("The recipient has not setup their Vault yet.")
      var assets: @FungibleToken.Vault? <- nil
      self.assets <-> assets
      vault.deposit(from: <- assets!)
    }

    pub fun getBalance(): UFix64? {
      return self.assets?.balance
    }

    destroy () {
      destroy self.assets
    }
  }

  // This represents a Geeft
  pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
    pub let id: UInt64
    pub let from: Address?
    pub let message: String?
    // ex. "FLOAT" -> A bunch of FLOATs and associated information
    pub var storedCollections: @{String: CollectionContainer}
    // ex. "FlowToken" -> Stored $FLOW and associated information
    pub var storedVaults: @{String: VaultContainer}
    pub let extra: {String: AnyStruct}

    pub fun getGeeftInfo(): GeeftInfo {
      let collections: {String: [MetadataViews.Display?]} = {}
      for collectionName in self.storedCollections.keys {
        collections[collectionName] = self.storedCollections[collectionName]?.getDisplays()
      }

      let vaults: {String: UFix64?} = {}
      for vaultName in self.storedVaults.keys {
        vaults[vaultName] = self.storedVaults[vaultName]?.getBalance()
      }

      return GeeftInfo(id: self.id, from: self.from, message: self.message, collections: collections, vaults: vaults, extra: self.extra)
    }

    pub fun open() {
      for collectionName in self.storedCollections.keys {
         self.storedCollections[collectionName]?.send()
      }

      for vaultName in self.storedVaults.keys {
         self.storedVaults[vaultName]?.send()
      }
    }

    pub fun getViews(): [Type] {
      return [
        Type<MetadataViews.Display>()
      ]
    }

    pub fun resolveView(_ view: Type): AnyStruct? {
      switch view {
        case Type<MetadataViews.Display>():
          return MetadataViews.Display(
            name: "Geeft #".concat(self.id.toString()),
            description: self.message ?? (self.from == nil ? "This is a Geeft." : "This is a Geeft from ".concat(self.from!.toString()).concat(".")),
            thumbnail: MetadataViews.HTTPFile(
              url: "https://i.imgur.com/dZxbOEa.png"
            )
          )
      }
      return nil
    }

    init(from: Address?, message: String?, collections: @{String: CollectionContainer}, vaults: @{String: VaultContainer}, extra: {String: AnyStruct}) {
      self.id = self.uuid
      self.from = from
      self.message = message
      self.storedCollections <- collections
      self.storedVaults <- vaults
      self.extra = extra
      Geeft.totalSupply = Geeft.totalSupply + 1
    }

    destroy() {
      destroy self.storedCollections
      destroy self.storedVaults
    }
  }

  pub resource interface CollectionPublic {
    pub fun deposit(token: @NonFungibleToken.NFT)
    pub fun getIDs(): [UInt64]
    pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
    pub fun getGeeftInfo(geeftId: UInt64): GeeftInfo
  }

  pub resource Collection: CollectionPublic, NonFungibleToken.Provider, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection {
    pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

    pub fun deposit(token: @NonFungibleToken.NFT) {
      let geeft <- token as! @NFT
      emit Deposit(id: geeft.id, to: self.owner?.address)
      self.ownedNFTs[geeft.id] <-! geeft
    }

    pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
      let geeft <- self.ownedNFTs.remove(key: withdrawID) ?? panic("This Geeft does not exist in this collection.")
      emit Withdraw(id: geeft.id, from: self.owner?.address)
      return <- geeft
    }

    pub fun getIDs(): [UInt64] {
      return self.ownedNFTs.keys
    }

    pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
      return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
    } 

    pub fun openGeeft(id: UInt64) {
      let token <- self.ownedNFTs.remove(key: id) ?? panic("This Geeft does not exist.")
      let geeft <- token as! @NFT
      geeft.open()

      emit GeeftOpened(id: geeft.id, by: self.owner!.address)
      destroy geeft
    }

    pub fun getGeeftInfo(geeftId: UInt64): GeeftInfo {
      let ref = (&self.ownedNFTs[geeftId] as auth &NonFungibleToken.NFT?)!
      let geeft = ref as! &NFT
      return geeft.getGeeftInfo()
    }

    pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
      let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
      let geeft = nft as! &NFT
      return geeft as &{MetadataViews.Resolver}
    }

    init() {
      self.ownedNFTs <- {}
    }

    destroy() {
      destroy self.ownedNFTs
    }
  }

  pub fun sendGeeft(
    from: Address?,
    message: String?, 
    collections: @{String: CollectionContainer}, 
    vaults: @{String: VaultContainer}, 
    extra: {String: AnyStruct}, 
    recipient: Address
  ) {
    let geeft <- create NFT(from: from, message: message, collections: <- collections, vaults: <- vaults, extra: extra)
    let collection = getAccount(recipient).getCapability(Geeft.CollectionPublicPath)
                        .borrow<&Collection{NonFungibleToken.Receiver}>()
                        ?? panic("The recipient does not have a Geeft Collection")

    emit GeeftCreated(id: geeft.id, message: message, from: from, to: recipient)
    collection.deposit(token: <- geeft)
  }

  pub fun createCollectionContainer(publicPath: PublicPath, storagePath: StoragePath, assets: @[{MetadataViews.Resolver}], to: Address): @CollectionContainer {
    return <- create CollectionContainer(publicPath: publicPath, storagePath: storagePath, assets: <- assets, to: to)
  }

  pub fun createVaultContainer(receiverPath: PublicPath, storagePath: StoragePath, assets: @FungibleToken.Vault, to: Address): @VaultContainer {
    return <- create VaultContainer(receiverPath: receiverPath, storagePath: storagePath, assets: <- assets, to: to)
  }

  pub fun createEmptyCollection(): @Collection {
    return <- create Collection()
  }

  init() {
    self.CollectionStoragePath = /storage/GeeftCollection
    self.CollectionPublicPath = /public/GeeftCollection

    self.totalSupply = 0

    emit ContractInitialized()
  }

}