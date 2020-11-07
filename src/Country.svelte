<script>
	import app_state from './stores.js';
	export let country;
</script>

<main>
	<button on:click="{app_state.set_country(country)}">{country}</button>
</main>

<style>

</style>
