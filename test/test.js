'use strict';

var test = require('tape');
var MapboxGLFunction = require('../');

test('function types', function(t) {

    t.test('contant', function(t) {

        t.test('range types', function(t) {

            t.test('array', function(t) {
                var f = MapboxGLFunction([1]);

                t.deepEqual(f({'$zoom': 0})({}), [1]);
                t.deepEqual(f({'$zoom': 1})({}), [1]);
                t.deepEqual(f({'$zoom': 2})({}), [1]);

                t.end();
            });

            t.test('number', function(t) {
                var f = MapboxGLFunction(1);

                t.equal(f({'$zoom': 0})({}), 1);
                t.equal(f({'$zoom': 1})({}), 1);
                t.equal(f({'$zoom': 2})({}), 1);

                t.end();
            });

            t.test('string', function(t) {
                var f = MapboxGLFunction('mapbox');

                t.equal(f({'$zoom': 0})({}), 'mapbox');
                t.equal(f({'$zoom': 1})({}), 'mapbox');
                t.equal(f({'$zoom': 2})({}), 'mapbox');

                t.end();
            });

        });

    });

    t.test('exponential', function(t) {

        t.test('base', function(t) {
            var f = MapboxGLFunction({
                type: 'exponential',
                domain: [1, 3],
                range: [2, 6],
                base: 2
            });

            t.equal(f({'$zoom': 0})({}), 2);
            t.equal(f({'$zoom': 1})({}), 2);
            t.equal(f({'$zoom': 2})({}), 30 / 9);
            t.equal(f({'$zoom': 3})({}), 6);
            t.equal(f({'$zoom': 4})({}), 6);

            t.end();
        });

        t.test('domain & range', function(t) {
            t.test('one element', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    domain: [1],
                    range: [2]
                });

                t.equal(f({'$zoom': 0})({}), 2);
                t.equal(f({'$zoom': 1})({}), 2);
                t.equal(f({'$zoom': 2})({}), 2);

                t.end();
            });

            t.test('two elements', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    domain: [1, 3],
                    range: [2, 6]
                });

                t.equal(f({'$zoom': 0})({}), 2);
                t.equal(f({'$zoom': 1})({}), 2);
                t.equal(f({'$zoom': 2})({}), 4);
                t.equal(f({'$zoom': 3})({}), 6);
                t.equal(f({'$zoom': 4})({}), 6);

                t.end();
            });

            t.test('three elements', function(t) {
                var f = MapboxGLFunction({
                    type: 'exponential',
                    domain: [1, 3, 5],
                    range: [2, 6, 10]
                });

                t.equal(f({'$zoom': 0})({}), 2);
                t.equal(f({'$zoom': 1})({}), 2);
                t.equal(f({'$zoom': 2})({}), 4);
                t.equal(f({'$zoom': 3})({}), 6);
                t.equal(f({'$zoom': 4})({}), 8);
                t.equal(f({'$zoom': 5})({}), 10);
                t.equal(f({'$zoom': 6})({}), 10);

                t.end();
            });

        });

    });

    t.test('categorical', function(t) {

        t.test('one element', function(t) {
            var f = MapboxGLFunction({
                type: 'categorical',
                domain: ['umpteen'],
                range: [42],
                property: 'mapbox'
            });

            t.equal(f({})({mapbox: 'umpteen'}), 42);
            t.equal(f({})({mapbox: 'derp'}), 42);

            t.end();
        });

        t.test('two elements', function(t) {
            var f = MapboxGLFunction({
                type: 'categorical',
                domain: ['umpteen', 'eleventy'],
                range: [42, 110],
                property: 'mapbox'
            });

            t.equal(f({})({mapbox: 'umpteen'}), 42);
            t.equal(f({})({mapbox: 'eleventy'}), 110);
            t.equal(f({})({mapbox: 'derp'}), 42);


            t.end();
        });

    });

    t.test('interval', function(t) {

        t.test('one domain element', function(t) {
            var f = MapboxGLFunction({
                type: 'interval',
                domain: [0],
                range: [11, 111],
                property: 'mapbox'
            });

            t.equal(f({})({mapbox: -0.5}), 11);
            t.equal(f({})({mapbox: 0}), 111);
            t.equal(f({})({mapbox: 0.5}), 111);

            t.end();
        });

        t.test('two domain elements', function(t) {
            var f = MapboxGLFunction({
                type: 'interval',
                domain: [0, 1],
                range: [11, 111, 1111],
                property: 'mapbox'
            });

            t.equal(f({})({mapbox: -0.5}), 11);
            t.equal(f({})({mapbox: 0}), 111);
            t.equal(f({})({mapbox: 0.5}), 111);
            t.equal(f({})({mapbox: 1}), 1111);
            t.equal(f({})({mapbox: 1.5}), 1111);

            t.end();
        });

    });

});

