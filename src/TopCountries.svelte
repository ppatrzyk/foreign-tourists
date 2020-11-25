<script>
    import { app_state, map_geojson, tourists, country_codes } from './stores.js';

    export let level; // wojewodztwo, total, countryts
    
    function get_data(level, app_state, map_geojson, tourists) {
        var data;
        var wojewodztwo = app_state['wojewodztwo'];
        var year = app_state['year'];
        var country = app_state['country'];
        if (level == 'wojewodztwo') {
            for (var entry of map_geojson['features']) {
                var current_name = entry.properties.nazwa.toUpperCase();
                if (current_name === wojewodztwo) {
                    data = entry.properties['bywojewodztwo'][year]
                }
            }
            // take top 15
            data = data.slice(0, 15)
        } else if (level == 'total') {
            data = tourists[year]
        } else if (level == 'countryts') {
            for (var entry of map_geojson['features']) {
                var current_name = entry.properties.nazwa.toUpperCase();
                if (current_name === wojewodztwo) {
                    data = []
                    for (let [key, value] of Object.entries(entry.properties['bycountry'])) {
                        try {
                            var current_year = value[country]
                            current_year['year'] = key
                            data.unshift(current_year)
                        } catch (error) {
                            // pass
                        }
                    }
                }
            }
        } else {
            data = {};
        }
        return data
    }
    $: data = get_data(level, $app_state, $map_geojson, $tourists)
    $: wojewodztwo = $app_state['wojewodztwo'];
    
</script>

<div class="mytable">
    {#if level !== 'total'}
        <h2>{wojewodztwo}</h2>
    {/if}
    <table class="table table-striped">
        <thead>
            <tr>
                {#if level !== 'countryts'}
                    <th>Place</th>
                {:else}
                    <th>Year</th>
                {/if}
                {#if level !== 'countryts'}
                    <th>Country</th>
                {/if}
                <th>Count</th>
                <th>Perc of all</th>
              </tr>
        </thead>
        <tbody>
            {#each data as entry, i}
                <tr>
                    {#if level !== 'countryts'}
                        <td>{i+1}</td>
                    {:else}
                        <td>{entry.year}</td>
                    {/if}
                    {#if level !== 'countryts'}
                        <td>
                            <span class="tableflag flag-icon-background flag-icon-{entry.country.toLowerCase()}" />
                            {$country_codes[entry.country]['en']}
                        </td>
                    {/if}
                    <td>{entry.count}</td>
                    <td>{Math.round( (entry.year_prop*100) * 100 + Number.EPSILON ) / 100}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .tableflag {
        display: inline-block;
		width: 1.33rem;
		height: 1rem;
		margin-right: 5px;
    }
    
    .mytable {
        margin-left: 25px;
        margin-right: 25px;
    }
</style>
