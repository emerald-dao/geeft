import Geeft from "../contracts/Geeft.cdc"

pub fun main(user: Address, id: UInt64): Geeft.GeeftInfo {
  let GeeftCollection = getAccount(user).getCapability(Geeft.CollectionPublicPath)
                            .borrow<&Geeft.Collection{Geeft.CollectionPublic}>()
                            ?? panic("The user does not have a Geeft Collection set up.")
  return GeeftCollection.getGeeftInfo(geeftId: id)
}