<script>
	import { app_state } from './stores.js';
	export let country;
	let flagstate;
	$: if ($app_state['mode'] !== 'bycountry' || $app_state['country'] !== country) {
		flagstate = 'inactiveflag'
	} else {
		flagstate = 'activeflag'
	}
</script>

<div>
	<div on:click="{app_state.set_variable('country', country)}" class="myflag {flagstate} flag-icon-background flag-icon-{country.toLowerCase()}" />
</div>

<style>
	.myflag {
		width: 60px;
		height: 45px;
		margin-bottom: 20px;
		margin-left: 20px;
		border-radius: 5px;
		border: 1px solid black;
	}

	.activeflag {
		opacity: 1;
	}

	.inactiveflag {
		opacity: 0.5;
	}
</style>
