<script>
	import { app_state, map_geojson, country_codes } from './stores.js';
	import { onMount } from 'svelte'
	import { geoMercator, geoPath } from 'd3-geo'
	import { select } from 'd3-selection';
	import { scaleSequential } from 'd3-scale';
	import { interpolateYlGn } from 'd3-scale-chromatic';

	const MAP_WIDTH = 600;
	const MAP_HEIGHT = 600;
	// https://github.com/d3/d3-scale-chromatic
	const color_scale = scaleSequential(interpolateYlGn);
	const missing_color = "#ffff99";

	// d3 update functions

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
		map.selectAll('circle')
			.data(geojson.features)
			.enter()
			.append('circle')
			.attr("r", 20)
			.attr("fill", 'url(#DE)')
			.attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; });
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

	function by_wojewodztwo_render(year) {
		var map = select("#map");
		map.selectAll("path")
			.style("fill", missing_color)
		map.selectAll("text")
			.text(function(d) {
				var data = d.properties['bywojewodztwo'][year];
				var top = data.map(el => el.country).filter(el => el != 'OTHER')[0];
				return top.toString();
			})
	}
	$: update_trigger = update_map($app_state);
	
	$: countries = Object.keys($country_codes)

	onMount(async () => {
		draw_map($map_geojson);
		update_map($app_state);
	});
</script>

<div>
	<div >
		<svg id="map" width={MAP_WIDTH} height={MAP_HEIGHT}>
			<defs>
				{#each countries as country}
					<pattern id="{country}" height="100%" width="100%" patternContentUnits="objectBoundingBox">
					<image xlink:href="/build/flag-icon-css/flags/1x1/{country.toLowerCase()}.svg" preserveAspectRatio="none" width="1" height="1"/>
					</pattern>
				{/each}
			</defs>
		</svg>
	</div>
</div>

<style>

</style>