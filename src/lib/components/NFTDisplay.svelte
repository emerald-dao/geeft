<script>
  import { currentCollection } from "../stores/CreationStore.js";
  import NFTCard from "./NFTCard.svelte";

  export let collections;
  $: collection = collections[$currentCollection] || {};
</script>

<div class="box">
  {#each Object.keys(collection) as nftId}
    <NFTCard
      nft={collection[nftId]}
      collectionName={$currentCollection}
      {nftId} />
  {/each}
</div>

<style>
  .box {
    display: flex;
    overflow-y: scroll;
    box-shadow: #0000003d 0 3px 8px;
    border-radius: 5px;
    background: rgb(181, 225, 208);
    width: calc(80vw - 300px);
    flex-wrap: wrap;
  }

  @media all and (max-width: 1000px) {
    .box {
      width: 80vw;
    }
  }
</style>
