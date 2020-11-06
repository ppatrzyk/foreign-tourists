<script>
	import { json } from 'd3-fetch';
	import app_state from './stores.js';

	let state;
	app_state.subscribe(app_state => state = app_state);
	let country_codes;
	json('data/country_codes.json').then(data => {country_codes = data; console.log(country_codes)});
</script>

<main>
	<div>map placeholder</div>
	<div>{JSON.stringify(state)}</div>
</main>

<style>

</style>