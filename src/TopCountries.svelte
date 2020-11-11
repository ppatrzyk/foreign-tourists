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
    <p>top countries placeholder</p>
    <p>{level}</p>
</div>

<style>

</style>
