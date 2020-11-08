<script>
	import { app_state, map_geojson } from './stores.js';
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

	function update_map(app_state) {
		var mode = app_state['mode'];
		var year = app_state['year'];
		var country = app_state['country'];
		if (mode === 'bycountry') {
			by_country_render(country, year)
		} else if (mode === 'bywojewodztwo') {
			by_wojewodztwo_render(year)
		} else {
			// pass
		}
		return true
	}
	function by_country_render(country, year) {
		console.log(`country render called ${country} ${year}`)
		// https://github.com/ppatrzyk/filmweb-explorer/blob/master/app/static/js/maked3viz.js
		// line 255
	}
	function by_wojewodztwo_render(year) {
		console.log(`wojewodztwo render called ${year}`)
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