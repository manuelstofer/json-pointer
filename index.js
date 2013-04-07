'use strict';

var each = require('foreach');
module.exports = api


/**
 * Convenience wrapper around the api.
 * Calls `.get` when called with an `object` and a `pointer`.
 * Calls `.set` when also called with `value`.
 * If only supplied `object`, returns a partially applied function, mapped to the object.
 *
 * @param obj
 * @param pointer
 * @param value
 * @returns {*}
 */

function api(obj, pointer, value) {
    // .set()
    if (arguments.length === 3) {
        return api.set(obj, pointer, value)
    }
    // .get()
    if (arguments.length === 2) {
        return api.get(obj, pointer)
    }
    // Return a partially applied function on `obj`.
    return api.bind(api, obj)
}


/**
 * Lookup a json object in an object
 *
 * @param obj
 * @param pointer
 * @returns {*}
 */
api.get = function get(obj, pointer) {
    return api.lookup(obj, api.parse(pointer));
}

/**
 * Sets a value on an object
 *
 * @param obj
 * @param pointer
 * @param value
 */
api.set = function set(obj, pointer, value) {
    var refTokens = api.parse(pointer),
        tok,
        nextTok;
    while (refTokens.length > 1) {
        tok = refTokens.shift();
        nextTok = refTokens[0];

        if (!obj.hasOwnProperty(tok)) {
            if (nextTok.match(/^\d+$/)) {
                obj[tok] = [];
            } else {
                obj[tok] = {};
            }
        }
        obj = obj[tok];
    }
    obj[nextTok] = value;
},

/**
 * Returns a (pointer -> value) dictionary for an object
 *
 * @param obj
 * @returns {{}}
 */
api.dict = function dict(obj) {
    var results = {},
        refTokens = [],

        mapObj = function (cur) {
            var type = Object.prototype.toString.call(cur);
            if (type === '[object Object]' || type === '[object Array]') {

                each(cur, function (value, key) {
                    refTokens.push(key);
                    mapObj(value);
                    refTokens.pop();
                });

            } else {
                results[api.compile(refTokens)] = cur;
            }
        };

    mapObj(obj);
    return results;
}

/**
 * Iterates over an object
 * Iterator: function (value, pointer) {}
 *
 * @param obj
 * @param iterator
 */
api.walk = function walk(obj, iterator) {
    each(api.dict(obj), iterator);
}

/**
 * Tests if an object has a value for a json pointer
 *
 * @param obj
 * @param pointer
 * @returns {boolean}
 */
api.has = function has(obj, pointer) {
    try {
        api.lookup(obj, api.parse(pointer));
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Looks up a value at location described by a reference token array
 *
 * @not-so-public
 *
 * @param obj
 * @param refTokens
 * @returns {*}
 */
api.lookup = function lookup(obj, refTokens) {
    var tok;
    while (refTokens.length) {
        tok = refTokens.shift();
        if (!obj.hasOwnProperty(tok)) {
            throw new Error('Invalid reference token:' + tok);
        }
        obj = obj[tok];
    }
    return obj;
}

/**
 * Escapes a reference token
 *
 * @param str
 * @returns {string}
 */
api.escape = function escape(str) {
    return str.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Unescapes a reference token
 *
 * @param str
 * @returns {string}
 */
api.unescape = function unescape(str) {
    return str.replace(/~1/g, '/').replace(/~0/g, '~');
}

/**
 * Converts a json pointer into a array of reference tokens
 *
 * @param pointer
 * @returns {Array}
 */
api.parse = function parse(pointer) {
    if (pointer === '') { return []; }
    if (pointer.charAt(0) !== '/') { throw new Error('Invalid JSON pointer:' + pointer); }
    return pointer.substring(1).split(/\//).map(api.unescape);
}

/**
 * Builds a json pointer from a array of reference tokens
 *
 * @param refTokens
 * @returns {string}
 */
api.compile = function compile(refTokens) {
    return '/' + refTokens.map(api.escape).join('/');
}

