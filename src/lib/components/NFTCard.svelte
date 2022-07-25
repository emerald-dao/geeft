<script>
  import { selectedNFTs } from "../stores/CreationStore.js";

  export let collectionName;
  export let nftId;
  export let nft;

  function select() {
    if ($selectedNFTs[collectionName]?.includes(nftId) === true) {
      $selectedNFTs[collectionName] = $selectedNFTs[collectionName].filter(
        (id) => id !== nftId
      );
    } else {
      $selectedNFTs[collectionName] = [
        ...($selectedNFTs[collectionName] || []),
        nftId,
      ];
    }
  }
</script>

<div
  class:selected={$selectedNFTs[collectionName]?.includes(nftId)}
  on:click={select}>
  <img
    src={"url" in nft.thumbnail
      ? nft.thumbnail.url
      : "path" in nft.thumbnail
      ? `https://ipfs.infura.io/ipfs/${nft.thumbnail.cid}/${nft.thumbnail.path}`
      : `https://ipfs.infura.io/ipfs/${nft.thumbnail.cid}`}
    alt="{nft.name} image" />
  <h3>{nft.name}</h3>
  <p>{nft.description.substring(0, 90)}...</p>
  <small>#{nftId}</small>
</div>

<style>
  div {
    position: relative;
    min-width: 200px;
    width: 200px;
    height: 300px;
    min-height: 300px;
    margin: 30px;
    box-shadow: #0000003d 0 3px 8px;
    border-radius: 5px;
    box-sizing: border-box;
    padding: 20px;
    overflow: hidden;
  }

  .selected {
    border: 2px solid white;
  }

  div:hover {
    border: 2px solid white;
  }

  h3,
  p {
    margin: 0;
  }

  img {
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
  }

  small {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }

  @media all and (max-width: 1000px) {
    div {
      width: 150px;
      height: 150px;
    }

    img {
      width: 50px;
    }
  }
</style>
