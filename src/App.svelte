<script>
	import { app_state, country_codes, map_geojson, tourists } from './stores.js';
	import { onMount } from 'svelte'
	import Map from "./Map.svelte"
	import Country from "./Country.svelte"

	function prepare_geojson(geojson, data) {
		const years = ['2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']
		geojson.features.forEach(entry => {
			var wojewodztwo = entry.properties.nazwa.toUpperCase();
			console.log(wojewodztwo)
			// TODO bycountry
			for (var key in data.bycountry) {
				if (!data.bycountry.hasOwnProperty(key)) continue;
				var country = data.bycountry[key];
				years.forEach(year => {
					try {
						country[year].forEach(entry => {
							entry.properties[year]['bycountry_prop'][country] = entry.year_prop;
						});
					} catch (error) {
						console.log(error)
						console.log(`${country} failure`)
					}
				});
			}

			// TODO bywojewodztwo
			// data['bywojewodztwo'][wojewodztwo]
		});
		return geojson
	}

	onMount(async () => {
		const country_codes_raw = await fetch('data/country_codes.json');
		var country_codes_data = await country_codes_raw.json();
		
		const map_geojson_raw = await fetch('data/wojewodztwa-min.geojson');
		var map_geojson_data = await map_geojson_raw.json();
		
		const tourists_raw = await fetch('data/tourists_clean.json');
		var tourists_data = await tourists_raw.json();

		map_geojson_data = prepare_geojson(map_geojson_data, tourists_data)
		console.log(map_geojson_data)

		country_codes.set(country_codes_data)
		map_geojson.set(map_geojson_data)
		tourists.set(tourists_data)
	});
	
</script>

<main>
	<h1>Foreign Tourists</h1>
	{#if Object.keys($country_codes).length === 0 || Object.keys($map_geojson).length === 0 || Object.keys($tourists).length === 0}
		<p>waiting for the promise to resolve...</p>
	{:else}
		<Map />
		<Country country="FR" />
		<Country country="CZ" />
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>