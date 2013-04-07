/*global describe, it*/
if (typeof pointer === 'undefined') {
    var pointer  = pointer || require('..'),
        chai     = chai || require('chai'),
        each     = each || require('foreach');
}


chai.should();

describe('json-api', function () {
    'use strict';

    describe('#get', function () {
        it('should work with the examples of the rfc', function () {
            var data = {
                    "foo":      ["bar", "baz"],
                    "":         0,
                    "a/b":      1,
                    "c%d":      2,
                    "e^f":      3,
                    "g|h":      4,
                    "i\\j":     5,
                    "k\"l":     6,
                    " ":        7,
                    "m~n":      8
                },

                expected = {
                    "":         data,
                    "/foo":     data.foo,
                    "/foo/0":   "bar",
                    "/":        0,
                    "/a~1b":    1,
                    "/c%d":     2,
                    "/e^f":     3,
                    "/g|h":     4,
                    "/i\\j":    5,
                    "/k\"l":    6,
                    "/ ":       7,
                    "/m~0n":    8
                };

            each(expected, function (expectedValue, p) {
                pointer.get(data, p).should.equal(expectedValue);
            });
        });
    });

    describe('#set', function () {
        it('should set a value on an object', function () {
            var obj = {
                existing: 'bla'
            };

            pointer.set(obj, '/new-value/bla', 'expected');
            obj['new-value'].bla.should.equal('expected');
        });

        it('should create arrays for numeric reference tokens and objects for other tokens', function () {
            var obj = [];
            pointer.set(obj, '/0/test/0', 'expected');
            Array.isArray(obj).should.be.true;
            Array.isArray(obj[0]).should.be.false;
            Array.isArray(obj[0].test).should.be.true;
        });
    });

    describe('#dict', function () {
        it('should return a dictionary (pointer -> value)', function () {
            var obj = {
                    bla: {
                        test: 'expected'
                    },
                    abc: 'bla'
                },
                dict = pointer.dict(obj);

            dict['/bla/test'].should.equal('expected');
            dict['/abc'].should.equal('bla');
        });
    });

    describe('#walk', function () {
        it('should iterate over an object', function () {
            pointer.walk({bla: {test: 'expected'}}, function (value, pointer) {
                pointer.should.equal('/bla/test');
                value.should.equal('expected');
            });
        });
    });

    describe('#parse', function () {
        it('should convert a pointer to an array of reference tokens', function () {
            pointer.parse('/hello~0bla/test~1bla')[0].should.equal('hello~bla');
            pointer.parse('/hello~0bla/test~1bla')[1].should.equal('test/bla');
        });
    });

    describe('#compile', function () {
        it('should build a json pointer from an array of reference tokens', function () {
            pointer.compile(['hello~bla', 'test/bla']).should.equal('/hello~0bla/test~1bla');
        });
    });
});

describe('convenience api wrapper', function() {
    it('should call #get when passed 2 args', function() {
        var obj = {
            existing: 'expected'
        };

        pointer(obj, '/existing');
        obj['existing'].should.equal('expected');

    });
    it('should call #set when passed 3 args', function() {
        var obj = {
            existing: 'bla'
        };

        pointer(obj, '/new-value/bla', 'expected');
        obj['new-value'].bla.should.equal('expected');

    });
    it('should return a partially applied function when passed 1 arg', function() {
        var obj = {
            existing: 'bla'
        };

        var objPointer = pointer(obj);
        objPointer('/new-value/bla', 'expected');
        objPointer('/new-value').bla.should.equal('expected');
    });
});
