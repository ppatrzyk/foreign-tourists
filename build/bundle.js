
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const app_data = writable({
        mode: 'bywojewodztwo',
        year: 2019,
        country: 'CZ',
        wojewodztwo: 'DOLNOŚLĄSKIE'
    });
    const app_state = {
        subscribe: app_data.subscribe,
        set_variable: (variable, value) => {
            app_data.update((current_data) => {
                current_data[variable] = value;
                return current_data
            });
        }
    };

    const country_codes = writable({});
    const map_geojson = writable({});
    const tourists = writable({});

    // https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
    class Adder {
      constructor() {
        this._partials = new Float64Array(32);
        this._n = 0;
      }
      add(x) {
        const p = this._partials;
        let i = 0;
        for (let j = 0; j < this._n && j < 32; j++) {
          const y = p[j],
            hi = x + y,
            lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
          if (lo) p[i++] = lo;
          x = hi;
        }
        p[i] = x;
        this._n = i + 1;
        return this;
      }
      valueOf() {
        const p = this._partials;
        let n = this._n, x, y, lo, hi = 0;
        if (n > 0) {
          hi = p[--n];
          while (n > 0) {
            x = hi;
            y = p[--n];
            hi = x + y;
            lo = y - (hi - x);
            if (lo) break;
          }
          if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
            y = lo * 2;
            x = hi + y;
            if (y == x - hi) hi = x;
          }
        }
        return hi;
      }
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        step = -step;
        start = Math.ceil(start * step);
        stop = Math.floor(stop * step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function* flatten(arrays) {
      for (const array of arrays) {
        yield* array;
      }
    }

    function merge(arrays) {
      return Array.from(flatten(arrays));
    }

    var epsilon = 1e-6;
    var epsilon2 = 1e-12;
    var pi = Math.PI;
    var halfPi = pi / 2;
    var quarterPi = pi / 4;
    var tau = pi * 2;

    var degrees = 180 / pi;
    var radians = pi / 180;

    var abs = Math.abs;
    var atan = Math.atan;
    var atan2 = Math.atan2;
    var cos = Math.cos;
    var exp = Math.exp;
    var log = Math.log;
    var sin = Math.sin;
    var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
    var sqrt = Math.sqrt;
    var tan = Math.tan;

    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
    }

    function asin(x) {
      return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
    }

    function noop$1() {}

    function streamGeometry(geometry, stream) {
      if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
        streamGeometryType[geometry.type](geometry, stream);
      }
    }

    var streamObjectType = {
      Feature: function(object, stream) {
        streamGeometry(object.geometry, stream);
      },
      FeatureCollection: function(object, stream) {
        var features = object.features, i = -1, n = features.length;
        while (++i < n) streamGeometry(features[i].geometry, stream);
      }
    };

    var streamGeometryType = {
      Sphere: function(object, stream) {
        stream.sphere();
      },
      Point: function(object, stream) {
        object = object.coordinates;
        stream.point(object[0], object[1], object[2]);
      },
      MultiPoint: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
      },
      LineString: function(object, stream) {
        streamLine(object.coordinates, stream, 0);
      },
      MultiLineString: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamLine(coordinates[i], stream, 0);
      },
      Polygon: function(object, stream) {
        streamPolygon(object.coordinates, stream);
      },
      MultiPolygon: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamPolygon(coordinates[i], stream);
      },
      GeometryCollection: function(object, stream) {
        var geometries = object.geometries, i = -1, n = geometries.length;
        while (++i < n) streamGeometry(geometries[i], stream);
      }
    };

    function streamLine(coordinates, stream, closed) {
      var i = -1, n = coordinates.length - closed, coordinate;
      stream.lineStart();
      while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
      stream.lineEnd();
    }

    function streamPolygon(coordinates, stream) {
      var i = -1, n = coordinates.length;
      stream.polygonStart();
      while (++i < n) streamLine(coordinates[i], stream, 1);
      stream.polygonEnd();
    }

    function geoStream(object, stream) {
      if (object && streamObjectType.hasOwnProperty(object.type)) {
        streamObjectType[object.type](object, stream);
      } else {
        streamGeometry(object, stream);
      }
    }

    function spherical(cartesian) {
      return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
    }

    function cartesian(spherical) {
      var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
      return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
    }

    function cartesianDot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function cartesianCross(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    // TODO return a
    function cartesianAddInPlace(a, b) {
      a[0] += b[0], a[1] += b[1], a[2] += b[2];
    }

    function cartesianScale(vector, k) {
      return [vector[0] * k, vector[1] * k, vector[2] * k];
    }

    // TODO return d
    function cartesianNormalizeInPlace(d) {
      var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      d[0] /= l, d[1] /= l, d[2] /= l;
    }

    function compose(a, b) {

      function compose(x, y) {
        return x = a(x, y), b(x[0], x[1]);
      }

      if (a.invert && b.invert) compose.invert = function(x, y) {
        return x = b.invert(x, y), x && a.invert(x[0], x[1]);
      };

      return compose;
    }

    function rotationIdentity(lambda, phi) {
      return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
    }

    rotationIdentity.invert = rotationIdentity;

    function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
      return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
        : rotationLambda(deltaLambda))
        : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
        : rotationIdentity);
    }

    function forwardRotationLambda(deltaLambda) {
      return function(lambda, phi) {
        return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
      };
    }

    function rotationLambda(deltaLambda) {
      var rotation = forwardRotationLambda(deltaLambda);
      rotation.invert = forwardRotationLambda(-deltaLambda);
      return rotation;
    }

    function rotationPhiGamma(deltaPhi, deltaGamma) {
      var cosDeltaPhi = cos(deltaPhi),
          sinDeltaPhi = sin(deltaPhi),
          cosDeltaGamma = cos(deltaGamma),
          sinDeltaGamma = sin(deltaGamma);

      function rotation(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaPhi + x * sinDeltaPhi;
        return [
          atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
          asin(k * cosDeltaGamma + y * sinDeltaGamma)
        ];
      }

      rotation.invert = function(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaGamma - y * sinDeltaGamma;
        return [
          atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
          asin(k * cosDeltaPhi - x * sinDeltaPhi)
        ];
      };

      return rotation;
    }

    function rotation(rotate) {
      rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

      function forward(coordinates) {
        coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
        return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
      }

      forward.invert = function(coordinates) {
        coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
        return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
      };

      return forward;
    }

    // Generates a circle centered at [0°, 0°], with a given radius and precision.
    function circleStream(stream, radius, delta, direction, t0, t1) {
      if (!delta) return;
      var cosRadius = cos(radius),
          sinRadius = sin(radius),
          step = direction * delta;
      if (t0 == null) {
        t0 = radius + direction * tau;
        t1 = radius - step / 2;
      } else {
        t0 = circleRadius(cosRadius, t0);
        t1 = circleRadius(cosRadius, t1);
        if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
      }
      for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
        point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
        stream.point(point[0], point[1]);
      }
    }

    // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
    function circleRadius(cosRadius, point) {
      point = cartesian(point), point[0] -= cosRadius;
      cartesianNormalizeInPlace(point);
      var radius = acos(-point[1]);
      return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
    }

    function clipBuffer() {
      var lines = [],
          line;
      return {
        point: function(x, y, m) {
          line.push([x, y, m]);
        },
        lineStart: function() {
          lines.push(line = []);
        },
        lineEnd: noop$1,
        rejoin: function() {
          if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
        },
        result: function() {
          var result = lines;
          lines = [];
          line = null;
          return result;
        }
      };
    }

    function pointEqual(a, b) {
      return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
    }

    function Intersection(point, points, other, entry) {
      this.x = point;
      this.z = points;
      this.o = other; // another intersection
      this.e = entry; // is an entry?
      this.v = false; // visited
      this.n = this.p = null; // next & previous
    }

    // A generalized polygon clipping algorithm: given a polygon that has been cut
    // into its visible line segments, and rejoins the segments by interpolating
    // along the clip edge.
    function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
      var subject = [],
          clip = [],
          i,
          n;

      segments.forEach(function(segment) {
        if ((n = segment.length - 1) <= 0) return;
        var n, p0 = segment[0], p1 = segment[n], x;

        if (pointEqual(p0, p1)) {
          if (!p0[2] && !p1[2]) {
            stream.lineStart();
            for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
            stream.lineEnd();
            return;
          }
          // handle degenerate cases by moving the point
          p1[0] += 2 * epsilon;
        }

        subject.push(x = new Intersection(p0, segment, null, true));
        clip.push(x.o = new Intersection(p0, null, x, false));
        subject.push(x = new Intersection(p1, segment, null, false));
        clip.push(x.o = new Intersection(p1, null, x, true));
      });

      if (!subject.length) return;

      clip.sort(compareIntersection);
      link(subject);
      link(clip);

      for (i = 0, n = clip.length; i < n; ++i) {
        clip[i].e = startInside = !startInside;
      }

      var start = subject[0],
          points,
          point;

      while (1) {
        // Find first unvisited intersection.
        var current = start,
            isSubject = true;
        while (current.v) if ((current = current.n) === start) return;
        points = current.z;
        stream.lineStart();
        do {
          current.v = current.o.v = true;
          if (current.e) {
            if (isSubject) {
              for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.n.x, 1, stream);
            }
            current = current.n;
          } else {
            if (isSubject) {
              points = current.p.z;
              for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.p.x, -1, stream);
            }
            current = current.p;
          }
          current = current.o;
          points = current.z;
          isSubject = !isSubject;
        } while (!current.v);
        stream.lineEnd();
      }
    }

    function link(array) {
      if (!(n = array.length)) return;
      var n,
          i = 0,
          a = array[0],
          b;
      while (++i < n) {
        a.n = b = array[i];
        b.p = a;
        a = b;
      }
      a.n = b = array[0];
      b.p = a;
    }

    function longitude(point) {
      if (abs(point[0]) <= pi)
        return point[0];
      else
        return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
    }

    function polygonContains(polygon, point) {
      var lambda = longitude(point),
          phi = point[1],
          sinPhi = sin(phi),
          normal = [sin(lambda), -cos(lambda), 0],
          angle = 0,
          winding = 0;

      var sum = new Adder();

      if (sinPhi === 1) phi = halfPi + epsilon;
      else if (sinPhi === -1) phi = -halfPi - epsilon;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        if (!(m = (ring = polygon[i]).length)) continue;
        var ring,
            m,
            point0 = ring[m - 1],
            lambda0 = longitude(point0),
            phi0 = point0[1] / 2 + quarterPi,
            sinPhi0 = sin(phi0),
            cosPhi0 = cos(phi0);

        for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
          var point1 = ring[j],
              lambda1 = longitude(point1),
              phi1 = point1[1] / 2 + quarterPi,
              sinPhi1 = sin(phi1),
              cosPhi1 = cos(phi1),
              delta = lambda1 - lambda0,
              sign = delta >= 0 ? 1 : -1,
              absDelta = sign * delta,
              antimeridian = absDelta > pi,
              k = sinPhi0 * sinPhi1;

          sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
          angle += antimeridian ? delta + sign * tau : delta;

          // Are the longitudes either side of the point’s meridian (lambda),
          // and are the latitudes smaller than the parallel (phi)?
          if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
            var arc = cartesianCross(cartesian(point0), cartesian(point1));
            cartesianNormalizeInPlace(arc);
            var intersection = cartesianCross(normal, arc);
            cartesianNormalizeInPlace(intersection);
            var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
            if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
              winding += antimeridian ^ delta >= 0 ? 1 : -1;
            }
          }
        }
      }

      // First, determine whether the South pole is inside or outside:
      //
      // It is inside if:
      // * the polygon winds around it in a clockwise direction.
      // * the polygon does not (cumulatively) wind around it, but has a negative
      //   (counter-clockwise) area.
      //
      // Second, count the (signed) number of times a segment crosses a lambda
      // from the point to the South pole.  If it is zero, then the point is the
      // same side as the South pole.

      return (angle < -epsilon || angle < epsilon && sum < -epsilon2) ^ (winding & 1);
    }

    function clip(pointVisible, clipLine, interpolate, start) {
      return function(sink) {
        var line = clipLine(sink),
            ringBuffer = clipBuffer(),
            ringSink = clipLine(ringBuffer),
            polygonStarted = false,
            polygon,
            segments,
            ring;

        var clip = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() {
            clip.point = pointRing;
            clip.lineStart = ringStart;
            clip.lineEnd = ringEnd;
            segments = [];
            polygon = [];
          },
          polygonEnd: function() {
            clip.point = point;
            clip.lineStart = lineStart;
            clip.lineEnd = lineEnd;
            segments = merge(segments);
            var startInside = polygonContains(polygon, start);
            if (segments.length) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
            } else if (startInside) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              interpolate(null, null, 1, sink);
              sink.lineEnd();
            }
            if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
            segments = polygon = null;
          },
          sphere: function() {
            sink.polygonStart();
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
            sink.polygonEnd();
          }
        };

        function point(lambda, phi) {
          if (pointVisible(lambda, phi)) sink.point(lambda, phi);
        }

        function pointLine(lambda, phi) {
          line.point(lambda, phi);
        }

        function lineStart() {
          clip.point = pointLine;
          line.lineStart();
        }

        function lineEnd() {
          clip.point = point;
          line.lineEnd();
        }

        function pointRing(lambda, phi) {
          ring.push([lambda, phi]);
          ringSink.point(lambda, phi);
        }

        function ringStart() {
          ringSink.lineStart();
          ring = [];
        }

        function ringEnd() {
          pointRing(ring[0][0], ring[0][1]);
          ringSink.lineEnd();

          var clean = ringSink.clean(),
              ringSegments = ringBuffer.result(),
              i, n = ringSegments.length, m,
              segment,
              point;

          ring.pop();
          polygon.push(ring);
          ring = null;

          if (!n) return;

          // No intersections.
          if (clean & 1) {
            segment = ringSegments[0];
            if ((m = segment.length - 1) > 0) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
              sink.lineEnd();
            }
            return;
          }

          // Rejoin connected segments.
          // TODO reuse ringBuffer.rejoin()?
          if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

          segments.push(ringSegments.filter(validSegment));
        }

        return clip;
      };
    }

    function validSegment(segment) {
      return segment.length > 1;
    }

    // Intersections are sorted along the clip edge. For both antimeridian cutting
    // and circle clipping, the same comparison is used.
    function compareIntersection(a, b) {
      return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
           - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
    }

    var clipAntimeridian = clip(
      function() { return true; },
      clipAntimeridianLine,
      clipAntimeridianInterpolate,
      [-pi, -halfPi]
    );

    // Takes a line and cuts into visible segments. Return values: 0 - there were
    // intersections or the line was empty; 1 - no intersections; 2 - there were
    // intersections, and the first and last segments should be rejoined.
    function clipAntimeridianLine(stream) {
      var lambda0 = NaN,
          phi0 = NaN,
          sign0 = NaN,
          clean; // no intersections

      return {
        lineStart: function() {
          stream.lineStart();
          clean = 1;
        },
        point: function(lambda1, phi1) {
          var sign1 = lambda1 > 0 ? pi : -pi,
              delta = abs(lambda1 - lambda0);
          if (abs(delta - pi) < epsilon) { // line crosses a pole
            stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            stream.point(lambda1, phi0);
            clean = 0;
          } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
            if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
            if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
            phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            clean = 0;
          }
          stream.point(lambda0 = lambda1, phi0 = phi1);
          sign0 = sign1;
        },
        lineEnd: function() {
          stream.lineEnd();
          lambda0 = phi0 = NaN;
        },
        clean: function() {
          return 2 - clean; // if intersections, rejoin first and last segments
        }
      };
    }

    function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
      var cosPhi0,
          cosPhi1,
          sinLambda0Lambda1 = sin(lambda0 - lambda1);
      return abs(sinLambda0Lambda1) > epsilon
          ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
              - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
              / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
          : (phi0 + phi1) / 2;
    }

    function clipAntimeridianInterpolate(from, to, direction, stream) {
      var phi;
      if (from == null) {
        phi = direction * halfPi;
        stream.point(-pi, phi);
        stream.point(0, phi);
        stream.point(pi, phi);
        stream.point(pi, 0);
        stream.point(pi, -phi);
        stream.point(0, -phi);
        stream.point(-pi, -phi);
        stream.point(-pi, 0);
        stream.point(-pi, phi);
      } else if (abs(from[0] - to[0]) > epsilon) {
        var lambda = from[0] < to[0] ? pi : -pi;
        phi = direction * lambda / 2;
        stream.point(-lambda, phi);
        stream.point(0, phi);
        stream.point(lambda, phi);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function clipCircle(radius) {
      var cr = cos(radius),
          delta = 6 * radians,
          smallRadius = cr > 0,
          notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

      function interpolate(from, to, direction, stream) {
        circleStream(stream, radius, delta, direction, from, to);
      }

      function visible(lambda, phi) {
        return cos(lambda) * cos(phi) > cr;
      }

      // Takes a line and cuts into visible segments. Return values used for polygon
      // clipping: 0 - there were intersections or the line was empty; 1 - no
      // intersections 2 - there were intersections, and the first and last segments
      // should be rejoined.
      function clipLine(stream) {
        var point0, // previous point
            c0, // code for previous point
            v0, // visibility of previous point
            v00, // visibility of first point
            clean; // no intersections
        return {
          lineStart: function() {
            v00 = v0 = false;
            clean = 1;
          },
          point: function(lambda, phi) {
            var point1 = [lambda, phi],
                point2,
                v = visible(lambda, phi),
                c = smallRadius
                  ? v ? 0 : code(lambda, phi)
                  : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
            if (!point0 && (v00 = v0 = v)) stream.lineStart();
            if (v !== v0) {
              point2 = intersect(point0, point1);
              if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
                point1[2] = 1;
            }
            if (v !== v0) {
              clean = 0;
              if (v) {
                // outside going in
                stream.lineStart();
                point2 = intersect(point1, point0);
                stream.point(point2[0], point2[1]);
              } else {
                // inside going out
                point2 = intersect(point0, point1);
                stream.point(point2[0], point2[1], 2);
                stream.lineEnd();
              }
              point0 = point2;
            } else if (notHemisphere && point0 && smallRadius ^ v) {
              var t;
              // If the codes for two points are different, or are both zero,
              // and there this segment intersects with the small circle.
              if (!(c & c0) && (t = intersect(point1, point0, true))) {
                clean = 0;
                if (smallRadius) {
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                } else {
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1], 3);
                }
              }
            }
            if (v && (!point0 || !pointEqual(point0, point1))) {
              stream.point(point1[0], point1[1]);
            }
            point0 = point1, v0 = v, c0 = c;
          },
          lineEnd: function() {
            if (v0) stream.lineEnd();
            point0 = null;
          },
          // Rejoin first and last segments if there were intersections and the first
          // and last points were visible.
          clean: function() {
            return clean | ((v00 && v0) << 1);
          }
        };
      }

      // Intersects the great circle between a and b with the clip circle.
      function intersect(a, b, two) {
        var pa = cartesian(a),
            pb = cartesian(b);

        // We have two planes, n1.p = d1 and n2.p = d2.
        // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
        var n1 = [1, 0, 0], // normal
            n2 = cartesianCross(pa, pb),
            n2n2 = cartesianDot(n2, n2),
            n1n2 = n2[0], // cartesianDot(n1, n2),
            determinant = n2n2 - n1n2 * n1n2;

        // Two polar points.
        if (!determinant) return !two && a;

        var c1 =  cr * n2n2 / determinant,
            c2 = -cr * n1n2 / determinant,
            n1xn2 = cartesianCross(n1, n2),
            A = cartesianScale(n1, c1),
            B = cartesianScale(n2, c2);
        cartesianAddInPlace(A, B);

        // Solve |p(t)|^2 = 1.
        var u = n1xn2,
            w = cartesianDot(A, u),
            uu = cartesianDot(u, u),
            t2 = w * w - uu * (cartesianDot(A, A) - 1);

        if (t2 < 0) return;

        var t = sqrt(t2),
            q = cartesianScale(u, (-w - t) / uu);
        cartesianAddInPlace(q, A);
        q = spherical(q);

        if (!two) return q;

        // Two intersection points.
        var lambda0 = a[0],
            lambda1 = b[0],
            phi0 = a[1],
            phi1 = b[1],
            z;

        if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

        var delta = lambda1 - lambda0,
            polar = abs(delta - pi) < epsilon,
            meridian = polar || delta < epsilon;

        if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

        // Check that the first point is between a and b.
        if (meridian
            ? polar
              ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
              : phi0 <= q[1] && q[1] <= phi1
            : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
          var q1 = cartesianScale(u, (-w + t) / uu);
          cartesianAddInPlace(q1, A);
          return [q, spherical(q1)];
        }
      }

      // Generates a 4-bit vector representing the location of a point relative to
      // the small circle's bounding box.
      function code(lambda, phi) {
        var r = smallRadius ? radius : pi - radius,
            code = 0;
        if (lambda < -r) code |= 1; // left
        else if (lambda > r) code |= 2; // right
        if (phi < -r) code |= 4; // below
        else if (phi > r) code |= 8; // above
        return code;
      }

      return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
    }

    function clipLine(a, b, x0, y0, x1, y1) {
      var ax = a[0],
          ay = a[1],
          bx = b[0],
          by = b[1],
          t0 = 0,
          t1 = 1,
          dx = bx - ax,
          dy = by - ay,
          r;

      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
      if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
      return true;
    }

    var clipMax = 1e9, clipMin = -clipMax;

    // TODO Use d3-polygon’s polygonContains here for the ring check?
    // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

    function clipRectangle(x0, y0, x1, y1) {

      function visible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }

      function interpolate(from, to, direction, stream) {
        var a = 0, a1 = 0;
        if (from == null
            || (a = corner(from, direction)) !== (a1 = corner(to, direction))
            || comparePoint(from, to) < 0 ^ direction > 0) {
          do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          stream.point(to[0], to[1]);
        }
      }

      function corner(p, direction) {
        return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
            : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
            : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
            : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
      }

      function compareIntersection(a, b) {
        return comparePoint(a.x, b.x);
      }

      function comparePoint(a, b) {
        var ca = corner(a, 1),
            cb = corner(b, 1);
        return ca !== cb ? ca - cb
            : ca === 0 ? b[1] - a[1]
            : ca === 1 ? a[0] - b[0]
            : ca === 2 ? a[1] - b[1]
            : b[0] - a[0];
      }

      return function(stream) {
        var activeStream = stream,
            bufferStream = clipBuffer(),
            segments,
            polygon,
            ring,
            x__, y__, v__, // first point
            x_, y_, v_, // previous point
            first,
            clean;

        var clipStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: polygonStart,
          polygonEnd: polygonEnd
        };

        function point(x, y) {
          if (visible(x, y)) activeStream.point(x, y);
        }

        function polygonInside() {
          var winding = 0;

          for (var i = 0, n = polygon.length; i < n; ++i) {
            for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
              a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
              if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
              else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
            }
          }

          return winding;
        }

        // Buffer geometry within a polygon and then clip it en masse.
        function polygonStart() {
          activeStream = bufferStream, segments = [], polygon = [], clean = true;
        }

        function polygonEnd() {
          var startInside = polygonInside(),
              cleanInside = clean && startInside,
              visible = (segments = merge(segments)).length;
          if (cleanInside || visible) {
            stream.polygonStart();
            if (cleanInside) {
              stream.lineStart();
              interpolate(null, null, 1, stream);
              stream.lineEnd();
            }
            if (visible) {
              clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
            }
            stream.polygonEnd();
          }
          activeStream = stream, segments = polygon = ring = null;
        }

        function lineStart() {
          clipStream.point = linePoint;
          if (polygon) polygon.push(ring = []);
          first = true;
          v_ = false;
          x_ = y_ = NaN;
        }

        // TODO rather than special-case polygons, simply handle them separately.
        // Ideally, coincident intersection points should be jittered to avoid
        // clipping issues.
        function lineEnd() {
          if (segments) {
            linePoint(x__, y__);
            if (v__ && v_) bufferStream.rejoin();
            segments.push(bufferStream.result());
          }
          clipStream.point = point;
          if (v_) activeStream.lineEnd();
        }

        function linePoint(x, y) {
          var v = visible(x, y);
          if (polygon) ring.push([x, y]);
          if (first) {
            x__ = x, y__ = y, v__ = v;
            first = false;
            if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
            }
          } else {
            if (v && v_) activeStream.point(x, y);
            else {
              var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                  b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
              if (clipLine(a, b, x0, y0, x1, y1)) {
                if (!v_) {
                  activeStream.lineStart();
                  activeStream.point(a[0], a[1]);
                }
                activeStream.point(b[0], b[1]);
                if (!v) activeStream.lineEnd();
                clean = false;
              } else if (v) {
                activeStream.lineStart();
                activeStream.point(x, y);
                clean = false;
              }
            }
          }
          x_ = x, y_ = y, v_ = v;
        }

        return clipStream;
      };
    }

    var identity = x => x;

    var areaSum = new Adder(),
        areaRingSum = new Adder(),
        x00,
        y00,
        x0,
        y0;

    var areaStream = {
      point: noop$1,
      lineStart: noop$1,
      lineEnd: noop$1,
      polygonStart: function() {
        areaStream.lineStart = areaRingStart;
        areaStream.lineEnd = areaRingEnd;
      },
      polygonEnd: function() {
        areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$1;
        areaSum.add(abs(areaRingSum));
        areaRingSum = new Adder();
      },
      result: function() {
        var area = areaSum / 2;
        areaSum = new Adder();
        return area;
      }
    };

    function areaRingStart() {
      areaStream.point = areaPointFirst;
    }

    function areaPointFirst(x, y) {
      areaStream.point = areaPoint;
      x00 = x0 = x, y00 = y0 = y;
    }

    function areaPoint(x, y) {
      areaRingSum.add(y0 * x - x0 * y);
      x0 = x, y0 = y;
    }

    function areaRingEnd() {
      areaPoint(x00, y00);
    }

    var x0$1 = Infinity,
        y0$1 = x0$1,
        x1 = -x0$1,
        y1 = x1;

    var boundsStream = {
      point: boundsPoint,
      lineStart: noop$1,
      lineEnd: noop$1,
      polygonStart: noop$1,
      polygonEnd: noop$1,
      result: function() {
        var bounds = [[x0$1, y0$1], [x1, y1]];
        x1 = y1 = -(y0$1 = x0$1 = Infinity);
        return bounds;
      }
    };

    function boundsPoint(x, y) {
      if (x < x0$1) x0$1 = x;
      if (x > x1) x1 = x;
      if (y < y0$1) y0$1 = y;
      if (y > y1) y1 = y;
    }

    // TODO Enforce positive area for exterior, negative area for interior?

    var X0 = 0,
        Y0 = 0,
        Z0 = 0,
        X1 = 0,
        Y1 = 0,
        Z1 = 0,
        X2 = 0,
        Y2 = 0,
        Z2 = 0,
        x00$1,
        y00$1,
        x0$2,
        y0$2;

    var centroidStream = {
      point: centroidPoint,
      lineStart: centroidLineStart,
      lineEnd: centroidLineEnd,
      polygonStart: function() {
        centroidStream.lineStart = centroidRingStart;
        centroidStream.lineEnd = centroidRingEnd;
      },
      polygonEnd: function() {
        centroidStream.point = centroidPoint;
        centroidStream.lineStart = centroidLineStart;
        centroidStream.lineEnd = centroidLineEnd;
      },
      result: function() {
        var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
            : Z1 ? [X1 / Z1, Y1 / Z1]
            : Z0 ? [X0 / Z0, Y0 / Z0]
            : [NaN, NaN];
        X0 = Y0 = Z0 =
        X1 = Y1 = Z1 =
        X2 = Y2 = Z2 = 0;
        return centroid;
      }
    };

    function centroidPoint(x, y) {
      X0 += x;
      Y0 += y;
      ++Z0;
    }

    function centroidLineStart() {
      centroidStream.point = centroidPointFirstLine;
    }

    function centroidPointFirstLine(x, y) {
      centroidStream.point = centroidPointLine;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidPointLine(x, y) {
      var dx = x - x0$2, dy = y - y0$2, z = sqrt(dx * dx + dy * dy);
      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidLineEnd() {
      centroidStream.point = centroidPoint;
    }

    function centroidRingStart() {
      centroidStream.point = centroidPointFirstRing;
    }

    function centroidRingEnd() {
      centroidPointRing(x00$1, y00$1);
    }

    function centroidPointFirstRing(x, y) {
      centroidStream.point = centroidPointRing;
      centroidPoint(x00$1 = x0$2 = x, y00$1 = y0$2 = y);
    }

    function centroidPointRing(x, y) {
      var dx = x - x0$2,
          dy = y - y0$2,
          z = sqrt(dx * dx + dy * dy);

      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;

      z = y0$2 * x - x0$2 * y;
      X2 += z * (x0$2 + x);
      Y2 += z * (y0$2 + y);
      Z2 += z * 3;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function PathContext(context) {
      this._context = context;
    }

    PathContext.prototype = {
      _radius: 4.5,
      pointRadius: function(_) {
        return this._radius = _, this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._context.closePath();
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._context.moveTo(x, y);
            this._point = 1;
            break;
          }
          case 1: {
            this._context.lineTo(x, y);
            break;
          }
          default: {
            this._context.moveTo(x + this._radius, y);
            this._context.arc(x, y, this._radius, 0, tau);
            break;
          }
        }
      },
      result: noop$1
    };

    var lengthSum = new Adder(),
        lengthRing,
        x00$2,
        y00$2,
        x0$3,
        y0$3;

    var lengthStream = {
      point: noop$1,
      lineStart: function() {
        lengthStream.point = lengthPointFirst;
      },
      lineEnd: function() {
        if (lengthRing) lengthPoint(x00$2, y00$2);
        lengthStream.point = noop$1;
      },
      polygonStart: function() {
        lengthRing = true;
      },
      polygonEnd: function() {
        lengthRing = null;
      },
      result: function() {
        var length = +lengthSum;
        lengthSum = new Adder();
        return length;
      }
    };

    function lengthPointFirst(x, y) {
      lengthStream.point = lengthPoint;
      x00$2 = x0$3 = x, y00$2 = y0$3 = y;
    }

    function lengthPoint(x, y) {
      x0$3 -= x, y0$3 -= y;
      lengthSum.add(sqrt(x0$3 * x0$3 + y0$3 * y0$3));
      x0$3 = x, y0$3 = y;
    }

    function PathString() {
      this._string = [];
    }

    PathString.prototype = {
      _radius: 4.5,
      _circle: circle(4.5),
      pointRadius: function(_) {
        if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
        return this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._string.push("Z");
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._string.push("M", x, ",", y);
            this._point = 1;
            break;
          }
          case 1: {
            this._string.push("L", x, ",", y);
            break;
          }
          default: {
            if (this._circle == null) this._circle = circle(this._radius);
            this._string.push("M", x, ",", y, this._circle);
            break;
          }
        }
      },
      result: function() {
        if (this._string.length) {
          var result = this._string.join("");
          this._string = [];
          return result;
        } else {
          return null;
        }
      }
    };

    function circle(radius) {
      return "m0," + radius
          + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
          + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
          + "z";
    }

    function geoPath(projection, context) {
      var pointRadius = 4.5,
          projectionStream,
          contextStream;

      function path(object) {
        if (object) {
          if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
          geoStream(object, projectionStream(contextStream));
        }
        return contextStream.result();
      }

      path.area = function(object) {
        geoStream(object, projectionStream(areaStream));
        return areaStream.result();
      };

      path.measure = function(object) {
        geoStream(object, projectionStream(lengthStream));
        return lengthStream.result();
      };

      path.bounds = function(object) {
        geoStream(object, projectionStream(boundsStream));
        return boundsStream.result();
      };

      path.centroid = function(object) {
        geoStream(object, projectionStream(centroidStream));
        return centroidStream.result();
      };

      path.projection = function(_) {
        return arguments.length ? (projectionStream = _ == null ? (projection = null, identity) : (projection = _).stream, path) : projection;
      };

      path.context = function(_) {
        if (!arguments.length) return context;
        contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
        if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
        return path;
      };

      path.pointRadius = function(_) {
        if (!arguments.length) return pointRadius;
        pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
        return path;
      };

      return path.projection(projection).context(context);
    }

    function transformer(methods) {
      return function(stream) {
        var s = new TransformStream;
        for (var key in methods) s[key] = methods[key];
        s.stream = stream;
        return s;
      };
    }

    function TransformStream() {}

    TransformStream.prototype = {
      constructor: TransformStream,
      point: function(x, y) { this.stream.point(x, y); },
      sphere: function() { this.stream.sphere(); },
      lineStart: function() { this.stream.lineStart(); },
      lineEnd: function() { this.stream.lineEnd(); },
      polygonStart: function() { this.stream.polygonStart(); },
      polygonEnd: function() { this.stream.polygonEnd(); }
    };

    function fit(projection, fitBounds, object) {
      var clip = projection.clipExtent && projection.clipExtent();
      projection.scale(150).translate([0, 0]);
      if (clip != null) projection.clipExtent(null);
      geoStream(object, projection.stream(boundsStream));
      fitBounds(boundsStream.result());
      if (clip != null) projection.clipExtent(clip);
      return projection;
    }

    function fitExtent(projection, extent, object) {
      return fit(projection, function(b) {
        var w = extent[1][0] - extent[0][0],
            h = extent[1][1] - extent[0][1],
            k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
            x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
            y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitSize(projection, size, object) {
      return fitExtent(projection, [[0, 0], size], object);
    }

    function fitWidth(projection, width, object) {
      return fit(projection, function(b) {
        var w = +width,
            k = w / (b[1][0] - b[0][0]),
            x = (w - k * (b[1][0] + b[0][0])) / 2,
            y = -k * b[0][1];
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitHeight(projection, height, object) {
      return fit(projection, function(b) {
        var h = +height,
            k = h / (b[1][1] - b[0][1]),
            x = -k * b[0][0],
            y = (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    var maxDepth = 16, // maximum depth of subdivision
        cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

    function resample(project, delta2) {
      return +delta2 ? resample$1(project, delta2) : resampleNone(project);
    }

    function resampleNone(project) {
      return transformer({
        point: function(x, y) {
          x = project(x, y);
          this.stream.point(x[0], x[1]);
        }
      });
    }

    function resample$1(project, delta2) {

      function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
        var dx = x1 - x0,
            dy = y1 - y0,
            d2 = dx * dx + dy * dy;
        if (d2 > 4 * delta2 && depth--) {
          var a = a0 + a1,
              b = b0 + b1,
              c = c0 + c1,
              m = sqrt(a * a + b * b + c * c),
              phi2 = asin(c /= m),
              lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
              p = project(lambda2, phi2),
              x2 = p[0],
              y2 = p[1],
              dx2 = x2 - x0,
              dy2 = y2 - y0,
              dz = dy * dx2 - dx * dy2;
          if (dz * dz / d2 > delta2 // perpendicular projected distance
              || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
              || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
            resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
            stream.point(x2, y2);
            resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
          }
        }
      }
      return function(stream) {
        var lambda00, x00, y00, a00, b00, c00, // first point
            lambda0, x0, y0, a0, b0, c0; // previous point

        var resampleStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
          polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
        };

        function point(x, y) {
          x = project(x, y);
          stream.point(x[0], x[1]);
        }

        function lineStart() {
          x0 = NaN;
          resampleStream.point = linePoint;
          stream.lineStart();
        }

        function linePoint(lambda, phi) {
          var c = cartesian([lambda, phi]), p = project(lambda, phi);
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
          stream.point(x0, y0);
        }

        function lineEnd() {
          resampleStream.point = point;
          stream.lineEnd();
        }

        function ringStart() {
          lineStart();
          resampleStream.point = ringPoint;
          resampleStream.lineEnd = ringEnd;
        }

        function ringPoint(lambda, phi) {
          linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resampleStream.point = linePoint;
        }

        function ringEnd() {
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
          resampleStream.lineEnd = lineEnd;
          lineEnd();
        }

        return resampleStream;
      };
    }

    var transformRadians = transformer({
      point: function(x, y) {
        this.stream.point(x * radians, y * radians);
      }
    });

    function transformRotate(rotate) {
      return transformer({
        point: function(x, y) {
          var r = rotate(x, y);
          return this.stream.point(r[0], r[1]);
        }
      });
    }

    function scaleTranslate(k, dx, dy, sx, sy) {
      function transform(x, y) {
        x *= sx; y *= sy;
        return [dx + k * x, dy - k * y];
      }
      transform.invert = function(x, y) {
        return [(x - dx) / k * sx, (dy - y) / k * sy];
      };
      return transform;
    }

    function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
      if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
      var cosAlpha = cos(alpha),
          sinAlpha = sin(alpha),
          a = cosAlpha * k,
          b = sinAlpha * k,
          ai = cosAlpha / k,
          bi = sinAlpha / k,
          ci = (sinAlpha * dy - cosAlpha * dx) / k,
          fi = (sinAlpha * dx + cosAlpha * dy) / k;
      function transform(x, y) {
        x *= sx; y *= sy;
        return [a * x - b * y + dx, dy - b * x - a * y];
      }
      transform.invert = function(x, y) {
        return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
      };
      return transform;
    }

    function projection(project) {
      return projectionMutator(function() { return project; })();
    }

    function projectionMutator(projectAt) {
      var project,
          k = 150, // scale
          x = 480, y = 250, // translate
          lambda = 0, phi = 0, // center
          deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
          alpha = 0, // post-rotate angle
          sx = 1, // reflectX
          sy = 1, // reflectX
          theta = null, preclip = clipAntimeridian, // pre-clip angle
          x0 = null, y0, x1, y1, postclip = identity, // post-clip extent
          delta2 = 0.5, // precision
          projectResample,
          projectTransform,
          projectRotateTransform,
          cache,
          cacheStream;

      function projection(point) {
        return projectRotateTransform(point[0] * radians, point[1] * radians);
      }

      function invert(point) {
        point = projectRotateTransform.invert(point[0], point[1]);
        return point && [point[0] * degrees, point[1] * degrees];
      }

      projection.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
      };

      projection.preclip = function(_) {
        return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
      };

      projection.postclip = function(_) {
        return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
      };

      projection.clipAngle = function(_) {
        return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
      };

      projection.clipExtent = function(_) {
        return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      projection.scale = function(_) {
        return arguments.length ? (k = +_, recenter()) : k;
      };

      projection.translate = function(_) {
        return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
      };

      projection.center = function(_) {
        return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
      };

      projection.rotate = function(_) {
        return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
      };

      projection.angle = function(_) {
        return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
      };

      projection.reflectX = function(_) {
        return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
      };

      projection.reflectY = function(_) {
        return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
      };

      projection.precision = function(_) {
        return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
      };

      projection.fitExtent = function(extent, object) {
        return fitExtent(projection, extent, object);
      };

      projection.fitSize = function(size, object) {
        return fitSize(projection, size, object);
      };

      projection.fitWidth = function(width, object) {
        return fitWidth(projection, width, object);
      };

      projection.fitHeight = function(height, object) {
        return fitHeight(projection, height, object);
      };

      function recenter() {
        var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
            transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
        rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
        projectTransform = compose(project, transform);
        projectRotateTransform = compose(rotate, projectTransform);
        projectResample = resample(projectTransform, delta2);
        return reset();
      }

      function reset() {
        cache = cacheStream = null;
        return projection;
      }

      return function() {
        project = projectAt.apply(this, arguments);
        projection.invert = project.invert && invert;
        return recenter();
      };
    }

    function mercatorRaw(lambda, phi) {
      return [lambda, log(tan((halfPi + phi) / 2))];
    }

    mercatorRaw.invert = function(x, y) {
      return [x, 2 * atan(exp(y)) - halfPi];
    };

    function geoMercator() {
      return mercatorProjection(mercatorRaw)
          .scale(961 / tau);
    }

    function mercatorProjection(project) {
      var m = projection(project),
          center = m.center,
          scale = m.scale,
          translate = m.translate,
          clipExtent = m.clipExtent,
          x0 = null, y0, x1, y1; // clip extent

      m.scale = function(_) {
        return arguments.length ? (scale(_), reclip()) : scale();
      };

      m.translate = function(_) {
        return arguments.length ? (translate(_), reclip()) : translate();
      };

      m.center = function(_) {
        return arguments.length ? (center(_), reclip()) : center();
      };

      m.clipExtent = function(_) {
        return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      function reclip() {
        var k = pi * scale(),
            t = m(rotation(m.rotate()).invert([0, 0]));
        return clipExtent(x0 == null
            ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw
            ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
            : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]);
      }

      return reclip();
    }

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none() {}

    function selector(selector) {
      return selector == null ? none : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function array(x) {
      return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
    }

    function empty() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty : function() {
        return this.querySelectorAll(selector);
      };
    }

    function arrayAll(select) {
      return function() {
        var group = select.apply(this, arguments);
        return group == null ? [] : array(group);
      };
    }

    function selection_selectAll(select) {
      if (typeof select === "function") select = arrayAll(select);
      else select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection(subgroups, parents);
    }

    function matcher(selector) {
      return function() {
        return this.matches(selector);
      };
    }

    function childMatcher(selector) {
      return function(node) {
        return node.matches(selector);
      };
    }

    var find = Array.prototype.find;

    function childFind(match) {
      return function() {
        return find.call(this.children, match);
      };
    }

    function childFirst() {
      return this.firstElementChild;
    }

    function selection_selectChild(match) {
      return this.select(match == null ? childFirst
          : childFind(typeof match === "function" ? match : childMatcher(match)));
    }

    var filter = Array.prototype.filter;

    function children$1() {
      return this.children;
    }

    function childrenFilter(match) {
      return function() {
        return filter.call(this.children, match);
      };
    }

    function selection_selectChildren(match) {
      return this.selectAll(match == null ? children$1
          : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
    }

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant(x) {
      return function() {
        return x;
      };
    }

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = new Map,
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
          if (nodeByKeyValue.has(keyValue)) {
            exit[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = key.call(parent, data[i], i, data) + "";
        if (node = nodeByKeyValue.get(keyValue)) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue.delete(keyValue);
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
          exit[i] = node;
        }
      }
    }

    function datum(node) {
      return node.__data__;
    }

    function selection_data(value, key) {
      if (!arguments.length) return Array.from(this, datum);

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = array(value.call(parent, parent && parent.__data__, j, parents)),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    function selection_exit() {
      return new Selection(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_join(onenter, onupdate, onexit) {
      var enter = this.enter(), update = this, exit = this.exit();
      enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
      if (onupdate != null) update = onupdate(update);
      if (onexit == null) exit.remove(); else onexit(exit);
      return enter && update ? enter.merge(update).order() : update;
    }

    function selection_merge(selection) {
      if (!(selection instanceof Selection)) throw new Error("invalid merge");

      for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection(sortgroups, this._parents).order();
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      return Array.from(this);
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      let size = 0;
      for (const node of this) ++size; // eslint-disable-line no-unused-vars
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)
          : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove : typeof value === "function"
                ? styleFunction
                : styleConstant)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction
              : textConstant)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      var clone = this.cloneNode(false), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_cloneDeep() {
      var clone = this.cloneNode(true), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    function contextListener(listener) {
      return function(event) {
        listener.call(this, event, this.__data__);
      };
    }

    function parseTypenames(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, options) {
      return function() {
        var on = this.__on, o, listener = contextListener(value);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
            this.addEventListener(o.type, o.listener = listener, o.options = options);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, options);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, options) {
      var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
      return this;
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    function* selection_iterator() {
      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) yield node;
        }
      }
    }

    var root = [null];

    function Selection(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection([[document.documentElement]], root);
    }

    function selection_selection() {
      return this;
    }

    Selection.prototype = selection.prototype = {
      constructor: Selection,
      select: selection_select,
      selectAll: selection_selectAll,
      selectChild: selection_selectChild,
      selectChildren: selection_selectChildren,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      join: selection_join,
      merge: selection_merge,
      selection: selection_selection,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch,
      [Symbol.iterator]: selection_iterator
    };

    function select(selector) {
      return typeof selector === "string"
          ? new Selection([[document.querySelector(selector)]], [document.documentElement])
          : new Selection([[selector]], root);
    }

    function initInterpolator(domain, interpolator) {
      switch (arguments.length) {
        case 0: break;
        case 1: {
          if (typeof domain === "function") this.interpolator(domain);
          else this.range(domain);
          break;
        }
        default: {
          this.domain(domain);
          if (typeof interpolator === "function") this.interpolator(interpolator);
          else this.range(interpolator);
          break;
        }
      }
      return this;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var constant$1 = x => () => x;

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function hue(a, b) {
      var d = b - a;
      return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$1(isNaN(a) ? b : a);
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
    }

    var rgb$1 = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant$1(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
          : b instanceof color ? rgb$1
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    function hsl$1(hue) {
      return function(start, end) {
        var h = hue((start = hsl(start)).h, (end = hsl(end)).h),
            s = nogamma(start.s, end.s),
            l = nogamma(start.l, end.l),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.h = h(t);
          start.s = s(t);
          start.l = l(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }
    }

    var interpolateHsl = hsl$1(hue);

    function identity$1(x) {
      return x;
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity$2(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function transformer$1() {
      var x0 = 0,
          x1 = 1,
          t0,
          t1,
          k10,
          transform,
          interpolator = identity$1,
          clamp = false,
          unknown;

      function scale(x) {
        return isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
      }

      scale.domain = function(_) {
        return arguments.length ? ([x0, x1] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = !!_, scale) : clamp;
      };

      scale.interpolator = function(_) {
        return arguments.length ? (interpolator = _, scale) : interpolator;
      };

      function range(interpolate) {
        return function(_) {
          var r0, r1;
          return arguments.length ? ([r0, r1] = _, interpolator = interpolate(r0, r1), scale) : [interpolator(0), interpolator(1)];
        };
      }

      scale.range = range(interpolate);

      scale.rangeRound = range(interpolateRound);

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t) {
        transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
        return scale;
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .interpolator(source.interpolator())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function sequential() {
      var scale = linearish(transformer$1()(identity$1));

      scale.copy = function() {
        return copy(scale, sequential());
      };

      return initInterpolator.apply(scale, arguments);
    }

    /* src/Map.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1 } = globals;
    const file = "src/Map.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (115:4) {#each countries as country}
    function create_each_block(ctx) {
    	let pattern;
    	let image;
    	let image_xlink_href_value;
    	let pattern_id_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			image = svg_element("image");
    			xlink_attr(image, "xlink:href", image_xlink_href_value = "build/flag-icon-css/flags/1x1/" + /*country*/ ctx[10].toLowerCase() + ".svg");
    			attr_dev(image, "preserveAspectRatio", "none");
    			attr_dev(image, "width", "1");
    			attr_dev(image, "height", "1");
    			add_location(image, file, 116, 5, 3327);
    			attr_dev(pattern, "id", pattern_id_value = /*country*/ ctx[10]);
    			attr_dev(pattern, "height", "100%");
    			attr_dev(pattern, "width", "100%");
    			attr_dev(pattern, "patternContentUnits", "objectBoundingBox");
    			add_location(pattern, file, 115, 5, 3230);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, image);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*countries*/ 1 && image_xlink_href_value !== (image_xlink_href_value = "build/flag-icon-css/flags/1x1/" + /*country*/ ctx[10].toLowerCase() + ".svg")) {
    				xlink_attr(image, "xlink:href", image_xlink_href_value);
    			}

    			if (dirty & /*countries*/ 1 && pattern_id_value !== (pattern_id_value = /*country*/ ctx[10])) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(115:4) {#each countries as country}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let svg;
    	let defs;
    	let each_value = /*countries*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(defs, file, 113, 3, 3185);
    			attr_dev(svg, "id", "map");
    			attr_dev(svg, "width", MAP_WIDTH);
    			attr_dev(svg, "height", MAP_HEIGHT);
    			add_location(svg, file, 112, 2, 3129);
    			add_location(div0, file, 111, 1, 3120);
    			add_location(div1, file, 110, 0, 3113);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, defs);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(defs, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*countries*/ 1) {
    				each_value = /*countries*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(defs, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const MAP_WIDTH = 600;
    const MAP_HEIGHT = 600;
    const missing_color = "#e6ffe6";
    const picked_woj_color = "#66ff66";

    function instance($$self, $$props, $$invalidate) {
    	let $app_state;
    	let $country_codes;
    	let $map_geojson;
    	validate_store(app_state, "app_state");
    	component_subscribe($$self, app_state, $$value => $$invalidate(2, $app_state = $$value));
    	validate_store(country_codes, "country_codes");
    	component_subscribe($$self, country_codes, $$value => $$invalidate(3, $country_codes = $$value));
    	validate_store(map_geojson, "map_geojson");
    	component_subscribe($$self, map_geojson, $$value => $$invalidate(4, $map_geojson = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Map", slots, []);
    	const color_scale = sequential(interpolateHsl("#d6f5d6", "#051505"));

    	// d3 update functions
    	function draw_map(geojson) {
    		const projection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], geojson);
    		const path = geoPath().projection(projection);
    		var map = select("#map");
    		map.selectAll("path").data(geojson.features).enter().append("path").attr("d", path).attr("class", "country-border");

    		map.selectAll("text").data(geojson.features).enter().append("text").text("").attr("class", "map-label").attr("transform", function (d) {
    			return "translate(" + path.centroid(d) + ")";
    		});

    		map.selectAll("circle").data(geojson.features).enter().append("circle").attr("r", 20).attr("opacity", "0%").attr("transform", function (d) {
    			return "translate(" + path.centroid(d) + ")";
    		});
    	}

    	function update_map(app_state) {
    		var mode = app_state["mode"];
    		var year = app_state["year"];
    		var country = app_state["country"];
    		var wojewodztwo = app_state["wojewodztwo"];

    		if (mode === "bycountry") {
    			by_country_render(country, year);
    		} else if (mode === "bywojewodztwo") {
    			by_wojewodztwo_render(year, wojewodztwo);
    		} else ; // pass

    		return true;
    	}

    	function by_country_render(country, year) {
    		var map = select("#map");

    		map.selectAll("path").style("fill", function (d) {
    			var value = d.properties["bycountry"][year][country]["year_prop"];

    			if (value) {
    				return color_scale(value);
    			} else {
    				return missing_color;
    			}
    		});

    		map.selectAll("text").text(function (d) {
    			var prop = d.properties["bycountry"][year][country]["year_prop"];

    			// Javascript rounding workaround + to percent conversion
    			var perc = Math.round(prop * 100 * 100 + Number.EPSILON) / 100;

    			return `${perc}%`;
    		});

    		map.selectAll("circle").attr("opacity", "0%");
    	}

    	function by_wojewodztwo_render(year, wojewodztwo) {
    		var map = select("#map");

    		map.selectAll("path").style("fill", function (d) {
    			var nazwa = d.properties["nazwa"].toUpperCase();

    			if (nazwa == wojewodztwo) {
    				return picked_woj_color;
    			} else {
    				return missing_color;
    			}
    		});

    		map.selectAll("text").text("");

    		map.selectAll("circle").attr("opacity", "100%").attr("fill", function (d) {
    			var data = d.properties["bywojewodztwo"][year];
    			var top = data.map(el => el.country).filter(el => el != "OTHER")[0];
    			return `url(#${top.toString()})`;
    		});
    	}

    	onMount(async () => {
    		draw_map($map_geojson);
    		update_map($app_state);
    	});

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		app_state,
    		map_geojson,
    		country_codes,
    		onMount,
    		geoMercator,
    		geoPath,
    		select,
    		scaleSequential: sequential,
    		interpolateHsl,
    		MAP_WIDTH,
    		MAP_HEIGHT,
    		color_scale,
    		missing_color,
    		picked_woj_color,
    		draw_map,
    		update_map,
    		by_country_render,
    		by_wojewodztwo_render,
    		update_trigger,
    		$app_state,
    		countries,
    		$country_codes,
    		$map_geojson
    	});

    	$$self.$inject_state = $$props => {
    		if ("update_trigger" in $$props) update_trigger = $$props.update_trigger;
    		if ("countries" in $$props) $$invalidate(0, countries = $$props.countries);
    	};

    	let update_trigger;
    	let countries;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$app_state*/ 4) {
    			 update_trigger = update_map($app_state);
    		}

    		if ($$self.$$.dirty & /*$country_codes*/ 8) {
    			 $$invalidate(0, countries = Object.keys($country_codes));
    		}
    	};

    	return [countries];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Country.svelte generated by Svelte v3.29.4 */
    const file$1 = "src/Country.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", div0_class_value = "myflag " + /*flagstate*/ ctx[1] + " flag-icon-background flag-icon-" + /*country*/ ctx[0].toLowerCase() + " svelte-1krg4lm");
    			add_location(div0, file$1, 12, 1, 258);
    			add_location(div1, file$1, 11, 0, 251);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = listen_dev(
    					div0,
    					"click",
    					function () {
    						if (is_function(app_state.set_variable("country", /*country*/ ctx[0]))) app_state.set_variable("country", /*country*/ ctx[0]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*flagstate, country*/ 3 && div0_class_value !== (div0_class_value = "myflag " + /*flagstate*/ ctx[1] + " flag-icon-background flag-icon-" + /*country*/ ctx[0].toLowerCase() + " svelte-1krg4lm")) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $app_state;
    	validate_store(app_state, "app_state");
    	component_subscribe($$self, app_state, $$value => $$invalidate(2, $app_state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Country", slots, []);
    	let { country } = $$props;
    	let flagstate;
    	const writable_props = ["country"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Country> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("country" in $$props) $$invalidate(0, country = $$props.country);
    	};

    	$$self.$capture_state = () => ({
    		app_state,
    		country,
    		flagstate,
    		$app_state
    	});

    	$$self.$inject_state = $$props => {
    		if ("country" in $$props) $$invalidate(0, country = $$props.country);
    		if ("flagstate" in $$props) $$invalidate(1, flagstate = $$props.flagstate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$app_state, country*/ 5) {
    			 if ($app_state["mode"] !== "bycountry" || $app_state["country"] !== country) {
    				$$invalidate(1, flagstate = "inactiveflag");
    			} else {
    				$$invalidate(1, flagstate = "activeflag");
    			}
    		}
    	};

    	return [country, flagstate];
    }

    class Country extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { country: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Country",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*country*/ ctx[0] === undefined && !("country" in props)) {
    			console.warn("<Country> was created without expected prop 'country'");
    		}
    	}

    	get country() {
    		throw new Error("<Country>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set country(value) {
    		throw new Error("<Country>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Control.svelte generated by Svelte v3.29.4 */
    const file$2 = "src/Control.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (49:6) {#each modes as mode}
    function create_each_block_2(ctx) {
    	let option;
    	let t0_value = /*mode*/ ctx[18].text + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*mode*/ ctx[18];
    			option.value = option.__value;
    			add_location(option, file$2, 49, 8, 1701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(49:6) {#each modes as mode}",
    		ctx
    	});

    	return block;
    }

    // (59:6) {#each years as year}
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*year*/ ctx[15] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*year*/ ctx[15];
    			option.value = option.__value;
    			add_location(option, file$2, 59, 8, 2027);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(59:6) {#each years as year}",
    		ctx
    	});

    	return block;
    }

    // (69:6) {#each wojewodztwa as wojewodztwo}
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*wojewodztwo*/ ctx[12].text + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*wojewodztwo*/ ctx[12];
    			option.value = option.__value;
    			add_location(option, file$2, 69, 8, 2390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(69:6) {#each wojewodztwa as wojewodztwo}",
    		ctx
    	});

    	return block;
    }

    // (89:54) 
    function create_if_block_2(ctx) {
    	let p;
    	let t0;
    	let strong0;
    	let t1_value = /*$app_state*/ ctx[4]["year"] + "";
    	let t1;
    	let t2;
    	let strong1;
    	let t3_value = /*$app_state*/ ctx[4]["wojewodztwo"] + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("The visualization shows the ranking of countries within each voivodeship in year ");
    			strong0 = element("strong");
    			t1 = text(t1_value);
    			t2 = text(".\n          Flags on the map indicate the top country of origin for each voivodeship.\n          The full ranking is currently displayed for ");
    			strong1 = element("strong");
    			t3 = text(t3_value);
    			t4 = text(" voivodeship (highlighted on the map).\n          Percentage indicates what proportion of all tourists in a given voivodeship do tourists from given country account for.");
    			add_location(strong0, file$2, 90, 91, 3424);
    			add_location(strong1, file$2, 92, 54, 3601);
    			add_location(p, file$2, 89, 8, 3329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, strong0);
    			append_dev(strong0, t1);
    			append_dev(p, t2);
    			append_dev(p, strong1);
    			append_dev(strong1, t3);
    			append_dev(p, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$app_state*/ 16 && t1_value !== (t1_value = /*$app_state*/ ctx[4]["year"] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$app_state*/ 16 && t3_value !== (t3_value = /*$app_state*/ ctx[4]["wojewodztwo"] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(89:54) ",
    		ctx
    	});

    	return block;
    }

    // (82:50) 
    function create_if_block_1(ctx) {
    	let p;
    	let t0;
    	let strong0;
    	let t1;
    	let t2;
    	let strong1;
    	let t3_value = /*$app_state*/ ctx[4]["year"] + "";
    	let t3;
    	let t4;
    	let strong2;
    	let t5;
    	let t6;
    	let strong3;
    	let t7;
    	let t8;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("The visualization shows destinations of tourists from ");
    			strong0 = element("strong");
    			t1 = text(/*country_display*/ ctx[3]);
    			t2 = text(" in year ");
    			strong1 = element("strong");
    			t3 = text(t3_value);
    			t4 = text(".\n          Percentage indicates the popularity of given destination (voivodeship), relative to the entrire traffic to Poland from ");
    			strong2 = element("strong");
    			t5 = text(/*country_display*/ ctx[3]);
    			t6 = text(".\n          Table displays exact number of tourists from ");
    			strong3 = element("strong");
    			t7 = text(/*country_display*/ ctx[3]);
    			t8 = text(" by year.\n          Click on a flag to change the country.");
    			add_location(strong0, file$2, 83, 64, 2858);
    			add_location(strong1, file$2, 83, 107, 2901);
    			add_location(strong2, file$2, 84, 129, 3069);
    			add_location(strong3, file$2, 85, 55, 3160);
    			add_location(p, file$2, 82, 8, 2790);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, strong0);
    			append_dev(strong0, t1);
    			append_dev(p, t2);
    			append_dev(p, strong1);
    			append_dev(strong1, t3);
    			append_dev(p, t4);
    			append_dev(p, strong2);
    			append_dev(strong2, t5);
    			append_dev(p, t6);
    			append_dev(p, strong3);
    			append_dev(strong3, t7);
    			append_dev(p, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*country_display*/ 8) set_data_dev(t1, /*country_display*/ ctx[3]);
    			if (dirty & /*$app_state*/ 16 && t3_value !== (t3_value = /*$app_state*/ ctx[4]["year"] + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*country_display*/ 8) set_data_dev(t5, /*country_display*/ ctx[3]);
    			if (dirty & /*country_display*/ 8) set_data_dev(t7, /*country_display*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(82:50) ",
    		ctx
    	});

    	return block;
    }

    // (78:6) {#if $app_state['mode'] === 'total'}
    function create_if_block(ctx) {
    	let p;
    	let t0;
    	let strong;
    	let t1_value = /*$app_state*/ ctx[4]["year"] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("The following table shows ranking of countries by total number of tourists in year ");
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = text(".");
    			add_location(strong, file$2, 79, 93, 2679);
    			add_location(p, file$2, 78, 8, 2582);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, strong);
    			append_dev(strong, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$app_state*/ 16 && t1_value !== (t1_value = /*$app_state*/ ctx[4]["year"] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(78:6) {#if $app_state['mode'] === 'total'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let h1;
    	let t1;
    	let div0;
    	let label0;
    	let t3;
    	let select0;
    	let t4;
    	let label1;
    	let t6;
    	let select1;
    	let t7;
    	let label2;
    	let t9;
    	let select2;
    	let t10;
    	let div1;
    	let t11;
    	let p0;
    	let em;
    	let t13;
    	let t14;
    	let p1;
    	let t15;
    	let a;
    	let t17;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*modes*/ ctx[5];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*years*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*wojewodztwa*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*$app_state*/ ctx[4]["mode"] === "total") return create_if_block;
    		if (/*$app_state*/ ctx[4]["mode"] == "bycountry") return create_if_block_1;
    		if (/*$app_state*/ ctx[4]["mode"] == "bywojewodztwo") return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Foreign Tourists";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Mode";
    			t3 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Year";
    			t6 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			label2 = element("label");
    			label2.textContent = "Voivodeship";
    			t9 = space();
    			select2 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t11 = space();
    			p0 = element("p");
    			em = element("em");
    			em.textContent = "Note:";
    			t13 = text(" this app requires a bigger screen to render all elements properly.");
    			t14 = space();
    			p1 = element("p");
    			t15 = text("Data source: ");
    			a = element("a");
    			a.textContent = "Główny Urząd Statystyczny";
    			t17 = text(".");
    			add_location(h1, file$2, 42, 4, 1430);
    			attr_dev(label0, "for", "mode");
    			add_location(label0, file$2, 45, 6, 1473);
    			attr_dev(select0, "id", "mode");
    			if (/*selected_mode*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[8].call(select0));
    			add_location(select0, file$2, 47, 6, 1556);
    			attr_dev(label1, "for", "year");
    			add_location(label1, file$2, 55, 6, 1802);
    			attr_dev(select1, "id", "year");
    			if (/*selected_year*/ ctx[2] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[9].call(select1));
    			add_location(select1, file$2, 57, 6, 1885);
    			attr_dev(label2, "for", "woj");
    			add_location(label2, file$2, 65, 6, 2123);
    			attr_dev(select2, "id", "woj");
    			if (/*selected_wojewodztwo*/ ctx[1] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[10].call(select2));
    			add_location(select2, file$2, 67, 6, 2212);
    			attr_dev(div0, "class", "svelte-1ozye09");
    			add_location(div0, file$2, 44, 4, 1461);
    			add_location(em, file$2, 97, 8, 3857);
    			add_location(p0, file$2, 96, 6, 3845);
    			attr_dev(a, "href", "https://api.stat.gov.pl/Home/BdlApi");
    			attr_dev(a, "class", "svelte-1ozye09");
    			add_location(a, file$2, 99, 22, 3972);
    			add_location(p1, file$2, 99, 6, 3956);
    			attr_dev(div1, "class", "desc svelte-1ozye09");
    			add_location(div1, file$2, 76, 4, 2512);
    			attr_dev(div2, "class", "svelte-1ozye09");
    			add_location(div2, file$2, 41, 0, 1420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, select0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select0, null);
    			}

    			select_option(select0, /*selected_mode*/ ctx[0]);
    			append_dev(div0, t4);
    			append_dev(div0, label1);
    			append_dev(div0, t6);
    			append_dev(div0, select1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select1, null);
    			}

    			select_option(select1, /*selected_year*/ ctx[2]);
    			append_dev(div0, t7);
    			append_dev(div0, label2);
    			append_dev(div0, t9);
    			append_dev(div0, select2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select2, null);
    			}

    			select_option(select2, /*selected_wojewodztwo*/ ctx[1]);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t11);
    			append_dev(div1, p0);
    			append_dev(p0, em);
    			append_dev(p0, t13);
    			append_dev(div1, t14);
    			append_dev(div1, p1);
    			append_dev(p1, t15);
    			append_dev(p1, a);
    			append_dev(p1, t17);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[8]),
    					listen_dev(
    						select0,
    						"change",
    						function () {
    							if (is_function(app_state.set_variable("mode", /*selected_mode*/ ctx[0].id))) app_state.set_variable("mode", /*selected_mode*/ ctx[0].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[9]),
    					listen_dev(
    						select1,
    						"change",
    						function () {
    							if (is_function(app_state.set_variable("year", /*selected_year*/ ctx[2]))) app_state.set_variable("year", /*selected_year*/ ctx[2]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[10]),
    					listen_dev(
    						select2,
    						"change",
    						function () {
    							if (is_function(app_state.set_variable("wojewodztwo", /*selected_wojewodztwo*/ ctx[1].id))) app_state.set_variable("wojewodztwo", /*selected_wojewodztwo*/ ctx[1].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*modes*/ 32) {
    				each_value_2 = /*modes*/ ctx[5];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*selected_mode, modes*/ 33) {
    				select_option(select0, /*selected_mode*/ ctx[0]);
    			}

    			if (dirty & /*years*/ 128) {
    				each_value_1 = /*years*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selected_year, years*/ 132) {
    				select_option(select1, /*selected_year*/ ctx[2]);
    			}

    			if (dirty & /*wojewodztwa*/ 64) {
    				each_value = /*wojewodztwa*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected_wojewodztwo, wojewodztwa*/ 66) {
    				select_option(select2, /*selected_wojewodztwo*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t11);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $country_codes;
    	let $app_state;
    	validate_store(country_codes, "country_codes");
    	component_subscribe($$self, country_codes, $$value => $$invalidate(11, $country_codes = $$value));
    	validate_store(app_state, "app_state");
    	component_subscribe($$self, app_state, $$value => $$invalidate(4, $app_state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Control", slots, []);

    	let modes = [
    		{
    			id: "bywojewodztwo",
    			text: "By województwo"
    		},
    		{ id: "bycountry", text: "By country" },
    		{ id: "total", text: "Total" }
    	];

    	let selected_mode;

    	let wojewodztwa = [
    		{ id: "DOLNOŚLĄSKIE", text: "Dolnośląskie" },
    		{
    			id: "KUJAWSKO-POMORSKIE",
    			text: "Kujawsko-Pomorskie"
    		},
    		{ id: "LUBELSKIE", text: "Lubelskie" },
    		{ id: "LUBUSKIE", text: "Lubuskie" },
    		{ id: "ŁÓDZKIE", text: "Łódzkie" },
    		{ id: "MAZOWIECKIE", text: "Mazowieckie" },
    		{ id: "MAŁOPOLSKIE", text: "Małopolskie" },
    		{ id: "OPOLSKIE", text: "Opolskie" },
    		{ id: "PODKARPACKIE", text: "Podkarpackie" },
    		{ id: "PODLASKIE", text: "Podlaskie" },
    		{ id: "POMORSKIE", text: "Pomorskie" },
    		{ id: "ŚLĄSKIE", text: "Śląskie" },
    		{
    			id: "ŚWIĘTOKRZYSKIE",
    			text: "Świętokrzyskie"
    		},
    		{
    			id: "WARMIŃSKO-MAZURSKIE",
    			text: "Warmińsko-Mazurskie"
    		},
    		{
    			id: "WIELKOPOLSKIE",
    			text: "Wielkopolskie"
    		},
    		{
    			id: "ZACHODNIOPOMORSKIE",
    			text: "Zachodniopomorskie"
    		}
    	];

    	let selected_wojewodztwo;

    	let years = [
    		2005,
    		2006,
    		2007,
    		2008,
    		2009,
    		2010,
    		2011,
    		2012,
    		2013,
    		2014,
    		2015,
    		2016,
    		2017,
    		2018,
    		2019
    	];

    	let selected_year = 2019;
    	let country_display;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Control> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		selected_mode = select_value(this);
    		$$invalidate(0, selected_mode);
    		$$invalidate(5, modes);
    	}

    	function select1_change_handler() {
    		selected_year = select_value(this);
    		$$invalidate(2, selected_year);
    		$$invalidate(7, years);
    	}

    	function select2_change_handler() {
    		selected_wojewodztwo = select_value(this);
    		$$invalidate(1, selected_wojewodztwo);
    		$$invalidate(6, wojewodztwa);
    	}

    	$$self.$capture_state = () => ({
    		app_state,
    		country_codes,
    		modes,
    		selected_mode,
    		wojewodztwa,
    		selected_wojewodztwo,
    		years,
    		selected_year,
    		country_display,
    		$country_codes,
    		$app_state
    	});

    	$$self.$inject_state = $$props => {
    		if ("modes" in $$props) $$invalidate(5, modes = $$props.modes);
    		if ("selected_mode" in $$props) $$invalidate(0, selected_mode = $$props.selected_mode);
    		if ("wojewodztwa" in $$props) $$invalidate(6, wojewodztwa = $$props.wojewodztwa);
    		if ("selected_wojewodztwo" in $$props) $$invalidate(1, selected_wojewodztwo = $$props.selected_wojewodztwo);
    		if ("years" in $$props) $$invalidate(7, years = $$props.years);
    		if ("selected_year" in $$props) $$invalidate(2, selected_year = $$props.selected_year);
    		if ("country_display" in $$props) $$invalidate(3, country_display = $$props.country_display);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$country_codes, $app_state*/ 2064) {
    			 try {
    				$$invalidate(3, country_display = $country_codes[$app_state["country"]]["en"]);
    			} catch(error) {
    				$$invalidate(3, country_display = "unknown");
    			}
    		}
    	};

    	return [
    		selected_mode,
    		selected_wojewodztwo,
    		selected_year,
    		country_display,
    		$app_state,
    		modes,
    		wojewodztwa,
    		years,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler
    	];
    }

    class Control extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Control",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/TopCountries.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$1 } = globals;
    const file$3 = "src/TopCountries.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (45:4) {#if level !== 'total'}
    function create_if_block_4(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(/*wojewodztwo*/ ctx[2]);
    			add_location(h2, file$3, 45, 8, 1643);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*wojewodztwo*/ 4) set_data_dev(t, /*wojewodztwo*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(45:4) {#if level !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (53:16) {:else}
    function create_else_block_1(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "Year";
    			add_location(th, file$3, 53, 20, 1871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(53:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:16) {#if level !== 'countryts'}
    function create_if_block_3(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "Place";
    			add_location(th, file$3, 51, 20, 1812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(51:16) {#if level !== 'countryts'}",
    		ctx
    	});

    	return block;
    }

    // (56:16) {#if level !== 'countryts'}
    function create_if_block_2$1(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "Country";
    			add_location(th, file$3, 56, 20, 1971);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(56:16) {#if level !== 'countryts'}",
    		ctx
    	});

    	return block;
    }

    // (67:16) {:else}
    function create_else_block(ctx) {
    	let td;
    	let t_value = /*entry*/ ctx[8].year + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			add_location(td, file$3, 67, 20, 2288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2 && t_value !== (t_value = /*entry*/ ctx[8].year + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(67:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:16) {#if level !== 'countryts'}
    function create_if_block_1$1(ctx) {
    	let td;
    	let t_value = /*i*/ ctx[10] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			add_location(td, file$3, 65, 20, 2229);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(65:16) {#if level !== 'countryts'}",
    		ctx
    	});

    	return block;
    }

    // (70:16) {#if level !== 'countryts'}
    function create_if_block$1(ctx) {
    	let td;
    	let span;
    	let span_class_value;
    	let t0;
    	let t1_value = /*$country_codes*/ ctx[3][/*entry*/ ctx[8].country]["en"] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			td = element("td");
    			span = element("span");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(span, "class", span_class_value = "tableflag flag-icon-background flag-icon-" + /*entry*/ ctx[8].country.toLowerCase() + " svelte-1f99ybv");
    			add_location(span, file$3, 71, 24, 2425);
    			add_location(td, file$3, 70, 20, 2396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, span);
    			append_dev(td, t0);
    			append_dev(td, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2 && span_class_value !== (span_class_value = "tableflag flag-icon-background flag-icon-" + /*entry*/ ctx[8].country.toLowerCase() + " svelte-1f99ybv")) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*$country_codes, data*/ 10 && t1_value !== (t1_value = /*$country_codes*/ ctx[3][/*entry*/ ctx[8].country]["en"] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(70:16) {#if level !== 'countryts'}",
    		ctx
    	});

    	return block;
    }

    // (63:8) {#each data as entry, i}
    function create_each_block$2(ctx) {
    	let tr;
    	let t0;
    	let t1;
    	let td0;
    	let t2_value = /*entry*/ ctx[8].count + "";
    	let t2;
    	let t3;
    	let td1;
    	let t4_value = Math.round(/*entry*/ ctx[8].year_prop * 100 * 100 + Number.EPSILON) / 100 + "";
    	let t4;
    	let t5;

    	function select_block_type_1(ctx, dirty) {
    		if (/*level*/ ctx[0] !== "countryts") return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*level*/ ctx[0] !== "countryts" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			td0 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td1 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			add_location(td0, file$3, 75, 16, 2639);
    			add_location(td1, file$3, 76, 16, 2678);
    			add_location(tr, file$3, 63, 12, 2160);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			if_block0.m(tr, null);
    			append_dev(tr, t0);
    			if (if_block1) if_block1.m(tr, null);
    			append_dev(tr, t1);
    			append_dev(tr, td0);
    			append_dev(td0, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			append_dev(td1, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(tr, t0);
    				}
    			}

    			if (/*level*/ ctx[0] !== "countryts") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(tr, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*data*/ 2 && t2_value !== (t2_value = /*entry*/ ctx[8].count + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*data*/ 2 && t4_value !== (t4_value = Math.round(/*entry*/ ctx[8].year_prop * 100 * 100 + Number.EPSILON) / 100 + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(63:8) {#each data as entry, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let t0;
    	let table;
    	let thead;
    	let tr;
    	let t1;
    	let t2;
    	let th0;
    	let t4;
    	let th1;
    	let t6;
    	let if_block0 = /*level*/ ctx[0] !== "total" && create_if_block_4(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*level*/ ctx[0] !== "countryts") return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*level*/ ctx[0] !== "countryts" && create_if_block_2$1(ctx);
    	let each_value = /*data*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			th0 = element("th");
    			th0.textContent = "Count";
    			t4 = space();
    			th1 = element("th");
    			th1.textContent = "Perc of all";
    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$3, 58, 16, 2026);
    			add_location(th1, file$3, 59, 16, 2057);
    			add_location(tr, file$3, 49, 12, 1743);
    			add_location(thead, file$3, 48, 8, 1723);
    			attr_dev(table, "class", "mytable pure-table svelte-1f99ybv");
    			add_location(table, file$3, 47, 4, 1680);
    			add_location(div, file$3, 43, 0, 1601);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			if_block1.m(tr, null);
    			append_dev(tr, t1);
    			if (if_block2) if_block2.m(tr, null);
    			append_dev(tr, t2);
    			append_dev(tr, th0);
    			append_dev(tr, t4);
    			append_dev(tr, th1);
    			append_dev(table, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*level*/ ctx[0] !== "total") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(tr, t1);
    				}
    			}

    			if (/*level*/ ctx[0] !== "countryts") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					if_block2.m(tr, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*Math, data, Number, $country_codes, level*/ 11) {
    				each_value = /*data*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $app_state;
    	let $map_geojson;
    	let $tourists;
    	let $country_codes;
    	validate_store(app_state, "app_state");
    	component_subscribe($$self, app_state, $$value => $$invalidate(4, $app_state = $$value));
    	validate_store(map_geojson, "map_geojson");
    	component_subscribe($$self, map_geojson, $$value => $$invalidate(5, $map_geojson = $$value));
    	validate_store(tourists, "tourists");
    	component_subscribe($$self, tourists, $$value => $$invalidate(6, $tourists = $$value));
    	validate_store(country_codes, "country_codes");
    	component_subscribe($$self, country_codes, $$value => $$invalidate(3, $country_codes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TopCountries", slots, []);
    	let { level } = $$props; // wojewodztwo, total, countryts

    	function get_data(level, app_state, map_geojson, tourists) {
    		var data;
    		var wojewodztwo = app_state["wojewodztwo"];
    		var year = app_state["year"];
    		var country = app_state["country"];

    		if (level == "wojewodztwo") {
    			for (var entry of map_geojson["features"]) {
    				var current_name = entry.properties.nazwa.toUpperCase();

    				if (current_name === wojewodztwo) {
    					data = entry.properties["bywojewodztwo"][year];
    				}
    			}

    			// take top 10 only
    			data = data.slice(0, 10);
    		} else if (level == "total") {
    			data = tourists[year];
    		} else if (level == "countryts") {
    			for (var entry of map_geojson["features"]) {
    				var current_name = entry.properties.nazwa.toUpperCase();

    				if (current_name === wojewodztwo) {
    					data = [];

    					for (let [key, value] of Object.entries(entry.properties["bycountry"])) {
    						var current_year = value[country];
    						current_year["year"] = key;
    						data.unshift(current_year);
    					}
    				}
    			}
    		} else {
    			data = {};
    		}

    		return data;
    	}

    	const writable_props = ["level"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopCountries> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("level" in $$props) $$invalidate(0, level = $$props.level);
    	};

    	$$self.$capture_state = () => ({
    		app_state,
    		map_geojson,
    		tourists,
    		country_codes,
    		level,
    		get_data,
    		data,
    		$app_state,
    		$map_geojson,
    		$tourists,
    		wojewodztwo,
    		$country_codes
    	});

    	$$self.$inject_state = $$props => {
    		if ("level" in $$props) $$invalidate(0, level = $$props.level);
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("wojewodztwo" in $$props) $$invalidate(2, wojewodztwo = $$props.wojewodztwo);
    	};

    	let data;
    	let wojewodztwo;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*level, $app_state, $map_geojson, $tourists*/ 113) {
    			 $$invalidate(1, data = get_data(level, $app_state, $map_geojson, $tourists));
    		}

    		if ($$self.$$.dirty & /*$app_state*/ 16) {
    			 $$invalidate(2, wojewodztwo = $app_state["wojewodztwo"]);
    		}
    	};

    	return [level, data, wojewodztwo, $country_codes];
    }

    class TopCountries extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { level: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopCountries",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*level*/ ctx[0] === undefined && !("level" in props)) {
    			console.warn("<TopCountries> was created without expected prop 'level'");
    		}
    	}

    	get level() {
    		throw new Error("<TopCountries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set level(value) {
    		throw new Error("<TopCountries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$2 } = globals;
    const file$4 = "src/App.svelte";

    // (37:2) {:else}
    function create_else_block$1(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let t3;
    	let div4;
    	let t4;
    	let div5;
    	let t5;
    	let div6;
    	let t6;
    	let div7;
    	let t7;
    	let div8;
    	let t8;
    	let div9;
    	let t9;
    	let div10;
    	let t10;
    	let div11;
    	let current_block_type_index;
    	let if_block10;
    	let t11;
    	let div12;
    	let t12;
    	let div13;
    	let t13;
    	let t14;
    	let div14;
    	let t15;
    	let div15;
    	let t16;
    	let div16;
    	let t17;
    	let div17;
    	let t18;
    	let div18;
    	let t19;
    	let div19;
    	let current;
    	let if_block0 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_19(ctx);
    	let if_block1 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_18(ctx);
    	let if_block2 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_17(ctx);
    	let if_block3 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_16(ctx);
    	let if_block4 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_15(ctx);
    	let if_block5 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_14(ctx);
    	let if_block6 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_13(ctx);
    	let if_block7 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_12(ctx);
    	let if_block8 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_11(ctx);
    	let if_block9 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_10(ctx);
    	const if_block_creators = [create_if_block_9, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$app_state*/ ctx[3].mode !== "total") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block10 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block11 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_8(ctx);
    	let if_block12 = /*$app_state*/ ctx[3].mode === "bywojewodztwo" && create_if_block_7(ctx);
    	let if_block13 = /*$app_state*/ ctx[3].mode === "bycountry" && create_if_block_6(ctx);
    	let if_block14 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_5(ctx);
    	let if_block15 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_4$1(ctx);
    	let if_block16 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_3$1(ctx);
    	let if_block17 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_2$2(ctx);
    	let if_block18 = /*$app_state*/ ctx[3].mode !== "total" && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div2 = element("div");
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div3 = element("div");
    			if (if_block3) if_block3.c();
    			t3 = space();
    			div4 = element("div");
    			if (if_block4) if_block4.c();
    			t4 = space();
    			div5 = element("div");
    			if (if_block5) if_block5.c();
    			t5 = space();
    			div6 = element("div");
    			if (if_block6) if_block6.c();
    			t6 = space();
    			div7 = element("div");
    			if (if_block7) if_block7.c();
    			t7 = space();
    			div8 = element("div");
    			t8 = space();
    			div9 = element("div");
    			if (if_block8) if_block8.c();
    			t9 = space();
    			div10 = element("div");
    			if (if_block9) if_block9.c();
    			t10 = space();
    			div11 = element("div");
    			if_block10.c();
    			t11 = space();
    			div12 = element("div");
    			if (if_block11) if_block11.c();
    			t12 = space();
    			div13 = element("div");
    			if (if_block12) if_block12.c();
    			t13 = space();
    			if (if_block13) if_block13.c();
    			t14 = space();
    			div14 = element("div");
    			t15 = space();
    			div15 = element("div");
    			if (if_block14) if_block14.c();
    			t16 = space();
    			div16 = element("div");
    			if (if_block15) if_block15.c();
    			t17 = space();
    			div17 = element("div");
    			if (if_block16) if_block16.c();
    			t18 = space();
    			div18 = element("div");
    			if (if_block17) if_block17.c();
    			t19 = space();
    			div19 = element("div");
    			if (if_block18) if_block18.c();
    			attr_dev(div0, "class", "pure-u-2-24");
    			add_location(div0, file$4, 38, 3, 1128);
    			attr_dev(div1, "class", "pure-u-2-24");
    			add_location(div1, file$4, 43, 3, 1245);
    			attr_dev(div2, "class", "pure-u-2-24");
    			add_location(div2, file$4, 48, 3, 1362);
    			attr_dev(div3, "class", "pure-u-2-24");
    			add_location(div3, file$4, 53, 3, 1479);
    			attr_dev(div4, "class", "pure-u-2-24");
    			add_location(div4, file$4, 58, 3, 1596);
    			attr_dev(div5, "class", "pure-u-2-24");
    			add_location(div5, file$4, 63, 3, 1713);
    			attr_dev(div6, "class", "pure-u-2-24");
    			add_location(div6, file$4, 68, 3, 1830);
    			attr_dev(div7, "class", "pure-u-2-24");
    			add_location(div7, file$4, 73, 3, 1947);
    			attr_dev(div8, "class", "pure-u-8-24");
    			add_location(div8, file$4, 78, 3, 2064);
    			attr_dev(div9, "class", "pure-u-2-24");
    			add_location(div9, file$4, 82, 3, 2141);
    			attr_dev(div10, "class", "pure-u-2-24");
    			add_location(div10, file$4, 91, 3, 2378);
    			attr_dev(div11, "class", "pure-u-10-24");
    			add_location(div11, file$4, 102, 3, 2675);
    			attr_dev(div12, "class", "pure-u-2-24");
    			add_location(div12, file$4, 109, 3, 2823);
    			attr_dev(div13, "class", "pure-u-8-24");
    			add_location(div13, file$4, 120, 3, 3120);
    			attr_dev(div14, "class", "pure-u-4-24");
    			add_location(div14, file$4, 129, 3, 3365);
    			attr_dev(div15, "class", "pure-u-2-24");
    			add_location(div15, file$4, 132, 3, 3424);
    			attr_dev(div16, "class", "pure-u-2-24");
    			add_location(div16, file$4, 137, 3, 3541);
    			attr_dev(div17, "class", "pure-u-2-24");
    			add_location(div17, file$4, 142, 3, 3658);
    			attr_dev(div18, "class", "pure-u-2-24");
    			add_location(div18, file$4, 147, 3, 3775);
    			attr_dev(div19, "class", "pure-u-2-24");
    			add_location(div19, file$4, 152, 3, 3892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if (if_block0) if_block0.m(div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block1) if_block1.m(div1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			if (if_block2) if_block2.m(div2, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			if (if_block3) if_block3.m(div3, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			if (if_block4) if_block4.m(div4, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div5, anchor);
    			if (if_block5) if_block5.m(div5, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div6, anchor);
    			if (if_block6) if_block6.m(div6, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div7, anchor);
    			if (if_block7) if_block7.m(div7, null);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div8, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div9, anchor);
    			if (if_block8) if_block8.m(div9, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div10, anchor);
    			if (if_block9) if_block9.m(div10, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div11, anchor);
    			if_blocks[current_block_type_index].m(div11, null);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div12, anchor);
    			if (if_block11) if_block11.m(div12, null);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div13, anchor);
    			if (if_block12) if_block12.m(div13, null);
    			append_dev(div13, t13);
    			if (if_block13) if_block13.m(div13, null);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div14, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div15, anchor);
    			if (if_block14) if_block14.m(div15, null);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div16, anchor);
    			if (if_block15) if_block15.m(div16, null);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div17, anchor);
    			if (if_block16) if_block16.m(div17, null);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div18, anchor);
    			if (if_block17) if_block17.m(div18, null);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div19, anchor);
    			if (if_block18) if_block18.m(div19, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block0) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_19(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block1) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_18(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block2) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_17(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div2, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block3) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_16(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div3, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block4) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_15(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div4, null);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block5) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_14(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div5, null);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block6) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_13(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div6, null);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block7) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_12(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div7, null);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block8) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_11(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div9, null);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block9) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block9, 1);
    					}
    				} else {
    					if_block9 = create_if_block_10(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(div10, null);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block10 = if_blocks[current_block_type_index];

    				if (!if_block10) {
    					if_block10 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block10.c();
    				}

    				transition_in(if_block10, 1);
    				if_block10.m(div11, null);
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block11) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block11, 1);
    					}
    				} else {
    					if_block11 = create_if_block_8(ctx);
    					if_block11.c();
    					transition_in(if_block11, 1);
    					if_block11.m(div12, null);
    				}
    			} else if (if_block11) {
    				group_outros();

    				transition_out(if_block11, 1, 1, () => {
    					if_block11 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode === "bywojewodztwo") {
    				if (if_block12) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block12, 1);
    					}
    				} else {
    					if_block12 = create_if_block_7(ctx);
    					if_block12.c();
    					transition_in(if_block12, 1);
    					if_block12.m(div13, t13);
    				}
    			} else if (if_block12) {
    				group_outros();

    				transition_out(if_block12, 1, 1, () => {
    					if_block12 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode === "bycountry") {
    				if (if_block13) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block13, 1);
    					}
    				} else {
    					if_block13 = create_if_block_6(ctx);
    					if_block13.c();
    					transition_in(if_block13, 1);
    					if_block13.m(div13, null);
    				}
    			} else if (if_block13) {
    				group_outros();

    				transition_out(if_block13, 1, 1, () => {
    					if_block13 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block14) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block14, 1);
    					}
    				} else {
    					if_block14 = create_if_block_5(ctx);
    					if_block14.c();
    					transition_in(if_block14, 1);
    					if_block14.m(div15, null);
    				}
    			} else if (if_block14) {
    				group_outros();

    				transition_out(if_block14, 1, 1, () => {
    					if_block14 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block15) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block15, 1);
    					}
    				} else {
    					if_block15 = create_if_block_4$1(ctx);
    					if_block15.c();
    					transition_in(if_block15, 1);
    					if_block15.m(div16, null);
    				}
    			} else if (if_block15) {
    				group_outros();

    				transition_out(if_block15, 1, 1, () => {
    					if_block15 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block16) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block16, 1);
    					}
    				} else {
    					if_block16 = create_if_block_3$1(ctx);
    					if_block16.c();
    					transition_in(if_block16, 1);
    					if_block16.m(div17, null);
    				}
    			} else if (if_block16) {
    				group_outros();

    				transition_out(if_block16, 1, 1, () => {
    					if_block16 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block17) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block17, 1);
    					}
    				} else {
    					if_block17 = create_if_block_2$2(ctx);
    					if_block17.c();
    					transition_in(if_block17, 1);
    					if_block17.m(div18, null);
    				}
    			} else if (if_block17) {
    				group_outros();

    				transition_out(if_block17, 1, 1, () => {
    					if_block17 = null;
    				});

    				check_outros();
    			}

    			if (/*$app_state*/ ctx[3].mode !== "total") {
    				if (if_block18) {
    					if (dirty & /*$app_state*/ 8) {
    						transition_in(if_block18, 1);
    					}
    				} else {
    					if_block18 = create_if_block_1$2(ctx);
    					if_block18.c();
    					transition_in(if_block18, 1);
    					if_block18.m(div19, null);
    				}
    			} else if (if_block18) {
    				group_outros();

    				transition_out(if_block18, 1, 1, () => {
    					if_block18 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			transition_in(if_block10);
    			transition_in(if_block11);
    			transition_in(if_block12);
    			transition_in(if_block13);
    			transition_in(if_block14);
    			transition_in(if_block15);
    			transition_in(if_block16);
    			transition_in(if_block17);
    			transition_in(if_block18);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			transition_out(if_block10);
    			transition_out(if_block11);
    			transition_out(if_block12);
    			transition_out(if_block13);
    			transition_out(if_block14);
    			transition_out(if_block15);
    			transition_out(if_block16);
    			transition_out(if_block17);
    			transition_out(if_block18);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			if (if_block3) if_block3.d();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);
    			if (if_block4) if_block4.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div5);
    			if (if_block5) if_block5.d();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div6);
    			if (if_block6) if_block6.d();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div7);
    			if (if_block7) if_block7.d();
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div9);
    			if (if_block8) if_block8.d();
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div10);
    			if (if_block9) if_block9.d();
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div11);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div12);
    			if (if_block11) if_block11.d();
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div13);
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div14);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div15);
    			if (if_block14) if_block14.d();
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div16);
    			if (if_block15) if_block15.d();
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div17);
    			if (if_block16) if_block16.d();
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div18);
    			if (if_block17) if_block17.d();
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div19);
    			if (if_block18) if_block18.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(37:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#if Object.keys($country_codes).length === 0 || Object.keys($map_geojson).length === 0 || Object.keys($tourists).length === 0}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Loading data...";
    			attr_dev(div, "class", "pure-u-1-1");
    			add_location(div, file$4, 33, 3, 1042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(33:2) {#if Object.keys($country_codes).length === 0 || Object.keys($map_geojson).length === 0 || Object.keys($tourists).length === 0}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {#if $app_state.mode !== 'total'}
    function create_if_block_19(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "CA" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(40:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (45:4) {#if $app_state.mode !== 'total'}
    function create_if_block_18(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "DK" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(45:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (50:4) {#if $app_state.mode !== 'total'}
    function create_if_block_17(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "NO" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(50:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (55:4) {#if $app_state.mode !== 'total'}
    function create_if_block_16(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "SE" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(55:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#if $app_state.mode !== 'total'}
    function create_if_block_15(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "FI" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(60:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#if $app_state.mode !== 'total'}
    function create_if_block_14(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "LT" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(65:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (70:4) {#if $app_state.mode !== 'total'}
    function create_if_block_13(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "LV" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(70:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if $app_state.mode !== 'total'}
    function create_if_block_12(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "EE" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(75:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (84:4) {#if $app_state.mode !== 'total'}
    function create_if_block_11(ctx) {
    	let country0;
    	let t0;
    	let country1;
    	let t1;
    	let country2;
    	let t2;
    	let country3;
    	let t3;
    	let country4;
    	let current;
    	country0 = new Country({ props: { country: "US" }, $$inline: true });
    	country1 = new Country({ props: { country: "GB" }, $$inline: true });
    	country2 = new Country({ props: { country: "IE" }, $$inline: true });
    	country3 = new Country({ props: { country: "ES" }, $$inline: true });
    	country4 = new Country({ props: { country: "PT" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country0.$$.fragment);
    			t0 = space();
    			create_component(country1.$$.fragment);
    			t1 = space();
    			create_component(country2.$$.fragment);
    			t2 = space();
    			create_component(country3.$$.fragment);
    			t3 = space();
    			create_component(country4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(country1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(country2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(country3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(country4, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country0.$$.fragment, local);
    			transition_in(country1.$$.fragment, local);
    			transition_in(country2.$$.fragment, local);
    			transition_in(country3.$$.fragment, local);
    			transition_in(country4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country0.$$.fragment, local);
    			transition_out(country1.$$.fragment, local);
    			transition_out(country2.$$.fragment, local);
    			transition_out(country3.$$.fragment, local);
    			transition_out(country4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(country1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(country2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(country3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(country4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(84:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (93:4) {#if $app_state.mode !== 'total'}
    function create_if_block_10(ctx) {
    	let country0;
    	let t0;
    	let country1;
    	let t1;
    	let country2;
    	let t2;
    	let country3;
    	let t3;
    	let country4;
    	let t4;
    	let country5;
    	let t5;
    	let country6;
    	let current;
    	country0 = new Country({ props: { country: "DE" }, $$inline: true });
    	country1 = new Country({ props: { country: "FR" }, $$inline: true });
    	country2 = new Country({ props: { country: "BE" }, $$inline: true });
    	country3 = new Country({ props: { country: "NL" }, $$inline: true });
    	country4 = new Country({ props: { country: "LU" }, $$inline: true });
    	country5 = new Country({ props: { country: "CH" }, $$inline: true });
    	country6 = new Country({ props: { country: "IT" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country0.$$.fragment);
    			t0 = space();
    			create_component(country1.$$.fragment);
    			t1 = space();
    			create_component(country2.$$.fragment);
    			t2 = space();
    			create_component(country3.$$.fragment);
    			t3 = space();
    			create_component(country4.$$.fragment);
    			t4 = space();
    			create_component(country5.$$.fragment);
    			t5 = space();
    			create_component(country6.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(country1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(country2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(country3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(country4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(country5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(country6, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country0.$$.fragment, local);
    			transition_in(country1.$$.fragment, local);
    			transition_in(country2.$$.fragment, local);
    			transition_in(country3.$$.fragment, local);
    			transition_in(country4.$$.fragment, local);
    			transition_in(country5.$$.fragment, local);
    			transition_in(country6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country0.$$.fragment, local);
    			transition_out(country1.$$.fragment, local);
    			transition_out(country2.$$.fragment, local);
    			transition_out(country3.$$.fragment, local);
    			transition_out(country4.$$.fragment, local);
    			transition_out(country5.$$.fragment, local);
    			transition_out(country6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(country1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(country2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(country3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(country4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(country5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(country6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(93:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (106:4) {:else}
    function create_else_block_1$1(ctx) {
    	let topcountries;
    	let current;

    	topcountries = new TopCountries({
    			props: { level: "total" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(topcountries.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(topcountries, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topcountries.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topcountries.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(topcountries, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(106:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (104:4) {#if $app_state.mode !== 'total'}
    function create_if_block_9(ctx) {
    	let map;
    	let current;
    	map = new Map$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(map.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(map, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(map, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(104:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (111:4) {#if $app_state.mode !== 'total'}
    function create_if_block_8(ctx) {
    	let country0;
    	let t0;
    	let country1;
    	let t1;
    	let country2;
    	let t2;
    	let country3;
    	let t3;
    	let country4;
    	let t4;
    	let country5;
    	let t5;
    	let country6;
    	let current;
    	country0 = new Country({ props: { country: "RU" }, $$inline: true });
    	country1 = new Country({ props: { country: "BY" }, $$inline: true });
    	country2 = new Country({ props: { country: "UA" }, $$inline: true });
    	country3 = new Country({ props: { country: "GR" }, $$inline: true });
    	country4 = new Country({ props: { country: "CY" }, $$inline: true });
    	country5 = new Country({ props: { country: "MT" }, $$inline: true });
    	country6 = new Country({ props: { country: "JP" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country0.$$.fragment);
    			t0 = space();
    			create_component(country1.$$.fragment);
    			t1 = space();
    			create_component(country2.$$.fragment);
    			t2 = space();
    			create_component(country3.$$.fragment);
    			t3 = space();
    			create_component(country4.$$.fragment);
    			t4 = space();
    			create_component(country5.$$.fragment);
    			t5 = space();
    			create_component(country6.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(country1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(country2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(country3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(country4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(country5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(country6, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country0.$$.fragment, local);
    			transition_in(country1.$$.fragment, local);
    			transition_in(country2.$$.fragment, local);
    			transition_in(country3.$$.fragment, local);
    			transition_in(country4.$$.fragment, local);
    			transition_in(country5.$$.fragment, local);
    			transition_in(country6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country0.$$.fragment, local);
    			transition_out(country1.$$.fragment, local);
    			transition_out(country2.$$.fragment, local);
    			transition_out(country3.$$.fragment, local);
    			transition_out(country4.$$.fragment, local);
    			transition_out(country5.$$.fragment, local);
    			transition_out(country6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(country1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(country2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(country3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(country4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(country5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(country6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(111:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#if $app_state.mode === 'bywojewodztwo'}
    function create_if_block_7(ctx) {
    	let topcountries;
    	let current;

    	topcountries = new TopCountries({
    			props: { level: "wojewodztwo" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(topcountries.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(topcountries, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topcountries.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topcountries.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(topcountries, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(122:4) {#if $app_state.mode === 'bywojewodztwo'}",
    		ctx
    	});

    	return block;
    }

    // (125:4) {#if $app_state.mode === 'bycountry'}
    function create_if_block_6(ctx) {
    	let topcountries;
    	let current;

    	topcountries = new TopCountries({
    			props: { level: "countryts" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(topcountries.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(topcountries, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topcountries.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topcountries.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(topcountries, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(125:4) {#if $app_state.mode === 'bycountry'}",
    		ctx
    	});

    	return block;
    }

    // (134:4) {#if $app_state.mode !== 'total'}
    function create_if_block_5(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "SI" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(134:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (139:4) {#if $app_state.mode !== 'total'}
    function create_if_block_4$1(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "AT" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(139:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (144:4) {#if $app_state.mode !== 'total'}
    function create_if_block_3$1(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "CZ" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(144:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (149:4) {#if $app_state.mode !== 'total'}
    function create_if_block_2$2(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "SK" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(149:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    // (154:4) {#if $app_state.mode !== 'total'}
    function create_if_block_1$2(ctx) {
    	let country;
    	let current;
    	country = new Country({ props: { country: "HU" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(country.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(country, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(country.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(country.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(country, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(154:4) {#if $app_state.mode !== 'total'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let control;
    	let t;
    	let div2;
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	control = new Control({ $$inline: true });
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*$country_codes, $map_geojson, $tourists*/ 7) show_if = !!(Object.keys(/*$country_codes*/ ctx[0]).length === 0 || Object.keys(/*$map_geojson*/ ctx[1]).length === 0 || Object.keys(/*$tourists*/ ctx[2]).length === 0);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(control.$$.fragment);
    			t = space();
    			div2 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "pure-u-1-1");
    			add_location(div0, file$4, 27, 2, 830);
    			attr_dev(div1, "class", "pure-g");
    			add_location(div1, file$4, 26, 1, 807);
    			attr_dev(div2, "class", "pure-g");
    			add_location(div2, file$4, 31, 1, 888);
    			attr_dev(main, "class", "svelte-1cmphro");
    			add_location(main, file$4, 25, 0, 799);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			mount_component(control, div0, null);
    			append_dev(main, t);
    			append_dev(main, div2);
    			if_blocks[current_block_type_index].m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div2, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(control.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(control.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(control);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $country_codes;
    	let $map_geojson;
    	let $tourists;
    	let $app_state;
    	validate_store(country_codes, "country_codes");
    	component_subscribe($$self, country_codes, $$value => $$invalidate(0, $country_codes = $$value));
    	validate_store(map_geojson, "map_geojson");
    	component_subscribe($$self, map_geojson, $$value => $$invalidate(1, $map_geojson = $$value));
    	validate_store(tourists, "tourists");
    	component_subscribe($$self, tourists, $$value => $$invalidate(2, $tourists = $$value));
    	validate_store(app_state, "app_state");
    	component_subscribe($$self, app_state, $$value => $$invalidate(3, $app_state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(async () => {
    		const country_codes_raw = await fetch("data/country_codes.json");
    		var country_codes_data = await country_codes_raw.json();
    		const map_geojson_raw = await fetch("data/map_data.geojson");
    		var map_geojson_data = await map_geojson_raw.json();
    		const tourists_raw = await fetch("data/tourists_total.json");
    		var tourists_data = await tourists_raw.json();
    		country_codes.set(country_codes_data);
    		map_geojson.set(map_geojson_data);
    		tourists.set(tourists_data);
    	});

    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		app_state,
    		country_codes,
    		map_geojson,
    		tourists,
    		onMount,
    		Map: Map$1,
    		Country,
    		Control,
    		TopCountries,
    		$country_codes,
    		$map_geojson,
    		$tourists,
    		$app_state
    	});

    	return [$country_codes, $map_geojson, $tourists, $app_state];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
