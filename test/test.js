/*global describe, it, beforeEach*/
if (typeof pointer === 'undefined') {
    var pointer  = require('..'),
        chai     = require('chai'),
        each     = require('foreach');
}

var expect = chai.expect;


chai.should();

describe('json-api', function () {
    'use strict';

    var rfcExample,
        rfcValues;

    function resetExamples() {
        rfcExample = {
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
        };

        rfcValues = {
            "":         rfcExample,
            "/foo":     rfcExample.foo,
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
    }
    resetExamples();
    beforeEach(resetExamples);

    describe('#get', function () {

        it('should work for root element', function () {
            var obj = {};
            pointer.get(obj, '').should.equal(obj);
        });

        each(Object.keys(rfcValues), function (p) {
            it('should work for "' + p + '"', function () {
                var expectedValue = rfcValues[p];
                pointer.get(rfcExample, p).should.equal(expectedValue);
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

        it('should work on first level', function () {
            var obj = {
                existing: 'bla'
            };

            pointer.set(obj, '/first-level', 'expected');
            obj['first-level'].should.equal('expected');
        });

        it('should create arrays for numeric reference tokens and objects for other tokens', function () {
            var obj = [];
            pointer.set(obj, '/0/test/0', 'expected');
            Array.isArray(obj).should.be.true;
            Array.isArray(obj[0]).should.be.false;
            Array.isArray(obj[0].test).should.be.true;
        });
    });

    describe('#remove', function () {
        each(Object.keys(rfcValues), function (p) {
            if (p !== '') {
                it('should work for "' + p + '"', function () {
                    pointer.remove(rfcExample, p);
                    expect(pointer.get.bind(pointer, rfcExample, p)).to.throw(Error);
                });
            }
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

        it('should work with arrays', function () {
            var obj = {
                    "users": [
                        {"name": "example 1"},
                        {"name": "example 2"}
                    ]
                },
                dict = pointer.dict(obj),
                pointers = Object.keys(dict);

            pointers.length.should.equal(2);
            pointers[0].should.equal('/users/0/name');
            pointers[1].should.equal('/users/1/name');
        });

        it('should work with other arrays', function () {
            var obj = {
                    bla : {
                        bli : [4, 5, 6]
                    }
                },
                dict = pointer.dict(obj);
            dict['/bla/bli/0'].should.equal(4);
            dict['/bla/bli/1'].should.equal(5);
            dict['/bla/bli/2'].should.equal(6);
        });
    });

    describe('#has', function () {
        it('should return true when the pointer exists', function () {
            var obj = {
                    bla: {
                        test: 'expected'
                    },
                    foo: [['hello']],
                    abc: 'bla'
                };
            pointer.has(obj, '/bla').should.be.true;
            pointer.has(obj, '/abc').should.be.true;
            pointer.has(obj, '/foo/0/0').should.be.true;
            pointer.has(obj, '/bla/test').should.be.true;
        });
        it('should return false when the pointer does not exist', function () {
            var obj = {
                bla: {
                    test: 'expected'
                },
                abc: 'bla'
            };
            pointer.has(obj, '/not-existing').should.be.false;
            pointer.has(obj, '/not-existing/bla').should.be.false;
            pointer.has(obj, '/test/1/bla').should.be.false;
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
        it('should work with top level path', function () {
            pointer.parse('/bla')[0].should.equal('bla');
            pointer.parse('/bla').length.should.equal(1);
        });

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

    describe('#parse and then #compile pointer', function () {
        each(Object.keys(rfcValues), function (p) {
            it('should equal for "' + p + '"', function () {
                pointer.compile(pointer.parse(p)).should.equal(p);
            });
        });
    });
});

describe('convenience api wrapper', function() {
    it('should call #get when passed 2 args', function() {
        var obj = {
            existing: 'expected'
        };

        pointer(obj, '/existing');
        obj.existing.should.equal('expected');
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
            },
            objPointer = pointer(obj);

        objPointer('/new-value/bla', 'expected');
        objPointer('/new-value').bla.should.equal('expected');
    });

    it('should support chainable oo-style', function() {
        var obj = {
                existing: 'bla'
            },
            objPointer = pointer(obj);

        objPointer.set('/oo-style', 'bla').set('/example/0', 'bla');
        objPointer.get('/oo-style').should.equal('bla');
    });
});
