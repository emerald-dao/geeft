<script>
  export let error;
</script>

<article>
  <p>Error: {error}</p>
</article>

<style>
  article {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    top: 10px;
    background-color: black;
    color: white;
    padding: 10px;
    border-radius: 5px;
    z-index: 10;
    font-size: 20px;
  }
</style>
