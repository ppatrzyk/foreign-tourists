<script>
    import { app_state } from './stores.js';
    let languages = [
        {id: 'en', text: 'English'},
        {id: 'pl', text: 'Polski'}
    ]
    let selected_lang;

    let modes = [
        {id: 'bycountry', text: 'By country'},
        {id: 'bywojewodztwo', text: 'By województwo'},
        {id: 'total', text: 'Total'}
    ]
    let selected_mode;
</script>

<div>
    <h2>Control panel</h2>
    <p>{JSON.stringify($app_state)}</p>
    <h3>Lang</h3>
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={selected_lang} on:change="{app_state.set_variable('language', selected_lang.id)}">
		{#each languages as language}
			<option value={language}>
				{language.text}
			</option>
		{/each}
    </select>
    <h3>Mode</h3>
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={selected_mode} on:change="{app_state.set_variable('mode', selected_mode.id)}">
		{#each modes as mode}
			<option value={mode}>
				{mode.text}
			</option>
		{/each}
    </select>
</div>

<style>

</style>
