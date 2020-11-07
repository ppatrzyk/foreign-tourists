
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
    set_country: (country) => {
        app_data.update((current_data) => {
            current_data['country'] = country
            return current_data
        })
    }
    // TODO
    // functions for changing data here
};

export default app_state;
