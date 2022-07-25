<script>
  import {
    currentCollection,
    currentToken,
    displayNFTs,
  } from "../stores/CreationStore.js";
  export let collections;
  export let tokens;
</script>

<article>
  <h2>1. Fill Your Geeft</h2>
  <div class="flex">
    <button
      class:selected={$displayNFTs === true}
      on:click={() => ($displayNFTs = true)}>NFTs</button>
    <button
      class:selected={$displayNFTs === false}
      on:click={() => ($displayNFTs = false)}>
      Tokens
    </button>
  </div>
  {#if $displayNFTs === true}
    {#each collections as collection}
      <button
        on:click={() => ($currentCollection = collection)}
        class:selected={$currentCollection === collection}>
        <img
          src="/images/collections/{collection}.png"
          alt="{collection} logo" />
        <p>{collection}</p>
      </button>
    {/each}
  {:else}
    {#each tokens as token}
      <button
        on:click={() => ($currentToken = token)}
        class:selected={$currentToken === token}>
        <img src="/images/vaults/{token}.png" alt="{token} logo" />
        <p>{token}</p>
      </button>
    {/each}
  {/if}
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
    background: rgb(84, 230, 174);
    margin-right: 30px;
    border-radius: 10px;
    box-shadow: #0000003d 0 3px 8px;
    overflow-y: scroll;
    padding: 20px;
    min-width: 300px;
    box-sizing: border-box;
    min-height: 400px;
  }

  div {
    margin-top: 10px;
  }

  button {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: none;
    border-radius: 5px;
    padding: 5px;
    color: white;
    font-size: 20px;
    margin: 5px;
    box-sizing: border-box;
  }

  .selected {
    border: 2px solid rgb(229, 237, 229);
  }

  button:hover {
    border: 2px solid rgb(229, 237, 229);
  }

  img {
    width: 50px;
    height: 50px;
  }

  h2 {
    margin: 0;
  }

  @media all and (max-width: 1000px) {
    article {
      width: 80vw;
      margin: 0px;
      min-width: none;
    }
  }
</style>
