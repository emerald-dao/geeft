<script>
  import { user } from "../flow/stores.js";
  import { readGeefts } from "../flow/actions.js";
  import Geeft from "$lib/components/Geeft.svelte";
  import { showGeeft } from "$lib/stores/MyGeefts.js";
  import GeeftInfo from "$lib/components/GeeftInfo.svelte";

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
  <GeeftInfo />
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
</style>
