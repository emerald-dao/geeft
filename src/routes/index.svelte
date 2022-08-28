<script>
	import { user } from "../flow/stores.js";
	import Selector from "$lib/components/Selector.svelte";
	import Display from "$lib/components/Display.svelte";
	import { areSetup, discover, setup } from "../flow/actions.js";
	import { setupStatus } from "../flow/stores.js";
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
	{:else}
		{#await areSetup($user.addr) then areSetup}
			{#if areSetup === true}
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
				<article class="please">
					{#if $setupStatus.inProgress}
						<button>Setting up...</button>
					{:else if !$setupStatus.success}
						<button on:click={setup}>Setup</button>
					{:else}
						<button>Awesomeness! Please refresh the page.</button>
					{/if}
				</article>
			{/if}
		{/await}
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
		padding: 2vw 10vw 10vw 10vw;
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
	button {
		padding: 10px;
		background-color: rgb(84, 230, 174);
		border: none;
		border-radius: 5px;
		color: white;
		font-size: 20px;
		box-shadow: #0000003d 0 3px 8px;
		cursor: pointer;
	}
</style>
