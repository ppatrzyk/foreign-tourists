
import { writable } from "svelte/store";

const app_state = writable({
    'key': 'testval'
});

export default app_state;
