<script>
	import { user } from "../flow/stores.js";
	import Selector from "$lib/components/Selector.svelte";
	import Display from "$lib/components/Display.svelte";
	import { areSetup, discover, setup } from "../flow/actions.js";
	import ViewSelected from "$lib/components/ViewSelected.svelte";
	import Send from "$lib/components/Send.svelte";

	let discovered = {};
	$: if ($user) {
		discovered = discover($user.addr);
	}
</script>

<svelte:head>
	<title>Geeft</title>
</svelte:head>

<!-- <button on:click={setup}>Setup</button> -->

<div class="main">
	{#if !$user.loggedIn}
		<article class="please">Please connect your wallet.</article>
	{:else if areSetup($user.addr)}
		{#await discovered then discovered}
			<div class="select">
				<Selector
					collections={discovered.collections}
					tokens={Object.keys(discovered.vaults)} />
				<Display
					collections={discovered.collections}
					tokens={discovered.vaults} />
			</div>
			<ViewSelected
				collections={discovered.collections}
				tokens={discovered.vaults} />
			<Send />
		{/await}
	{:else}
		<button on:click={setup}>Setup</button>
	{/if}
</div>

<style>
	.please {
		position: relative;
		min-height: 60vh;
	}
	article {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.main {
		position: relative;
		top: 0px;
		padding: 10vw;
		width: 80vw;
	}

	.select {
		display: flex;
		height: 80vh;
	}

	@media all and (max-width: 1000px) {
		.select {
			flex-direction: column;
			height: 100vh;
		}
	}
</style>
