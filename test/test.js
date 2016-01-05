'use strict';

var test = require('tape');
var MapboxGLScale = require('../');

test('function types', function(t) {

    t.test('contant', function(t) {

        t.test('range types', function(t) {

            t.test('number', function(t) {
                var f = MapboxGLScale(1);

                t.equal(f(0), 1);
                t.equal(f(1), 1);
                t.equal(f(2), 1);

                t.end();
            });

            t.test('array', function(t) {
                var f = MapboxGLScale([1]);

                t.deepEqual(f([0]), [1]);
                t.deepEqual(f([1]), [1]);
                t.deepEqual(f([2]), [1]);

                t.end();
            });

            t.test('string', function(t) {
                var f = MapboxGLScale('mapbox');

                t.equal(f(0), 'mapbox');
                t.equal(f(1), 'mapbox');
                t.equal(f(2), 'mapbox');

                t.end();
            });

        });

    });

    t.test('exponential', function(t) {

        t.test('base', function(t) {
            var f = MapboxGLScale({
                type: 'exponential',
                domain: [1, 3],
                range: [2, 6],
                base: 2
            });

            t.equal(f(0), 2);
            t.equal(f(1), 2);
            t.equal(f(2), 30 / 9);
            t.equal(f(3), 6);
            t.equal(f(4), 6);

            t.end();
        });

        t.test('domain & range', function(t) {
            t.test('one element', function(t) {
                var f = MapboxGLScale({
                    type: 'exponential',
                    domain: [1],
                    range: [2]
                });

                t.equal(f(0), 2);
                t.equal(f(1), 2);
                t.equal(f(2), 2);

                t.end();
            });

            t.test('two elements', function(t) {
                var f = MapboxGLScale({
                    type: 'exponential',
                    domain: [1, 3],
                    range: [2, 6]
                });

                t.equal(f(0), 2);
                t.equal(f(1), 2);
                t.equal(f(2), 4);
                t.equal(f(3), 6);
                t.equal(f(4), 6);

                t.end();
            });

            t.test('three elements', function(t) {
                var f = MapboxGLScale({
                    type: 'exponential',
                    domain: [1, 3, 5],
                    range: [2, 6, 10]
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

    });

    t.test('categorical', function(t) {

        t.test('one element', function(t) {
            var f = MapboxGLScale({
                type: 'categorical',
                domain: ['umpteen'],
                range: [42]
            });

            t.equal(f('umpteen'), 42);
            t.equal(f('several'), 42);

            t.end();
        });

        t.test('two elements', function(t) {
            var f = MapboxGLScale({
                type: 'categorical',
                domain: ['umpteen', 'eleventy'],
                range: [42, 110]
            });

            t.equal(f('umpteen'), 42);
            t.equal(f('eleventy'), 110);
            t.equal(f('several'), 42);

            t.end();
        });

    });

    t.test('interval', function(t) {

        t.test('one domain element', function(t) {
            var f = MapboxGLScale({
                type: 'interval',
                domain: [0],
                range: [11, 111]
            });

            t.equal(f(-0.5), 11);
            t.equal(f(0), 111);
            t.equal(f(0.5), 111);

            t.end();
        });

        t.test('two domain elements', function(t) {
            var f = MapboxGLScale({
                type: 'interval',
                domain: [0, 1],
                range: [11, 111, 1111]
            });

            t.equal(f(-0.5), 11);
            t.equal(f(0), 111);
            t.equal(f(0.5), 111);
            t.equal(f(1), 1111);
            t.equal(f(1.5), 1111);

            t.end();
        });

    });

});