test('property', function(t) {

    t.test('missing property', function(t) {
        var f = MapboxGLFunction({
            type: 'categorical',
            domain: ['map', 'box'],
            range: ['neat', 'swell'],
            property: 'mapbox'
        });

        t.equal(f({})({}), 'neat');

        t.end();
    });

    t.test('global property', function(t) {
        var f = MapboxGLFunction({
            type: 'categorical',
            domain: ['map', 'box'],
            range: ['neat', 'swell'],
            property: 'mapbox'
        });

        t.equal(f({})({mapbox: 'box'}), 'swell');

        t.end();
    });

    t.test('feature property', function(t) {
        var f = MapboxGLFunction({
            type: 'categorical',
            domain: ['map', 'box'],
            range: ['neat', 'swell'],
            property: 'mapbox'
        });

        t.equal(f({})({mapbox: 'box'}), 'swell');

        t.end();
    });

    t.end();
});

test('isConstant', function(t) {

    t.test('constant', function(t) {
        var f = MapboxGLFunction(1);

        t.ok(f.isConstant);
        t.ok(f({}).isConstant);

        t.ok(f.isGlobalConstant);
        t.ok(f({}).isGlobalConstant);

        t.ok(f.isFeatureConstant);
        t.ok(f({}).isFeatureConstant);

        t.equal(f.value, 1);
        t.equal(f({}).value, 1);

        t.end();
    });

    t.test('global', function(t) {
        var f = MapboxGLFunction({
            domain: [1],
            range: [1],
            property: '$zoom'
        });

        t.notOk(f.isConstant);
        t.ok(f({}).isConstant);

        t.notOk(f.isGlobalConstant);
        t.notOk(f({}).isGlobalConstant);

        t.ok(f.isFeatureConstant);
        t.ok(f({}).isFeatureConstant);

        t.notOk(f.value);
        t.equal(f({'$zoom': 0}).value, 1);

        t.end();
    });

    t.test('feature', function(t) {
        var f = MapboxGLFunction({
            domain: [1],
            range: [1],
            property: 'mapbox'
        });

        t.notOk(f.isConstant);
        t.notOk(f({}).isConstant);

        t.notOk(f.isGlobalConstant);
        t.notOk(f({}).isGlobalConstant);

        t.notOk(f.isFeatureConstant);
        t.notOk(f({}).isFeatureConstant);

        t.notOk(f.value);
        t.notOk(f({}).value);

        t.end();
    });

    t.end();

});

