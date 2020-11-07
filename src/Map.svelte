<script>
	import app_state from './stores.js';
	import { onMount } from 'svelte';

	let country_codes = {};
	let map_geojson = {};
	onMount(async () => {
		const country_codes_raw = await fetch('data/country_codes.json');
		country_codes = await country_codes_raw.json();
		const map_geojson_raw = await fetch('data/wojewodztwa-min.geojson');
		map_geojson = await map_geojson_raw.json();
	});
</script>

<main>
	<div>map placeholder</div>
	<div>{JSON.stringify($app_state)}</div>
	{#if Object.keys(country_codes).length === 0 & Object.keys(map_geojson).length === 0}
		<p>waiting for the promise to resolve...</p>
	{:else}
		{JSON.stringify(country_codes)}
		{JSON.stringify(map_geojson)}
	{/if}
</main>

<style>

</style>