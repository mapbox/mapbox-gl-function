'use strict';

var test = require('tape');
var MapboxGLFunction = require('../').interpolated;

test('function types', function(t) {

    t.test('contant', function(t) {

        t.test('range types', function(t) {

            t.test('array', function(t) {
                var f = MapboxGLFunction([1]);

                t.deepEqual(f(0), [1]);
                t.deepEqual(f(1), [1]);
                t.deepEqual(f(2), [1]);

                t.end();
            });

            t.test('number', function(t) {
                var f = MapboxGLFunction(1);

                t.equal(f(0), 1);
                t.equal(f(1), 1);
                t.equal(f(2), 1);

                t.end();
            });

            t.test('string', function(t) {
                var f = MapboxGLFunction('mapbox');

                t.equal(f(0), 'mapbox');
                t.equal(f(1), 'mapbox');
                t.equal(f(2), 'mapbox');

                t.end();
            });

        });

    });

    t.test('exponential', function(t) {

        t.test('base', function(t) {
            var f = MapboxGLFunction({
                type: 'exponential',
                stops: [[1, 2], [3, 6]],
                base: 2
            });

            t.equal(f(0), 2);
            t.equal(f(1), 2);
            t.equal(f(2), 30 / 9);
            t.equal(f(3), 6);
            t.equal(f(4), 6);

            t.end();
        });

        t.test('stops', function(t) {
            t.test('one element', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    stops: [[1, 2]]
                });

                t.equal(f(0), 2);
                t.equal(f(1), 2);
                t.equal(f(2), 2);

                t.end();
            });

            t.test('two elements', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    stops: [[1, 2], [3, 6]]
                });

                t.equal(f(0), 2);
                t.equal(f(1), 2);
                t.equal(f(2), 4);
                t.equal(f(3), 6);
                t.equal(f(4), 6);

                t.end();
            });

            t.test('three elements', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    stops: [[1, 2], [3, 6], [5, 10]]
                });

                t.equal(f(0), 2);
                t.equal(f(1), 2);
                t.equal(f(2), 4);
                t.equal(f(3), 6);
                t.equal(f(4), 8);
                t.equal(f(5), 10);
                t.equal(f(6), 10);

                t.end();
            });

        });

        t.test('zoom + data stops', function(t) {
            t.test('one element', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    property: 'prop',
                    stops: [[{ zoom: 1, value: 1 }, 2]]
                });

                t.equal(f(0, { prop: 0 }), 2);
                t.equal(f(1, { prop: 0 }), 2);
                t.equal(f(2, { prop: 0 }), 2);
                t.equal(f(0, { prop: 1 }), 2);
                t.equal(f(1, { prop: 1 }), 2);
                t.equal(f(2, { prop: 1 }), 2);
                t.equal(f(0, { prop: 2 }), 2);
                t.equal(f(1, { prop: 2 }), 2);
                t.equal(f(2, { prop: 2 }), 2);

                t.end();
            });

            t.test('two elements', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    property: 'prop',
                    base: 1,
                    stops: [
                        [{ zoom: 1, value: 0 }, 0],
                        [{ zoom: 1, value: 2 }, 4],
                        [{ zoom: 3, value: 0 }, 0],
                        [{ zoom: 3, value: 2 }, 12]]
                });

                t.equal(f(0, { prop: 1 }), 2);
                t.equal(f(1, { prop: 1 }), 2);
                t.equal(f(2, { prop: 1 }), 4);
                t.equal(f(3, { prop: 1 }), 6);
                t.equal(f(4, { prop: 1 }), 6);

                t.equal(f(2, { prop: -1}), 0);
                t.equal(f(2, { prop: 0}), 0);
                t.equal(f(2, { prop: 2}), 8);
                t.equal(f(2, { prop: 3}), 8);

                t.end();
            });

            t.test('three elements', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    property: 'prop',
                    base: 1,
                    stops: [
                        [{ zoom: 1, value: 0}, 0],
                        [{ zoom: 1, value: 2}, 4],
                        [{ zoom: 3, value: 0}, 0],
                        [{ zoom: 3, value: 2}, 12],
                        [{ zoom: 5, value: 0}, 0],
                        [{ zoom: 5, value: 2}, 20]]
                });

                t.equal(f(0, { prop: 1 }), 2);
                t.equal(f(1, { prop: 1 }), 2);
                t.equal(f(2, { prop: 1 }), 4);

                t.end();
            });

            t.test('fractional zoom', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    property: 'prop',
                    base: 1,
                    stops: [
                        [{ zoom: 1.9, value: 0 }, 4],
                        [{ zoom: 2.1, value: 0 }, 8]
                    ]
                });

                t.equal(f(1.9, { prop: 1 }), 4);
                t.equal(f(2, { prop: 1 }), 6);
                t.equal(f(2.1, { prop: 1 }), 8);

                t.end();
            });


        });

        t.test('overflow', function(t) {
            t.test('single stop linear', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    stops: [[12, 12]],
                    base: 1,
                    overflow: true
                });

                t.equal(f(1), 1);
                t.equal(f(5), 5);
                t.equal(f(11), 11);
                t.equal(f(12), 12);
                t.equal(f(13), 13);
                t.equal(f(15), 15);
                t.equal(f(20), 20);

                t.end();
            });

            t.test('single stop exponential', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    stops: [[12, 1]],
                    base: 2,
                    overflow: true
                });

                t.equal(f(1), 1 / 2048);
                t.equal(f(5), 1 / 128);
                t.equal(f(11), 0.5);
                t.equal(f(12), 1);
                t.equal(f(13), 2);
                t.equal(f(15), 8);
                t.equal(f(20), 256);

                t.end();
            });

            t.test('single stop exponential with other start value', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    stops: [[12, 2]],
                    base: 2,
                    overflow: true
                });

                t.equal(f(1), 1 / 1024);
                t.equal(f(5), 1 / 64);
                t.equal(f(11), 1);
                t.equal(f(12), 2);
                t.equal(f(13), 4);
                t.equal(f(15), 16);
                t.equal(f(20), 512);

                t.end();
            });

            t.test('single stop exponential with other base', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    stops: [[12, 1]],
                    base: 1.6,
                    overflow: true
                });

                // the .toFixed(8) is to count for floating point precision errors
                t.equal(f(1).toFixed(8), Math.pow(1.6, -11).toFixed(8));
                t.equal(f(5).toFixed(8), Math.pow(1.6, -7).toFixed(8));
                t.equal(f(11), 0.625);
                t.equal(f(12), 1);
                t.equal(f(13), 1.6);
                t.equal(f(15).toFixed(8), (4.096).toFixed(8));
                t.equal(f(20).toFixed(8), (42.94967296).toFixed(8));

                t.end();
            });

            t.test('multiple stops linear', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    stops: [[10, 1], [12, 2]],
                    base: 1,
                    overflow: true
                });

                t.equal(f(1), -3.5);
                t.equal(f(8), 0);
                t.equal(f(9), 0.5);
                t.equal(f(10), 1);
                t.equal(f(11), 1.5);
                t.equal(f(12), 2);
                t.equal(f(13), 2.5);
                t.equal(f(14), 3);
                t.equal(f(20), 6);

                t.end();
            });

            // start repeat of other exponential tests to make sure they work with overflow
            t.test('base', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    stops: [[1, 2], [3, 6]],
                    base: 2,
                    overflow: true
                });

                t.equal(f(0), 1);
                t.equal(f(1), 2);
                t.equal(f(2), 30 / 9);
                t.equal(f(3), 6);
                t.equal(f(4), 12);

                t.end();
            });

            t.test('stops', function(t) {
                t.test('one element', function(t) {
                    var f = MapboxGLFunction({
                        type: 'exponential',
                        stops: [[1, 2]],
                        overflow: true
                    });

                    t.equal(f(0), 1);
                    t.equal(f(1), 2);
                    t.equal(f(2), 3);

                    t.end();
                });

                t.test('two elements', function(t) {
                    var f = MapboxGLFunction({
                        type: 'exponential',
                        stops: [[1, 2], [3, 6]],
                        overflow: true
                    });

                    t.equal(f(0), 0);
                    t.equal(f(1), 2);
                    t.equal(f(2), 4);
                    t.equal(f(3), 6);
                    t.equal(f(4), 8);

                    t.end();
                });

                t.test('three elements', function(t) {
                    var f = MapboxGLFunction({
                        type: 'exponential',
                        stops: [[1, 2], [3, 6], [5, 10]],
                        overflow: true
                    });

                    t.equal(f(0), 0);
                    t.equal(f(1), 2);
                    t.equal(f(2), 4);
                    t.equal(f(3), 6);
                    t.equal(f(4), 8);
                    t.equal(f(5), 10);
                    t.equal(f(6), 12);

                    t.end();
                });

            });

            t.test('zoom + data stops', function(t) {
                t.test('one element', function(t) {
                    var f = MapboxGLFunction({
                        type: 'exponential',
                        property: 'prop',
                        stops: [[{ zoom: 1, value: 1 }, 2]],
                        overflow: true
                    });

                    t.equal(f(0, { prop: 0 }), 2);
                    t.equal(f(1, { prop: 0 }), 2);
                    t.equal(f(2, { prop: 0 }), 2);
                    t.equal(f(0, { prop: 1 }), 2);
                    t.equal(f(1, { prop: 1 }), 2);
                    t.equal(f(2, { prop: 1 }), 2);
                    t.equal(f(0, { prop: 2 }), 2);
                    t.equal(f(1, { prop: 2 }), 2);
                    t.equal(f(2, { prop: 2 }), 2);

                    t.end();
                });

                t.test('two elements', function(t) {
                    var f = MapboxGLFunction({
                        type: 'exponential',
                        property: 'prop',
                        base: 1,
                        stops: [
                            [{ zoom: 1, value: 0 }, 0],
                            [{ zoom: 1, value: 2 }, 4],
                            [{ zoom: 3, value: 0 }, 0],
                            [{ zoom: 3, value: 2 }, 12]
                        ],
                        overflow: true
                    });

                    t.equal(f(0, { prop: 1 }), 2);
                    t.equal(f(1, { prop: 1 }), 2);
                    t.equal(f(2, { prop: 1 }), 4);
                    t.equal(f(3, { prop: 1 }), 6);
                    t.equal(f(4, { prop: 1 }), 6);

                    t.equal(f(2, { prop: -1}), 0);
                    t.equal(f(2, { prop: 0}), 0);
                    t.equal(f(2, { prop: 2}), 8);
                    t.equal(f(2, { prop: 3}), 8);

                    t.end();
                });

                t.test('three elements', function(t) {
                    var f = MapboxGLFunction({
                        type: 'exponential',
                        property: 'prop',
                        base: 1,
                        stops: [
                            [{ zoom: 1, value: 0}, 0],
                            [{ zoom: 1, value: 2}, 4],
                            [{ zoom: 3, value: 0}, 0],
                            [{ zoom: 3, value: 2}, 12],
                            [{ zoom: 5, value: 0}, 0],
                            [{ zoom: 5, value: 2}, 20]
                        ],
                        overflow: true
                    });

                    t.equal(f(0, { prop: 1 }), 2);
                    t.equal(f(1, { prop: 1 }), 2);
                    t.equal(f(2, { prop: 1 }), 4);

                    t.end();
                });

                t.test('fractional zoom', function(t) {
                    var f = MapboxGLFunction({
                        type: 'exponential',
                        property: 'prop',
                        base: 1,
                        stops: [
                            [{ zoom: 1.9, value: 0 }, 4],
                            [{ zoom: 2.1, value: 0 }, 8]
                        ],
                        overflow: true
                    });

                    t.equal(f(1.9, { prop: 1 }), 4);
                    t.equal(f(2, { prop: 1 }), 6);
                    t.equal(f(2.1, { prop: 1 }), 8);

                    t.end();
                });


            });

        });

    });

    t.test('categorical', function(t) {

        t.test('one element', function(t) {
            var f = MapboxGLFunction({
                type: 'categorical',
                stops: [['umpteen', 42]]
            });

            t.equal(f('umpteen'), 42);
            t.equal(f('derp'), 42);

            t.end();
        });

        t.test('two elements', function(t) {
            var f = MapboxGLFunction({
                type: 'categorical',
                stops: [['umpteen', 42], ['eleventy', 110]]
            });

            t.equal(f('umpteen'), 42);
            t.equal(f('eleventy'), 110);
            t.equal(f('derp'), 42);

            t.end();
        });

    });

    t.test('interval', function(t) {

        t.test('one domain elements', function(t) {
            var f = MapboxGLFunction({
                type: 'interval',
                stops: [[0, 11]]
            });

            t.equal(f(-0.5), 11);
            t.equal(f(0), 11);
            t.equal(f(0.5), 11);

            t.end();
        });

        t.test('two domain elements', function(t) {
            var f = MapboxGLFunction({
                type: 'interval',
                stops: [[-1, 11], [0, 111]]
            });

            t.equal(f(-1.5), 11);
            t.equal(f(-0.5), 11);
            t.equal(f(0), 111);
            t.equal(f(0.5), 111);

            t.end();
        });

        t.test('three domain elements', function(t) {
            var f = MapboxGLFunction({
                type: 'interval',
                stops: [[-1, 11], [0, 111], [1, 1111]]
            });

            t.equal(f(-1.5), 11);
            t.equal(f(-0.5), 11);
            t.equal(f(0), 111);
            t.equal(f(0.5), 111);
            t.equal(f(1), 1111);
            t.equal(f(1.5), 1111);

            t.end();
        });

    });

});

