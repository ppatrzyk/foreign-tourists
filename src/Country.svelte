<script>
	import { app_state } from './stores.js';
	export let country;
</script>

<div>
	<div on:click="{app_state.set_variable('country', country)}" class="myflag flag-icon-background flag-icon-{country.toLowerCase()}" />
</div>

<style>
	.myflag {
		width: 60px;
		height: 45px;
		margin: 10px;
	}
</style>
