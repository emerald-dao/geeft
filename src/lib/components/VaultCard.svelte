<script>
  import { selectedVaults } from "../stores/CreationStore.js";

  export let vaultName;
  export let balance;
  export let input = true;

  $: if ($selectedVaults[vaultName] === null) {
    delete $selectedVaults[vaultName];
    $selectedVaults = $selectedVaults;
  }
</script>

<div class:selected={$selectedVaults[vaultName]}>
  <img src={`/images/vaults/${vaultName}.png`} alt="{vaultName} image" />
  <h3>{vaultName}</h3>
  <p>Balance: <i>{parseFloat(balance)}</i></p>
  {#if input}
    <label for="amount"
      >amount<input
        name="amount"
        id="amount"
        type="text"
        bind:value={$selectedVaults[vaultName]}
        placeholder="10.0" /></label>
  {/if}
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
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .selected {
    border: 2px solid white;
  }

  div:hover {
    border: 2px solid white;
  }

  h3 {
    margin: 0;
  }

  img {
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
  }

  input {
    position: relative;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid rgb(84, 230, 174);
    padding: 5px;
    width: 75%;
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
