<script>
	import app_state from './stores.js';

	let country_codes = fetch('data/country_codes.json').then(res => res.json())
</script>

<main>
	<div>map placeholder</div>
	<div>{JSON.stringify($app_state)}</div>
	{#await country_codes}
		<p>waiting for the promise to resolve...</p>
	{:then country_codes}
		<p>The value is {JSON.stringify(country_codes)}</p>
	{/await}
</main>

<style>

</style>