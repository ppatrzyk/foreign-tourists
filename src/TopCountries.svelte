<script>
    import { app_state, map_geojson, tourists } from './stores.js';

    export let level; // wojewodztwo, total
    let data;
    var wojewodztwo = app_state['wojewodztwo'];
    var year = app_state['year'];
    if (level == 'wojewodztwo') {
        data = []
        // TODO
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
