<script>
	import { app_state } from './stores.js';
	export let country;
</script>

<div>
	<div class="flag-icon flag-icon-pl" style="width:100%;height:50px" />
	<button on:click="{app_state.set_variable('country', country)}">
		<div class="myflag flag-icon-background flag-icon-gr flag-icon-squared" />
		{country}
	</button>
</div>

<style>
	.myflag {
		width: 20px;	
		height: 20px;	
	}
</style>
