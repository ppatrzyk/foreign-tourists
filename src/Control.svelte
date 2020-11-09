<script>
    import { app_state } from './stores.js';
    let languages = [
        {id: 'en', text: 'English'},
        {id: 'pl', text: 'Polski'}
    ]
    let selected_lang;
</script>

<div>
    <h2>Control panel</h2>
    <p>{JSON.stringify($app_state)}</p>
    <!-- <button on:click="{app_state.set_variable('country', country)}">{country}</button> -->
    <h3>Lang</h3>
    <select bind:value={selected_lang}>
		{#each languages as language}
			<option value={language}>
				{language.text}
			</option>
		{/each}
    </select>
    <p>{JSON.stringify(selected_lang)}</p>
</div>

<style>

</style>
