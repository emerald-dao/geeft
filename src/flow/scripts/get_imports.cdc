import NFTCatalog from "../contracts/utilities/NFTCatalog.cdc"

pub fun main(contractNames: [String]): {String: Address} {
  let answer: {String: Address} = {}

  for contractName in contractNames {
    answer[contractName] = NFTCatalog.getCatalogEntry(collectionIdentifier: contractName)!.contractAddress
  }

  return answer
    
}