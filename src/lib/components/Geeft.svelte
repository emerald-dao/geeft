<script>
  import { showGeeft } from "$lib/stores/MyGeefts.js";
  export let geeft;
</script>

<div on:click={() => ($showGeeft = geeft)}>
  <img src="/gift.png" alt="gift logo" />
  <p>{geeft.message.substring(0, 100)}...</p>
</div>

<style>
  div {
    position: relative;
    width: 225px;
    height: 225px;
    margin: 10px;
    box-shadow: #0000003d 0 3px 8px;
    border-radius: 5px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
    cursor: pointer;
  }

  div:hover {
    border: 2px solid white;
  }

  p {
    margin: 0;
    text-align: left;
  }

  img {
    width: 100px;
  }
</style>
