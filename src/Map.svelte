<script>
	import { app_state, map_geojson, country_codes } from './stores.js';
	import { onMount } from 'svelte'
	import { geoMercator, geoPath } from 'd3-geo'
	import { select } from 'd3-selection';
	import { scaleSequential } from 'd3-scale';
	import { interpolateHsl } from 'd3-interpolate';

	const min_width = 1200;
	const window_width  = Math.max(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, min_width);

	const MAP_WIDTH = Math.round(8/12 * 7/12 * window_width);
	const MAP_HEIGHT = MAP_WIDTH;
	// https://github.com/d3/d3-scale-chromatic
	const color_scale = scaleSequential(interpolateHsl("#d6f5d6", "#051505"));
	const missing_color = "#e9ecef";
	const picked_woj_color = '#c4ccd4'

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
			.attr("opacity", '0%')
			.attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; });
	}

	function update_map(app_state) {
		var mode = app_state['mode'];
		var year = app_state['year'];
		var country = app_state['country'];
		var wojewodztwo = app_state['wojewodztwo'];
		if (mode === 'bycountry') {
			by_country_render(country, year)
		} else if (mode === 'bywojewodztwo') {
			by_wojewodztwo_render(year, wojewodztwo)
		} else {
			// pass
		}
		return true
	}

	function by_country_render(country, year) {
		var map = select("#map");
		map.selectAll("path")
			.style("fill", function(d) {
				var value;
				try {
					value = d.properties['bycountry'][year][country]['year_prop'];
				} catch (error) {
					// pass
				}
				if (value) {
					return color_scale(value);
				} else {
					return missing_color;
				}
			})
		map.selectAll("text")
			.text(function(d) {
				var perc;
				try {
					var prop = d.properties['bycountry'][year][country]['year_prop'];
					// Javascript rounding workaround + to percent conversion
					perc = Math.round( (prop*100) * 100 + Number.EPSILON ) / 100
					perc = `${perc}%`
				} catch (error) {
					console.log(error)
					perc = 'NA'
				}
				return perc
			})
		map.selectAll("circle")
			.attr("opacity", '0%');
	}

	function by_wojewodztwo_render(year, wojewodztwo) {
		var map = select("#map");
		map.selectAll("path")
			.style("fill", function(d) {
					var nazwa = d.properties['nazwa'].toUpperCase();
					if (nazwa == wojewodztwo) {
						return picked_woj_color;
					} else {
						return missing_color;
					}
				})
		map.selectAll("text").text('')
		map.selectAll("circle")
			.attr("opacity", '100%')
			.attr('fill', function(d) {
				var data = d.properties['bywojewodztwo'][year];
				var top = data.map(el => el.country).filter(el => el != 'OTHER')[0];
				return `url(#${top.toString()})`;
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
					<image xlink:href="build/flag-icon-css/flags/1x1/{country.toLowerCase()}.svg" preserveAspectRatio="none" width="1" height="1"/>
					</pattern>
				{/each}
			</defs>
		</svg>
	</div>
</div>

<style>
	#map {
		margin: 20px;
	}
</style>