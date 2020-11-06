<script>
	import { json } from 'd3-fetch';
	import app_state from './stores.js';

	let country_codes;
	json('data/country_codes.json').then(data => {country_codes = data; console.log(country_codes)});
</script>

<main>
	<div>map placeholder</div>
	<div>{JSON.stringify($app_state)}</div>
</main>

<style>

</style>