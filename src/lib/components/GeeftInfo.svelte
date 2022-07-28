<script>
  import { openGeeft } from "../../flow/actions.js";
  import { showGeeft } from "$lib/stores/MyGeefts.js";
  import { readGeeftContents } from "../../flow/actions.js";
  import { openGiftStatus, user } from "../../flow/stores.js";
  import NFTCard from "./NFTCard.svelte";
  import VaultCard from "./VaultCard.svelte";

  let unwrapped = readGeeftContents($user.addr, $showGeeft.id);
</script>

{#if $openGiftStatus.inProgress}
  <article class="geeft">
    <img class="shake" src="/gift.png" alt="geeft logo" />
    <p>Opening...</p>
  </article>
{:else if !$openGiftStatus.success}
  <article class="geeft">
    <div class="img-container">
      <img src="/gift.png" alt="geeft logo" />
      <div class="flex">
        <button on:click={() => ($showGeeft = false)}>Close</button>
        <button on:click={() => openGeeft($showGeeft)}>Open</button>
      </div>
    </div>
    <div class="info">
      <p><b>Message:</b> {$showGeeft.message}</p>
      <p><b>Contained Collections:</b></p>
      {#each Object.keys($showGeeft.nfts) as collectionName}
        <div class="tag">
          {collectionName}: {$showGeeft.nfts[collectionName]}
        </div>
      {/each}
      <p><b>Contained Tokens:</b></p>
      {#each $showGeeft.tokens as vaultName}
        <div class="tag">
          {vaultName}
        </div>
      {/each}
    </div>
  </article>
{:else}
  <article class="geeft">
    <div class="img-container">
      <img src="/open-box.png" alt="open geeft logo" />
      <div class="flex">
        <button on:click={() => ($showGeeft = false)}>Close</button>
      </div>
    </div>
    {#await unwrapped then unwrapped}
      <div class="info">
        <h3>Geeft Contents</h3>
        {#each Object.keys(unwrapped.nfts) as collectionName}
          {#each unwrapped.nfts[collectionName] as nft}
            <NFTCard {nft} {collectionName} />
          {/each}
        {/each}
        {#each Object.keys(unwrapped.tokens) as vaultName}
          <VaultCard
            balance={unwrapped.tokens[vaultName]}
            {vaultName}
            input={false} />
        {/each}
      </div>
    {/await}
  </article>
{/if}

<style>
  .shake {
    animation: shake 0.5s linear infinite;
  }
  @keyframes shake {
    0% {
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
    100% {
      transform: translateX(0px);
    }
  }
  article {
    box-shadow: #0000003d 0 3px 8px;
    border-radius: 5px;
    background: rgb(181, 225, 208);
    min-height: 60vh;
    padding: 30px;
  }

  .geeft {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 60vw;
    background-color: rgb(181, 225, 208);
    z-index: 1;
    padding: 20px;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  h3 {
    text-align: center;
  }

  img {
    width: 200px;
    height: 200px;
  }

  .flex {
    margin-top: 10px;
  }

  .flex > button {
    margin: 10px;
    padding: 10px;
    background-color: rgb(84, 230, 174);
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 20px;
    box-shadow: #0000003d 0 3px 8px;
    cursor: pointer;
  }

  .flex > button:nth-child(1) {
    background-color: grey;
  }

  .info {
    position: relative;
    box-sizing: border-box;
    max-width: 400px;
    overflow-y: scroll;
    max-height: 50vh;
  }

  .tag {
    border: 2px solid rgb(84, 230, 174);
    display: inline-block;
    padding: 10px;
    background-color: #fff;
    margin: 5px;
    border-radius: 20px;
  }

  @media all and (max-width: 1000px) {
    .geeft {
      flex-direction: column;
    }
  }
</style>
