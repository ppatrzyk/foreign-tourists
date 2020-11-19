<script>
    import { app_state, map_geojson, tourists } from './stores.js';

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
            // take top 10 only
            data = data.slice(0, 10)
        } else if (level == 'total') {
            data = tourists[year]
        } else if (level == 'countryts') {
            for (var entry of map_geojson['features']) {
                var current_name = entry.properties.nazwa.toUpperCase();
                if (current_name === wojewodztwo) {
                    data = []
                    for (let [key, value] of Object.entries(entry.properties['bycountry'])) {
                        var current_year = value[country]
                        current_year['year'] = key
                        data.push(current_year)
                    }
                }
            }
            console.log(data)
        } else {
            data = {};
        }
        return data
    }
    $: data = get_data(level, $app_state, $map_geojson, $tourists)
    $: wojewodztwo = $app_state['wojewodztwo'];
    
</script>

<div>
    <h2>{wojewodztwo}</h2>
    <table class="mytable pure-table pure-table-striped">
        <thead>
            <tr>
                <th>Place</th>
                <th>Country</th>
                <th>Count</th>
                <th>Perc of all</th>
              </tr>
        </thead>
        {#each data as entry, i}
            <tr>
                <td>{i+1}</td>
                {#if level === 'countryts'}
                    <td>{entry.year}</td>
                {:else}
                    <td>
                        <span class="tableflag flag-icon-background flag-icon-{entry.country.toLowerCase()}" />
                        {entry.country}
                    </td>
                {/if}
                <td>{entry.count}</td>
                <td>{Math.round( (entry.year_prop*100) * 100 + Number.EPSILON ) / 100}</td>
            </tr>
        {/each}
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
        width: 100%;
        padding: 10px;
    }
</style>
