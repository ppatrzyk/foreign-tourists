
import { writable } from "svelte/store";

const init_data = writable({
    'key': 'testval'
});
const app_state = {
    subscribe: init_data.subscribe
}

export default app_state;
