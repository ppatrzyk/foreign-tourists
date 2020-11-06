
import { writable } from "svelte/store";

const init_data = writable({
    key: 'testval'
});
const app_state = {
    subscribe: init_data.subscribe
    // TODO
    // functions for changing data here
};

export default app_state;
