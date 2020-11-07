
import { writable } from "svelte/store";

const app_data = writable({
    language: 'en',
    mode: 'bycountry',
    year: 2019,
    country: 'CZ',
    wojewodztwo: 'DOLNOŚLĄSKIE'
});
const app_state = {
    subscribe: app_data.subscribe
    // TODO
    // functions for changing data here
};

export default app_state;
