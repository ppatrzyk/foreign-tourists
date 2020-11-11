<script>
    import { app_state, map_geojson, tourists } from './stores.js';

    export let level; // wojewodztwo, total
    let data;
    var wojewodztwo = $app_state['wojewodztwo'];
    var year = $app_state['year'];
    console.log(year)
    if (level == 'wojewodztwo') {
        var map = $map_geojson;
        for (var entry of map['features']) {
            var current_name = entry.properties.nazwa.toUpperCase();
            if (current_name === wojewodztwo) {
                data = entry.properties['bywojewodztwo'][year]
            }
        }
    } else {
        data = tourists[year]
    }
    
</script>

<div>
    <p>top countries placeholder</p>
    <p>{level}</p>
</div>

<style>

</style>
