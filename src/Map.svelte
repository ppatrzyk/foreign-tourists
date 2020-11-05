<script>
	import { json } from 'd3-fetch';

	let country_codes;
	json('data/country_codes.json').then(data => {country_codes = data; console.log(country_codes)});
</script>

<main>
	<div>map placeholder</div>
</main>

<style>

</style>