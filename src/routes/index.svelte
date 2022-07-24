<script>
	import { user } from "../flow/stores.js";
	import CollectionSelector from "$lib/components/CollectionSelector.svelte";
	import NFTDisplay from "$lib/components/NFTDisplay.svelte";
	import { discover, setup } from "../flow/actions.js";
	import ViewSelected from "$lib/components/ViewSelected.svelte";
	import Send from "$lib/components/Send.svelte";

	let collections = {};
	$: if ($user) {
		collections = discover($user.addr);
	}
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<!-- <button on:click={setup}>Setup</button> -->

<div class="main">
	{#if !$user.loggedIn}
		<article>Please connect your wallet.</article>
	{:else}
		{#await collections then collections}
			<div class="select">
				<CollectionSelector collections={Object.keys(collections)} />
				<NFTDisplay {collections} />
			</div>
			<ViewSelected {collections} />
			<Send />
		{/await}
	{/if}
</div>

<style>
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
		}
	}
</style>
