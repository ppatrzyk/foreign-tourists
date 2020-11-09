<script>
	import { app_state, map_geojson } from './stores.js';
	import { onMount } from 'svelte'
	import { geoMercator, geoPath } from 'd3-geo'
	import { select } from 'd3-selection';
	import { scaleSequential } from 'd3-scale';
	import { interpolateRdYlGn } from 'd3-scale-chromatic';

	const MAP_WIDTH = 600;
	const MAP_HEIGHT = 600;
	// https://github.com/d3/d3-scale-chromatic
	const color_scale = scaleSequential(interpolateRdYlGn);
	const missing_color = "#ffffff";
	
	function draw_map(geojson) {
		const projection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], geojson);
		const path = geoPath().projection(projection);
		var map = select("#map");
		map.selectAll("path")
			.data(geojson.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "country-border");
		map.selectAll('text')
			.data(geojson.features)
			.enter()
			.append('text')
			.text('')
			.attr("class", "map-label")
			.attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; });
	}

	function update_map(geojson, app_state) {
		var mode = app_state['mode'];
		var year = app_state['year'];
		var country = app_state['country'];
		if (mode === 'bycountry') {
			by_country_render(geojson, country, year)
		} else if (mode === 'bywojewodztwo') {
			by_wojewodztwo_render(geojson, year)
		} else {
			// pass
		}
		return true
	}
	function by_country_render(geojson, country, year) {
		console.log(`country render called ${country} ${year}`)
		var map = select("#map");
		map.selectAll("path")
			.style("fill", function(d) {
				var value = d.properties['bycountry'][year][country]['year_prop'];
				if (value) {
					return color_scale(value);
				} else {
					return missing_color;
				}
			})
		map.selectAll("text")
			.text(function(d) {
				var prop = d.properties['bycountry'][year][country]['year_prop'];
				// Javascript rounding workaround + to percent conversion
				var perc = Math.round( (prop*100) * 100 + Number.EPSILON ) / 100
				return `${perc}%`
			})
			
	}
	function by_wojewodztwo_render(geojson, year) {
		console.log(`wojewodztwo render called ${year}`)
		var map = select("#map");
		map.selectAll("path")
			.style("fill", missing_color)
		map.selectAll("text")
			.text(function(d) {
				var data = d.properties['bywojewodztwo'][year];
				var top3 = data.map(el => el.country).filter(el => el != 'OTHER').slice(0, 3);
				return top3.toString();
			})
	}
	$: update_trigger = update_map($map_geojson, $app_state);

	onMount(async () => {
		draw_map($map_geojson);
		update_map($map_geojson, $app_state);
	});
</script>

<div>
	<div >
		<svg id="map" width={MAP_WIDTH} height={MAP_HEIGHT}></svg>
	</div>
</div>

<style>

</style>