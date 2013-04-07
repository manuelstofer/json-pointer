'use strict';

var each = require('foreach');

var api = module.exports = {

    /**
     * Lookup a json object in an object
     *
     * @param obj
     * @param pointer
     * @returns {*}
     */
    get: function (obj, pointer) {
        return api.lookup(obj, api.parse(pointer));
    },

    /**
     * Sets a value on an object
     *
     * @param obj
     * @param pointer
     * @param value
     */
    set: function (obj, pointer, value) {
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
    dict: function (obj) {
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
    },

    /**
     * Iterates over an object
     * Iterator: function (value, pointer) {}
     *
     * @param obj
     * @param iterator
     */
    walk: function (obj, iterator) {
        each(api.dict(obj), iterator);
    },

    /**
     * Tests if an object has a value for a json pointer
     *
     * @param obj
     * @param pointer
     * @returns {boolean}
     */
    has: function (obj, pointer) {
        try {
            api.lookup(obj, api.parse(pointer));
        } catch (e) {
            return false;
        }
        return true;
    },

    /**
     * Looks up a value at location described by a reference token array
     *
     * @not-so-public
     *
     * @param obj
     * @param refTokens
     * @returns {*}
     */
    lookup: function (obj, refTokens) {
        var tok;
        while (refTokens.length) {
            tok = refTokens.shift();
            if (!obj.hasOwnProperty(tok)) {
                throw new Error('Invalid reference token:' + tok);
            }
            obj = obj[tok];
        }
        return obj;
    },

    /**
     * Escapes a reference token
     *
     * @param str
     * @returns {XML}
     */
    escape: function (str) {
        return str.replace(/~/g, '~0').replace(/\//g, '~1');
    },

    /**
     * Unescapes a reference token
     *
     * @param str
     * @returns {XML}
     */
    unescape: function (str) {
        return str.replace(/~1/g, '/').replace(/~0/g, '~');
    },

    /**
     * Converts a json pointer into a array of reference tokens
     *
     * @param pointer
     * @returns {Array}
     */
    parse: function (pointer) {
        if (pointer === '') { return []; }
        if (pointer.charAt(0) !== '/') { throw new Error('Invalid JSON pointer:' + pointer); }
        return pointer.substring(1).split(/\//).map(api.unescape);
    },

    /**
     * Builds a json pointer from a array of reference tokens
     *
     * @param refTokens
     * @returns {string}
     */
    compile: function (refTokens) {
        return '/' + refTokens.map(api.escape).join('/');
    }
};

