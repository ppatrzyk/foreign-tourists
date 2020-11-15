<script>
	import { app_state, country_codes, map_geojson, tourists } from './stores.js';
	import { onMount } from 'svelte'
	import Map from "./Map.svelte"
	import Country from "./Country.svelte"
	import Control from "./Control.svelte"
	import TopCountries from "./TopCountries.svelte"

	onMount(async () => {
		const country_codes_raw = await fetch('data/country_codes.json');
		var country_codes_data = await country_codes_raw.json();
		
		const map_geojson_raw = await fetch('data/map_data.geojson');
		var map_geojson_data = await map_geojson_raw.json();
		
		const tourists_raw = await fetch('data/tourists_total.json');
		var tourists_data = await tourists_raw.json();

		country_codes.set(country_codes_data)
		map_geojson.set(map_geojson_data)
		tourists.set(tourists_data)
	});
	
</script>

<main>
	<h1>Foreign Tourists</h1>
	<div class="pure-g">
		<div class="pure-u-1-1">
			<Control />
		</div>
	</div>
	<div class="pure-g">
		{#if Object.keys($country_codes).length === 0 || Object.keys($map_geojson).length === 0 || Object.keys($tourists).length === 0}
			<div class="pure-u-1-1">
				Loading data...
			</div>
		{:else}
			<!-- row 1 -->
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="CA" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="DK" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="NO" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="SE" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="FI" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="LT" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="LV" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="EE" />
				{/if}
			</div>
			<div class="pure-u-8-24">
				<!-- margin -->
			</div>
			<!-- row 2 -->
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="US" />
					<Country country="UK" />
					<Country country="IE" />
					<Country country="ES" />
					<Country country="PT" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="DE" />
					<Country country="FR" />
					<Country country="BE" />
					<Country country="NL" />
					<Country country="LU" />
					<Country country="CH" />
					<Country country="IT" />
				{/if}
			</div>
			<div class="pure-u-10-24">
				{#if $app_state.mode !== 'total'}
					<Map />
				{:else}
					<TopCountries level="total"/>
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="RU" />
					<Country country="BY" />
					<Country country="UA" />
					<Country country="GR" />
					<Country country="JP" />
				{/if}
			</div>
			<div class="pure-u-8-24">
				{#if $app_state.mode === 'bywojewodztwo'}
					<TopCountries level="wojewodztwo"/>
				{/if}
			</div>
			<!-- row 3 -->
			<div class="pure-u-4-24">
				<!-- margin -->
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="SI" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="AT" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="CZ" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="SK" />
				{/if}
			</div>
			<div class="pure-u-2-24">
				{#if $app_state.mode !== 'total'}
					<Country country="HU" />
				{/if}
			</div>
		{/if}
	</div>
	
</main>

<style>
	main {
		margin: 10px;
	}
</style>