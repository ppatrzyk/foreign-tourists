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
	<div class="row">
		<h1 class="title">Foreign Tourists in Poland</h1>
	</div>
	<div class="row">
		<div class="col"><Control /></div>
		{#if Object.keys($country_codes).length === 0 || Object.keys($map_geojson).length === 0 || Object.keys($tourists).length === 0}
			<div class="col-9">
				loading data...
			</div>
		{:else}
			<div class="col-6">
				<!-- MAIN MAP CODE -->
				<!-- row 1 -->
				<div class="row">
					<div class="col-2">
						<!-- margin -->
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="DK" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="NO" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="SE" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="FI" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="LT" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="LV" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="EE" />
						{/if}
					</div>
				</div>
				<div class="row">
					<!-- row 2 -->
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<br><br><br><br>
							<Country country="CA" />
							<Country country="US" />
							<Country country="GB" />
							<Country country="IE" />
							<Country country="ES" />
							<Country country="PT" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<br><br><br><br>
							<Country country="DE" />
							<Country country="FR" />
							<Country country="BE" />
							<Country country="NL" />
							<Country country="LU" />
							<Country country="CH" />
							<Country country="IT" />
						{/if}
					</div>
					<div class="col-8">
						{#if $app_state.mode !== 'total'}
							<Map />
						{:else}
							<TopCountries level="total"/>
						{/if}
					</div>
					<div class="col-2">
						{#if $app_state.mode !== 'total'}
							<br><br><br><br>
							<Country country="RU" />
							<Country country="BY" />
							<Country country="UA" />
							<Country country="GR" />
							<Country country="CY" />
							<Country country="MT" />
							<Country country="JP" />
						{/if}
					</div>
				</div>
				<!-- row 3 -->
				<div class="row">
					<div class="col-3">
						<!-- margin -->
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="SI" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="AT" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="CZ" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="SK" />
						{/if}
					</div>
					<div class="col-1">
						{#if $app_state.mode !== 'total'}
							<Country country="HU" />
						{/if}
					</div>
				</div>
			</div>
			<div class="col">
				{#if $app_state.mode === 'bywojewodztwo'}
					<TopCountries level="wojewodztwo"/>
				{/if}
				{#if $app_state.mode === 'bycountry'}
					<TopCountries level="countryts"/>
				{/if}
			</div>
		{/if}
	</div>
</main>

<style>
	main {
		margin: 10px;
	}

	.title {
		margin: 10px;
	}
</style>