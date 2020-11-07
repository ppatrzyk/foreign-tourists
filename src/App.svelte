<script>
	import { onMount } from 'svelte';
	import Map from "./Map.svelte"
	import Country from "./Country.svelte"

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
	<h1>Foreign Tourists</h1>
	{#if Object.keys(country_codes).length === 0 & Object.keys(map_geojson).length === 0}
		<p>waiting for the promise to resolve...</p>
	{:else}
		<Map map_geojson={map_geojson}/>
		<Country country="FR" />
		<Country country="CZ" />
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>