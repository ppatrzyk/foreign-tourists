<script>
    import { app_state, country_codes } from './stores.js';

    let modes = [
        {id: 'bywojewodztwo', text: 'By voivodeship'},
        {id: 'bycountry', text: 'By country'},
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
    let selected_year = 2019;

    let country_display
    $: try {
      country_display = $country_codes[$app_state['country']]['en']
    } catch (error) {
      country_display = 'unknown'
    }
</script>

<div>
    <h1>Foreign Tourists</h1>

    <div>
      <label for="mode">Mode</label>
      <!-- svelte-ignore a11y-no-onchange -->
      <select id="mode" bind:value={selected_mode} on:change="{app_state.set_variable('mode', selected_mode.id)}">
      {#each modes as mode}
        <option value={mode}>
          {mode.text}
        </option>
      {/each}
      </select>
    </div>

    <div>
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

    <div>
      <label for="woj">Voivodeship</label>
      <!-- svelte-ignore a11y-no-onchange -->
      <select id="woj" bind:value={selected_wojewodztwo} on:change="{app_state.set_variable('wojewodztwo', selected_wojewodztwo.id)}">
      {#each wojewodztwa as wojewodztwo}
        <option value={wojewodztwo}>
          {wojewodztwo.text}
        </option>
      {/each}
      </select>
    </div>

    <div class="desc">
      {#if $app_state['mode'] === 'total'}
        <p>
          The following table shows ranking of countries by total number of tourists in year <strong>{$app_state['year']}</strong>.
        </p>
      {:else if $app_state['mode'] == 'bycountry'}
        <p>
          The visualization shows destinations of tourists from <strong>{country_display}</strong> in year <strong>{$app_state['year']}</strong>.
          Percentage indicates the popularity of given destination (voivodeship), relative to the entrire traffic to Poland from <strong>{country_display}</strong>.
          Table displays exact number of tourists from <strong>{country_display}</strong> by year.
          Click on a flag to change the country.
        </p>
      {:else if $app_state['mode'] == 'bywojewodztwo'}
        <p>
          The visualization shows the ranking of countries within each voivodeship in year <strong>{$app_state['year']}</strong>.
          Flags on the map indicate the top country of origin for each voivodeship.
          The full ranking is currently displayed for <strong>{$app_state['wojewodztwo']}</strong> voivodeship (highlighted on the map).
          Percentage indicates what proportion of all tourists in a given voivodeship do tourists from given country account for.
        </p>
      {/if}
      <p>
        <em>Note:</em> this app requires a bigger screen to render all elements properly.
      </p>
      <p>Data source: <a href="https://api.stat.gov.pl/Home/BdlApi">Główny Urząd Statystyczny</a>.</p>
    </div>
    
</div>

<style>
  div {
    margin: 10px;
  }
  .desc {
    border: 1px solid black;
    border-radius: 20px;
    padding: 10px;
    background-color:#e6ffe6;
  }
  a {
    color: black;
    font-weight: 600;
  }
</style>