test('property', function(t) {

    t.test('missing property', function(t) {
        var f = MapboxGLFunction({
            type: 'categorical',
            stops: [['map', 'neat'], ['box', 'swell']]
        });

        t.equal(f('box'), 'swell');

        t.end();
    });

    t.test('zoom', function(t) {
        var f = MapboxGLFunction({
            type: 'categorical',
            stops: [['map', 'neat'], ['box', 'swell']]
        });

        t.equal(f('box'), 'swell');

        t.end();
    });

    t.test('feature property', function(t) {
        var f = MapboxGLFunction({
            type: 'categorical',
            stops: [['map', 'neat'], ['box', 'swell']],
            property: 'mapbox'
        });

        t.equal(f({}, {mapbox: 'box'}), 'swell');

        t.end();
    });

    t.end();
});

test('isConstant', function(t) {

    t.test('constant', function(t) {
        var f = MapboxGLFunction(1);

        t.ok(f.isZoomConstant);
        t.ok(f.isFeatureConstant);

        t.end();
    });

    t.test('zoom', function(t) {
        var f = MapboxGLFunction({
            stops: [[1, 1]]
        });

        t.notOk(f.isZoomConstant);
        t.ok(f.isFeatureConstant);

        t.end();
    });

    t.test('feature', function(t) {
        var f = MapboxGLFunction({
            stops: [[1, 1]],
            property: 'mapbox'
        });

        t.ok(f.isZoomConstant);
        t.notOk(f.isFeatureConstant);

        t.end();
    });

    t.test('zoom + feature', function(t) {
        var f = MapboxGLFunction({
            stops: [[{ zoom: 1, data: 1 }, 1]],
            property: 'mapbox'
        });

        t.notOk(f.isZoomConstant);
        t.notOk(f.isFeatureConstant);

        t.end();
    });

    t.end();

});
