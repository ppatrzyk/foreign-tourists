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
    <div class="card mycard">
      <div class="card-body">
        <h3 class="card-title">Visualization</h3>
        <div class="card-text">
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <label class="input-group-text" for="mode">Mode</label>
            </div>
            <!-- svelte-ignore a11y-no-onchange -->
            <select id="mode" class="custom-select" bind:value={selected_mode} on:change="{app_state.set_variable('mode', selected_mode.id)}">
            {#each modes as mode}
              <option value={mode}>
                {mode.text}
              </option>
            {/each}
            </select>
          </div>
      
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <label class="input-group-text" for="year">Year</label>
            </div>
            <!-- svelte-ignore a11y-no-onchange -->
            <select id="year" class="custom-select" bind:value={selected_year} on:change="{app_state.set_variable('year', selected_year)}">
            {#each years as year}
              <option value={year}>
                {year}
              </option>
            {/each}
            </select>
          </div>
      
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <label class="input-group-text" for="woj">Voivodeship</label>
            </div>
            <!-- svelte-ignore a11y-no-onchange -->
            <select id="woj" class="custom-select" bind:value={selected_wojewodztwo} on:change="{app_state.set_variable('wojewodztwo', selected_wojewodztwo.id)}">
            {#each wojewodztwa as wojewodztwo}
              <option value={wojewodztwo}>
                {wojewodztwo.text}
              </option>
            {/each}
            </select>
          </div>
          <h4 class="card-title">Current mode</h4>
          {#if $app_state['mode'] === 'total'}
            <div>
              Ranking of countries by total number of tourists in year <strong>{$app_state['year']}</strong>.
            </div>
          {:else if $app_state['mode'] == 'bycountry'}
            <div>
              Distribution of destinations among tourists from <strong>{country_display}</strong> in year <strong>{$app_state['year']}</strong>.
            </div>
            <p class="additional-info">
              Percentages indicate the popularity of given destination (voivodeship), relative to the entrire traffic to Poland from <strong>{country_display}</strong>.
              Table displays exact number of tourists from <strong>{country_display}</strong> by year.
              <strong>Click on a flag to change the country.</strong>
            </p>
          {:else if $app_state['mode'] == 'bywojewodztwo'}
            <div>
              Ranking of countries within each voivodeship in <strong>{$app_state['year']}</strong>.
            </div>
            <p class="additional-info">
              Flags on the map indicate where do most tourists come from.
              The full ranking is currently displayed for <strong>{$app_state['wojewodztwo']}</strong> voivodeship (highlighted on the map).
              Percentage indicates what proportion of all tourists in a given voivodeship do tourists from given country account for.
            </p>
          {/if}
          <p>
            View source code of this app on <a href="https://github.com/ppatrzyk/foreign-tourists">Github</a>.
          </p>
          <p>
            Data source: <a href="https://bdl.stat.gov.pl/BDL/start">Główny Urząd Statystyczny</a>.
          </p>
          <p>
            Note: This data is based on number of nights spent in hotels by foreign citizens. For details, see <a href="https://bdl.stat.gov.pl/BDL/start">documentation</a> (Category K18, Group G240, Subgroup P2759).
          </p>
        </div>
      </div>
    </div>
</div>

<style>
  .mycard {
    padding: 15px !important;
    margin: 15px;
  }

  a {
    color: black;
    font-weight: 600;
  }

  .additional-info {
    margin-top: 15px;
  }
</style>
