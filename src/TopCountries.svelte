<script>
    import { app_state, map_geojson, tourists } from './stores.js';

    export let level; // wojewodztwo, total
    
    function get_data(level, app_state, map_geojson, tourists) {
        var data;
        var wojewodztwo = app_state['wojewodztwo'];
        var year = app_state['year'];
        if (level == 'wojewodztwo') {
            for (var entry of map_geojson['features']) {
                var current_name = entry.properties.nazwa.toUpperCase();
                if (current_name === wojewodztwo) {
                    data = entry.properties['bywojewodztwo'][year]
                }
            }
        } else {
            data = tourists[year]
        }
        return data
    }
    $: data = get_data(level, $app_state, $map_geojson, $tourists)
    
</script>

<div>
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
                <td>
                    <span class="tableflag flag-icon-background flag-icon-{entry.country.toLowerCase()}" />
                    {entry.country}
                </td>
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
        margin: 10px;
    }
</style>
