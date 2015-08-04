'use strict';

var GLOBAL_ATTRIBUTE_PREFIX = '$';

module.exports = create;
module.exports.is = is;

function create(parameters) {
    var property = (parameters && parameters.property !== undefined) ? parameters.property : '$zoom';

    // Convert old-style functions to new-style functions
    if (parameters.stops) {
        var domain = [];
        var range = [];

        for (var i = 0; i < parameters.stops.length; i++) {
            domain.push(parameters.stops[i][0]);
            range.push(parameters.stops[i][1]);
        }

        parameters.domain = domain;
        parameters.range = range;
        delete parameters.stops;

        if (!parameters.range.every(isInterpolatable)) {
            parameters.domain.shift();
            parameters.type = 'interval';
        }
    }

    var feature, global;
    var isFeatureConstant = false;
    var isGlobalConstant = false;
    if (!is(parameters)) {
        global = function() { return feature; };
        feature = function() { return parameters; };
        isGlobalConstant = true;

    } else if (property[0] === GLOBAL_ATTRIBUTE_PREFIX) {
        global = function(values) {
            var value = evaluate(parameters, values);
            feature = function() { return value; };
            feature.isConstant = isFeatureConstant;
            feature.isGlobalConstant  = isGlobalConstant;
            feature.isFeatureConstant = isFeatureConstant;
            return feature;
        };
        isFeatureConstant = true;

    } else {
        global = function() { return feature; };
        feature = function(values) { return evaluate(parameters, values); };
    }

    if (isGlobalConstant) isFeatureConstant = true;

    global.isConstant = isGlobalConstant;
    global.isGlobalConstant = isGlobalConstant;
    global.isFeatureConstant = isFeatureConstant;

    if (feature) {
        feature.isConstant = isFeatureConstant;
        feature.isGlobalConstant  = isGlobalConstant;
        feature.isFeatureConstant = isFeatureConstant;
    }

    return global;
}

function evaluate(parameters, values) {
    assert(typeof values === 'object');
    var property = parameters.property !== undefined ? parameters.property : '$zoom';
    var value = values[property];

    if (value === undefined) {
        return parameters.range[0];
    } else if (!parameters.type || parameters.type === 'exponential') {
        return evaluateExponential(parameters, value);
    } else if (parameters.type === 'interval') {
        return evaluateInterval(parameters, value);
    } else if (parameters.type === 'categorical') {
        return evaluateCategorical(parameters, value);
    }
}

function evaluateCategorical(parameters, value) {
    for (var i = 0; i < parameters.domain.length; i++) {
        if (value === parameters.domain[i]) {
            return parameters.range[i];
        }
    }
    return parameters.range[0];
}

function evaluateInterval(parameters, value) {
    assert(parameters.domain.length + 1 === parameters.range.length);
    for (var i = 0; i < parameters.domain.length; i++) {
        if (value < parameters.domain[i]) break;
    }
    return parameters.range[i];
}

function evaluateExponential(parameters, value) {
    var base = parameters.base !== undefined ? parameters.base : 1;

    var i = 0;
    while (true) {
        if (i >= parameters.domain.length) break;
        else if (value <= parameters.domain[i]) break;
        else i++;
    }

    if (i === 0) {
        return parameters.range[i];

    } else if (i === parameters.range.length) {
        return parameters.range[i - 1];

    } else {
        return interpolate(
            value,
            base,
            parameters.domain[i - 1],
            parameters.domain[i],
            parameters.range[i - 1],
            parameters.range[i]
        );
    }
}

function isNumber(value) {
    return (
        typeof value === "number" &&
        isFinite(value) &&
        Math.floor(value) === value
    );
}

function isInterpolatable(value) {
    return isNumber(value) || (Array.isArray(value) && value.every(isNumber));
}

function interpolate(input, base, inputLower, inputUpper, outputLower, outputUpper) {
    if (outputLower.length) {
        return interpolateArray(input, base, inputLower, inputUpper, outputLower, outputUpper);
    } else {
        return interpolateNumber(input, base, inputLower, inputUpper, outputLower, outputUpper);
    }
}

function interpolateNumber(input, base, inputLower, inputUpper, outputLower, outputUpper) {
    var difference =  inputUpper - inputLower;
    var progress = input - inputLower;

    var ratio;
    if (base === 1) {
        ratio = progress / difference;
    } else {
        ratio = (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
    }

    return (outputLower * (1 - ratio)) + (outputUpper * ratio);
}

function interpolateArray(input, base, inputLower, inputUpper, outputLower, outputUpper) {
    var output = [];
    for (var i = 0; i < outputLower.length; i++) {
        output[i] = interpolateNumber(input, base, inputLower, inputUpper, outputLower[i], outputUpper[i]);
    }
    return output;
}

function is(value) {
    return typeof value === 'object' && ((value.range && value.domain) || value.stops);
}

function assert(predicate, message) {
    if (!predicate) {
        throw new Error(message || 'Assertion failed');
    }
}
