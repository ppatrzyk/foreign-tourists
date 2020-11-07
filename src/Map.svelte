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

	function update_map(app_state, data) {
		var mode = app_state['mode'];
		var year = app_state['year'];
		var country = app_state['country'];
		var wojewodztwo = app_state['wojewodztwo'];
		var current_data = data[mode];
		if (mode === 'bycountry') {
			current_data = current_data[country].filter(el => el.year == year)
			console.log(current_data)
		} else {
			console.log('not implemented yet')
		}
		console.log(mode)
		console.log(data)
		return true
	}
	$: update_trigger = update_map($app_state, $tourists);

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