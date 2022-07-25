<script>
  import Nav from "$lib/components/Nav.svelte";
  import Footer from "$lib/components/utilities/Footer.svelte";
  import Meta from "$lib/components/utilities/Meta.svelte";
  import Transaction from "$lib/components/utilities/Transaction.svelte";

  import "../app.css";
</script>

<Meta />

<Nav />
<main>
  <slot />
</main>

<Transaction />

<Footer />
