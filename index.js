'use strict';

function constant(value) {
    return function() {
        return value;
    }
}

function interpolateNumber(a, b, t) {
    return (a * (1 - t)) + (b * t);
}

function interpolateArray(a, b, t) {
    var result = [];
    for (var i = 0; i < a.length; i++) {
        result[i] = interpolateNumber(a[i], b[i], t);
    }
    return result;
}

function zip(a, b) {
    var result = [];
    for (var i = 0; i < Math.min(a.length, b.length); i++) {
        result.push([a[i], b[i]]);
    }
    return result;
}

exports['interpolated'] = function(f) {
    var stops;
    if (f.domain && f.range) {
        stops = zip(f.domain, f.range);
    } else if (f.stops) {
        stops = f.stops
    } else {
        return constant(f);
    }

    var base = f.base || 1,
        interpolate = Array.isArray(stops[0][1]) ? interpolateArray : interpolateNumber;

    return function(z, properties) {
        // If this is a property scale, get the property value; otherwise get
        // the zoom value.
        var value = f.property ? properties[f.property] : z;

        // find the two stops which the current value is between
        var low, high;

        for (var i = 0; i < stops.length; i++) {
            var stop = stops[i];

            if (stop[0] <= value) {
                low = stop;
            }

            if (stop[0] > value) {
                high = stop;
                break;
            }
        }

        if (low && high) {
            var valueDiff = high[0] - low[0],
                valueProgress = value - low[0],

                t = base === 1 ?
                valueProgress / valueDiff :
                (Math.pow(base, valueProgress) - 1) / (Math.pow(base, valueDiff) - 1);

            return interpolate(low[1], high[1], t);

        } else if (low) {
            return low[1];

        } else if (high) {
            return high[1];
        }
    };
};

exports['piecewise-constant'] = function(f) {
    if (!f.stops) {
        return constant(f);
    }

    var stops = f.stops;

    return function(z) {
        for (var i = 0; i < stops.length; i++) {
            if (stops[i][0] > z) {
                return stops[i === 0 ? 0 : i - 1][1];
            }
        }

        return stops[stops.length - 1][1];
    }
};
