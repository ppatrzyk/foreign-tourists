<script>
	import { app_state, country_codes, map_geojson, tourists } from './stores.js';
	import { onMount } from 'svelte'
	import { geoMercator, geoPath } from 'd3-geo'
	import { select } from 'd3-selection';

	const MAP_WIDTH = 600;
	const MAP_HEIGHT = 600;
	
	function draw_map(data) {
		const projection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], data);
		const path = geoPath().projection(projection);
		var map = select("#map");
		map.selectAll("path")
			.data(data.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "country-border");
	}

	function update_map(viz_data) {
		console.log(viz_data)
		return true
	}
	$: update_trigger = update_map($app_state);

	onMount(async () => {
		draw_map($map_geojson)
	});
</script>

<div>
	<div >
		<svg id="map" width={MAP_WIDTH} height={MAP_HEIGHT}></svg>
	</div>
</div>

<style>

</style>