<script>
	import app_state from './stores.js';
	import { geoMercator } from 'd3-geo'

	export let map_geojson;

	const MAP_SCALE = 100;
	const MAP_WIDTH = 600;
	const MAP_HEIGHT = 600;
	const MAP_MARGIN = {top: 25, right: 25, bottom: 25, left: 25};

	function draw_map(data) {
		console.log(data)
	}
</script>

<div>
	<div id="map">map placeholder</div>
	<div>{JSON.stringify($app_state)}</div>
	<div>{draw_map(map_geojson)}</div>

</div>

<style>

</style>