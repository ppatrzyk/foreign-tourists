<script>
	import app_state from './stores.js';
	import { geoMercator, geoPath } from 'd3-geo'
	import { select } from 'd3-selection';

	export let map_geojson;

	const MAP_WIDTH = 600;
	const MAP_HEIGHT = 600;

	function draw_map(data) {
		var projection = geoMercator()
			.fitSize([MAP_WIDTH, MAP_HEIGHT], data);

		var path = geoPath().projection(projection);

		var map = select("#map");

		map.selectAll("path")
			.data(map_geojson.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "country-border")
	}
	$: map_trigger = draw_map(map_geojson);
</script>

<div>
	<div >
		<svg id="map" width={MAP_WIDTH} height={MAP_HEIGHT}></svg>
	</div>
	<div>{JSON.stringify($app_state)}</div>
</div>

<style>

</style>