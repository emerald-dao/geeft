import Geeft from "../contracts/Geeft.cdc"
import NonFungibleToken from "../contracts/utilities/NonFungibleToken.cdc"

pub fun main(user: Address): [Geeft.GeeftInfo] {
  let GeeftCollection = getAccount(user).getCapability(Geeft.CollectionPublicPath)
                            .borrow<&Geeft.Collection{NonFungibleToken.CollectionPublic, Geeft.CollectionPublic}>()
                            ?? panic("The user does not have a Geeft Collection set up.")
  let ids = GeeftCollection.getIDs()
  let answer: [Geeft.GeeftInfo] = []
  for id in ids {
    answer.append(GeeftCollection.getGeeftInfo(geeftId: id))
  }

  return answer
}