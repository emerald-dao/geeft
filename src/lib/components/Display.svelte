<script>
  import {
    currentCollection,
    currentToken,
    displayNFTs,
  } from "../stores/CreationStore.js";
  import NFTCard from "./NFTCard.svelte";
  import VaultCard from "./VaultCard.svelte";

  export let collections;
  export let tokens;
  $: collection = collections[$currentCollection].nfts || {};
  $: token = tokens[$currentToken] || "0.0";
</script>

<div class="box">
  {#if $displayNFTs === true}
    {#each Object.keys(collection) as nftId}
      <NFTCard
        nft={collection[nftId]}
        collectionName={$currentCollection}
        {nftId} />
    {/each}
  {:else}
    <VaultCard vaultName={$currentToken} balance={token} />
  {/if}
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
      min-height: 20vh;
      border-radius: 0px 0px 5px 5px;
    }
  }
</style>
