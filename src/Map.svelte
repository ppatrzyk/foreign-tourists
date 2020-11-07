<script>
	import app_state from './stores.js';
	import { onMount } from 'svelte';
	import { geoMercator } from 'd3-geo'

	const MAP_SCALE = 100;
	const MAP_WIDTH = 600;
	const MAP_HEIGHT = 600;
	const MAP_MARGIN = {top: 25, right: 25, bottom: 25, left: 25};

	function draw_map(data) {
		console.log(data)
	}

	let country_codes = {};
	let map_geojson = {};
	onMount(async () => {
		const country_codes_raw = await fetch('data/country_codes.json');
		country_codes = await country_codes_raw.json();
		const map_geojson_raw = await fetch('data/wojewodztwa-min.geojson');
		map_geojson = await map_geojson_raw.json();
		draw_map(map_geojson);
	});
</script>

<main>
	<div>map placeholder</div>
	<div>{JSON.stringify($app_state)}</div>
	{#if Object.keys(country_codes).length === 0 & Object.keys(map_geojson).length === 0}
		<p>waiting for the promise to resolve...</p>
	{:else}
		{JSON.stringify(country_codes)}
		<div id="map"></div>
	{/if}
</main>

<style>

</style>