<script>
  import { user } from "../flow/stores.js";
  import { openGeeft, readGeefts } from "../flow/actions.js";
  import Geeft from "$lib/components/Geeft.svelte";
  import { showGeeft } from "$lib/stores/MyGeefts.js";

  console.log($showGeeft);

  $: if ($showGeeft) {
    console.log($showGeeft);
  }
</script>

<div class="main" class:blur={$showGeeft !== false}>
  <article>
    <h2>My Geefts</h2>
    {#await readGeefts($user.addr) then geefts}
      <div class="list">
        {#each geefts as geeft}
          <Geeft {geeft} />
        {/each}
      </div>
    {/await}
  </article>
</div>

{#if $showGeeft}
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
{/if}

<style>
  .main {
    position: relative;
    top: 0px;
    width: 80vw;
    padding: 10vw 10vw 10vw 10vw;
  }

  .blur {
    opacity: 0.25;
  }

  .list {
    display: flex;
    flex-wrap: wrap;
  }

  article {
    box-shadow: #0000003d 0 3px 8px;
    border-radius: 5px;
    background: rgb(181, 225, 208);
    min-height: 60vh;
    padding: 30px;
  }

  h2 {
    text-align: center;
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
