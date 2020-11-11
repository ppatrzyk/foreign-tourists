<script>
	import { app_state, country_codes, map_geojson, tourists } from './stores.js';
	import { onMount } from 'svelte'
	import Map from "./Map.svelte"
	import Country from "./Country.svelte"
	import Control from "./Control.svelte"
	import TopCountries from "./TopCountries.svelte"

	onMount(async () => {
		const country_codes_raw = await fetch('data/country_codes.json');
		var country_codes_data = await country_codes_raw.json();
		
		const map_geojson_raw = await fetch('data/map_data.geojson');
		var map_geojson_data = await map_geojson_raw.json();
		
		const tourists_raw = await fetch('data/tourists_total.json');
		var tourists_data = await tourists_raw.json();

		console.log(map_geojson_data)

		country_codes.set(country_codes_data)
		map_geojson.set(map_geojson_data)
		tourists.set(tourists_data)
	});
	
</script>

<main>
	<h1>Foreign Tourists</h1>
	<Control />
	{#if Object.keys($country_codes).length === 0 || Object.keys($map_geojson).length === 0 || Object.keys($tourists).length === 0}
		<p>Loading data...</p>
	{:else}
		{#if $app_state.mode !== 'total'}
			<Map />
		{:else}
			<TopCountries level="total"/>
		{/if}
		{#if $app_state.mode === 'bycountry'}
			<Country country="FR" />
			<Country country="CZ" />
		{/if}
		{#if $app_state.mode === 'bywojewodztwo'}
			<TopCountries level="wojewodztwo"/>
		{/if}
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