test('mix', function(t) {

    t.test('global constant, global constant', function(t) {
        var lower = MapboxGLFunction(0);
        var upper = MapboxGLFunction(1);

        t.ok(MapboxGLFunction.mix(lower, upper, 0).isFeatureConstant);
        t.ok(MapboxGLFunction.mix(lower, upper, 0).isGlobalConstant);

        t.equal(MapboxGLFunction.mix(lower, upper, 0).value, 0);
        t.equal(MapboxGLFunction.mix(lower, upper, 0.5).value, 0.5);
        t.equal(MapboxGLFunction.mix(lower, upper, 1).value, 1);

        t.end();
    });

    t.test('feature constant, global constant', function(t) {
        var lower = MapboxGLFunction({domain: [0, 1], range: [1, 2], property: '$zoom'});
        var upper = MapboxGLFunction(0);

        t.ok(MapboxGLFunction.mix(lower, upper, 0).isFeatureConstant);
        t.notOk(MapboxGLFunction.mix(lower, upper, 0).isGlobalConstant);

        t.equal(MapboxGLFunction.mix(lower, upper, 0)({$zoom: 1}).value, 2);
        t.equal(MapboxGLFunction.mix(lower, upper, 0.5)({$zoom: 1}).value, 1);
        t.equal(MapboxGLFunction.mix(lower, upper, 1)({$zoom: 1}).value, 0);

        t.end();
    });

    t.test('global constant, feature constant', function(t) {
        var lower = MapboxGLFunction(0);
        var upper = MapboxGLFunction({domain: [0, 1], range: [1, 2], property: '$zoom'});

        t.ok(MapboxGLFunction.mix(lower, upper, 0).isFeatureConstant);
        t.notOk(MapboxGLFunction.mix(lower, upper, 0).isGlobalConstant);

        t.equal(MapboxGLFunction.mix(lower, upper, 0)({$zoom: 1}).value, 0);
        t.equal(MapboxGLFunction.mix(lower, upper, 0.5)({$zoom: 1}).value, 1);
        t.equal(MapboxGLFunction.mix(lower, upper, 1)({$zoom: 1}).value, 2);

        t.end();
    });

    t.test('feature constant, feature constant', function(t) {
        var lower = MapboxGLFunction({domain: [0, 1], range: [0, 1], property: '$zoom'});
        var upper = MapboxGLFunction({domain: [0, 1], range: [1, 2], property: '$zoom'});

        t.ok(MapboxGLFunction.mix(lower, upper, 0).isFeatureConstant);
        t.notOk(MapboxGLFunction.mix(lower, upper, 0).isGlobalConstant);

        t.equal(MapboxGLFunction.mix(lower, upper, 0)({$zoom: 1}).value, 1);
        t.equal(MapboxGLFunction.mix(lower, upper, 0.5)({$zoom: 1}).value, 1.5);
        t.equal(MapboxGLFunction.mix(lower, upper, 1)({$zoom: 1}).value, 2);

        t.end();
    });

    t.test('feature constant, not constant', function(t) {
        var lower = MapboxGLFunction({domain: [0, 1], range: [0, 1], property: '$zoom'});
        var upper = MapboxGLFunction({domain: [0, 1], range: [1, 2], property: 'mapbox'});

        t.notOk(MapboxGLFunction.mix(lower, upper, 0).isFeatureConstant);
        t.notOk(MapboxGLFunction.mix(lower, upper, 0).isGlobalConstant);

        t.equal(MapboxGLFunction.mix(lower, upper, 0)({$zoom: 1})({mapbox: 2}), 1);
        t.equal(MapboxGLFunction.mix(lower, upper, 0.5)({$zoom: 1})({mapbox: 2}), 1.5);
        t.equal(MapboxGLFunction.mix(lower, upper, 1)({$zoom: 1})({mapbox: 2}), 2);

        t.end();
    });

    t.test('feature constant, not constant', function(t) {
        var lower = MapboxGLFunction({domain: [0, 1], range: [1, 2], property: 'mapbox'});
        var upper = MapboxGLFunction({domain: [0, 1], range: [0, 1], property: '$zoom'});

        t.notOk(MapboxGLFunction.mix(lower, upper, 0).isFeatureConstant);
        t.notOk(MapboxGLFunction.mix(lower, upper, 0).isGlobalConstant);

        t.equal(MapboxGLFunction.mix(lower, upper, 0)({$zoom: 1})({mapbox: 2}), 2);
        t.equal(MapboxGLFunction.mix(lower, upper, 0.5)({$zoom: 1})({mapbox: 2}), 1.5);
        t.equal(MapboxGLFunction.mix(lower, upper, 1)({$zoom: 1})({mapbox: 2}), 1);

        t.end();
    });

    t.test('not constant, not constant', function(t) {
        var lower = MapboxGLFunction({domain: [0, 1], range: [1, 2], property: 'mapbox'});
        var upper = MapboxGLFunction({domain: [0, 1], range: [0, 1], property: 'mapbox'});

        t.notOk(MapboxGLFunction.mix(lower, upper, 0).isFeatureConstant);
        t.notOk(MapboxGLFunction.mix(lower, upper, 0).isGlobalConstant);

        t.equal(MapboxGLFunction.mix(lower, upper, 0)({$zoom: 1})({mapbox: 2}), 2);
        t.equal(MapboxGLFunction.mix(lower, upper, 0.5)({$zoom: 1})({mapbox: 2}), 1.5);
        t.equal(MapboxGLFunction.mix(lower, upper, 1)({$zoom: 1})({mapbox: 2}), 1);

        t.end();
    });

    t.end();

});

