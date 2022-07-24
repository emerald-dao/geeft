<script>
  import Nav from "$lib/components/Nav.svelte";
  import Transaction from "$lib/components/utilities/Transaction.svelte";

  import "../app.css";
</script>

<Nav />
<main>
  <slot />
</main>

<Transaction />
