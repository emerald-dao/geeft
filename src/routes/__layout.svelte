<script>
  import Nav from "$lib/components/Nav.svelte";
  import Footer from "$lib/components/utilities/Footer.svelte";
  import Meta from "$lib/components/utilities/Meta.svelte";
  import Transaction from "$lib/components/utilities/Transaction.svelte";
  import { openGiftStatus, sendGiftStatus } from "../flow/stores";

  import "../app.css";
  import Error from "$lib/components/utilities/Error.svelte";
</script>

<Meta />

<Nav />

{#if $sendGiftStatus.error}
  <Error error={$sendGiftStatus.error} />
{:else if $openGiftStatus.error}
  <Error error={$openGiftStatus.error} />
{/if}

<main>
  <slot />
</main>

<Transaction />

<Footer />
