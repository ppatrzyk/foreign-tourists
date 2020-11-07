<script>
	import app_state from './stores.js';
	export let country;
</script>

<div>
	<button on:click="{app_state.set_variable('country', country)}">{country}</button>
</div>

<style>

</style>
