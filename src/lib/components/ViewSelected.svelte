<script>
  import { selectedNFTs, selectedVaults } from "../stores/CreationStore.js";
  import NFTCard from "./NFTCard.svelte";
  import VaultCard from "./VaultCard.svelte";

  export let collections;
  export let tokens;

  let show = false;
</script>

<div>
  <h2>2. View Geeft</h2>
  <button on:click={() => (show = !show)} class:show>></button>
</div>
{#if show}
  <article>
    {#each Object.keys($selectedNFTs) as collectionName}
      {#each $selectedNFTs[collectionName] as nftId}
        <NFTCard
          nft={collections[collectionName][nftId]}
          {collectionName}
          {nftId} />
      {/each}
    {/each}

    {#each Object.keys($selectedVaults) as vaultName}
      <VaultCard {vaultName} balance={tokens[vaultName]} />
    {/each}
  </article>
{/if}

<style>
  div {
    position: relative;
    margin-top: 20px;
    border-radius: 5px;
    box-shadow: #0000003d 0 3px 8px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgb(84, 230, 174);
    padding: 20px;
  }

  button {
    background: none;
    border: none;
    font-size: 30px;
  }

  .show {
    animation: 0.5s rotation forwards;
  }

  @keyframes rotation {
    100% {
      transform: rotate(90deg);
    }
  }

  article {
    display: flex;
    flex-wrap: wrap;
    background: rgb(181, 225, 208);
  }
</style>
