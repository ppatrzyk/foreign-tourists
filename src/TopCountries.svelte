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
        console.log(data)
        return data
    }
    $: data = get_data(level, $app_state, $map_geojson, $tourists)
    
</script>

<div>
    <table style="width:100%">
        <tr>
          <th>Place</th>
          <th>Country</th>
          <th>Count</th>
          <th>Perc of all</th>
        </tr>
        {#each data as entry, i}
            <tr>
                <td>{i}</td>
                <td>{entry.country}</td>
                <td>{entry.count}</td>
                <td>{entry.year_prop}</td>
            </tr>
        {/each}
      </table> 
</div>

<style>

</style>
