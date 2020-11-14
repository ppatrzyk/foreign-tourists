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

    let wojewodztwa = [
      {id: 'DOLNOŚLĄSKIE', text: 'Dolnośląskie'},
      {id: 'KUJAWSKO-POMORSKIE', text: 'Kujawsko-Pomorskie'},
      {id: 'LUBELSKIE', text: 'Lubelskie'},
      {id: 'LUBUSKIE', text: 'Lubuskie'},
      {id: 'ŁÓDZKIE', text: 'Łódzkie'},
      {id: 'MAZOWIECKIE', text: 'Mazowieckie'},
      {id: 'MAŁOPOLSKIE', text: 'Małopolskie'},
      {id: 'OPOLSKIE', text: 'Opolskie'},
      {id: 'PODKARPACKIE', text: 'Podkarpackie'},
      {id: 'PODLASKIE', text: 'Podlaskie'},
      {id: 'POMORSKIE', text: 'Pomorskie'},
      {id: 'ŚLĄSKIE', text: 'Śląskie'},
      {id: 'ŚWIĘTOKRZYSKIE', text: 'Świętokrzyskie'},
      {id: 'WARMIŃSKO-MAZURSKIE', text: 'Warmińsko-Mazurskie'},
      {id: 'WIELKOPOLSKIE', text: 'Wielkopolskie'},
      {id: 'ZACHODNIOPOMORSKIE', text: 'Zachodniopomorskie'}
    ]
    let selected_wojewodztwo;

    let years = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];
    let selected_year;

    $: console.log($app_state)
</script>

<div>
    <h2>Control panel</h2>
    <label for="lang">Language</label>
    <!-- svelte-ignore a11y-no-onchange -->
    <select id="lang" bind:value={selected_lang} on:change="{app_state.set_variable('language', selected_lang.id)}">
		{#each languages as language}
			<option value={language}>
				{language.text}
			</option>
		{/each}
    </select>

    <label for="mode">Mode</label>
    <!-- svelte-ignore a11y-no-onchange -->
    <select id="mode" bind:value={selected_mode} on:change="{app_state.set_variable('mode', selected_mode.id)}">
		{#each modes as mode}
			<option value={mode}>
				{mode.text}
			</option>
		{/each}
    </select>

    <label for="woj">Wojewodztwo</label>
    <!-- svelte-ignore a11y-no-onchange -->
    <select id="woj" bind:value={selected_wojewodztwo} on:change="{app_state.set_variable('wojewodztwo', selected_wojewodztwo.id)}">
		{#each wojewodztwa as wojewodztwo}
			<option value={wojewodztwo}>
				{wojewodztwo.text}
			</option>
		{/each}
    </select>

    <label for="year">Year</label>
    <!-- svelte-ignore a11y-no-onchange -->
    <select id="year" bind:value={selected_year} on:change="{app_state.set_variable('year', selected_year)}">
		{#each years as year}
			<option value={year}>
				{year}
			</option>
		{/each}
    </select>
    
</div>

<style>

</style>
