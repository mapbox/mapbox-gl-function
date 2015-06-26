'use strict';

var GLOBAL_ATTRIBUTE_PREFIX = '$';

module.exports = create;
module.exports.is = is;

function create(parameters) {
    if (!is(parameters)) {
        return create_(true, true, function() { return parameters; });
    }

    var property = parameters.property !== undefined ? parameters.property : '$zoom';
    var isGlobalConstant = false;
    var isFeatureConstant = property[0] === GLOBAL_ATTRIBUTE_PREFIX;

    return create_(isGlobalConstant, isFeatureConstant, function(values) {
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
        } else {
            assert(false, 'Invalid function type "' + parameters.type + '"');
        }
    });
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
    return typeof value === 'object' && value.range && value.domain;
}

function assert(predicate, message) {
    if (!predicate) {
        throw new Error(message || 'Assertion failed');
    }
}

function create_(isGlobalConstant, isFeatureConstant, calculate) {
    var featureFunction, globalFunction;

    if (isGlobalConstant) {
        var value = calculate({});
        featureFunction = function() { return value; };
        globalFunction = function() { return featureFunction; };
        featureFunction.value =  value;
        globalFunction.value = value;

    } else if (isFeatureConstant) {
        globalFunction = function(input) {
            var value = calculate(input);
            featureFunction = function() { return value; };
            featureFunction.isConstant = isFeatureConstant;
            featureFunction.isGlobalConstant  = isGlobalConstant;
            featureFunction.isFeatureConstant = isFeatureConstant;
            featureFunction.value = value;
            return featureFunction;
        };

    } else {
        // TODO maybe support passing global params to the calculate function, requires
        // creating another scope.
        featureFunction = function(input) { return calculate(input); };
        globalFunction = function() { return featureFunction; };

    }

    globalFunction.isConstant = isGlobalConstant;
    globalFunction.isGlobalConstant = isGlobalConstant;
    globalFunction.isFeatureConstant = isFeatureConstant;

    if (featureFunction) {
        featureFunction.isConstant = isFeatureConstant;
        featureFunction.isGlobalConstant  = isGlobalConstant;
        featureFunction.isFeatureConstant = isFeatureConstant;
    }

    return globalFunction;
}
