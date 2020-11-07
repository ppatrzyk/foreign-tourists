<script>
	import app_state from './stores.js';
	import { geoMercator, geoPath } from 'd3-geo'
	import { select } from 'd3';

	export let map_geojson;

	const MAP_SCALE = 2000;
	const MAP_WIDTH = 600;
	const MAP_HEIGHT = 600;
	const MAP_MARGIN = {top: 25, right: 25, bottom: 25, left: 25};

	function draw_map(data) {
		console.log(data)
		var projection = geoMercator()
			.fitSize([MAP_WIDTH, MAP_HEIGHT], data);

		var path = geoPath().projection(projection);

		var map = select("#map")
			.append("svg")
			.attr("width", MAP_WIDTH + MAP_MARGIN.left + MAP_MARGIN.right)
			.attr("height", MAP_HEIGHT + MAP_MARGIN.top + MAP_MARGIN.bottom)
			.attr("class", "border")

		map.selectAll("path")
			.data(map_geojson.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "country-border")
	}
</script>

<div>
	<div id="map"></div>
	<div>{JSON.stringify($app_state)}</div>
	<div>{draw_map(map_geojson)}</div>
</div>

<style>
	.country-border {
		stroke: white;
		stroke-width: 0.5;
	}
</style>