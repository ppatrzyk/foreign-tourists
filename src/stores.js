
import { writable } from "svelte/store";

const app_data = writable({
    language: 'en',
    mode: 'bycountry',
    year: 2019,
    country: 'CZ',
    wojewodztwo: 'DOLNOŚLĄSKIE'
});
const app_state = {
    subscribe: app_data.subscribe,
    set_variable: (variable, value) => {
        app_data.update((current_data) => {
            current_data[variable] = value
            return current_data
        })
    }
};

const country_codes = writable({});
const map_geojson = writable({});
const tourists = writable({});

export {app_state, country_codes, map_geojson, tourists};
