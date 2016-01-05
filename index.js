'use strict';

module.exports = create;
module.exports.is = is;

function create(parameters) {
    if (!is(parameters)) {
        return function() { return parameters; };
    } else if (!parameters.type || parameters.type === 'exponential') {
        return function(input) {
            return evaluateExponentialFunction(parameters, input);
        };
    } else if (parameters.type === 'interval') {
        return function(input) {
            return evaluateIntervalFunction(parameters, input);
        };
    } else if (parameters.type === 'categorical') {
        return function(input) {
            return evaluateCategoricalFunction(parameters, input);
        };
    } else {
        throw new Error('Unknown function type "' + parameters.type + '"');
    }
}

function evaluateCategoricalFunction(parameters, input) {
    for (var i = 0; i < parameters.domain.length; i++) {
        if (input === parameters.domain[i]) {
            return parameters.range[i];
        }
    }
    return parameters.range[0];
}

function evaluateIntervalFunction(parameters, input) {
    for (var i = 0; i < parameters.domain.length; i++) {
        if (input < parameters.domain[i]) break;
    }
    return parameters.range[i];
}

function evaluateExponentialFunction(parameters, input) {
    var base = parameters.base !== undefined ? parameters.base : 1;

    var i = 0;
    while (true) {
        if (i >= parameters.domain.length) break;
        else if (input <= parameters.domain[i]) break;
        else i++;
    }

    if (i === 0) {
        return parameters.range[i];

    } else if (i === parameters.range.length) {
        return parameters.range[i - 1];

    } else {
        return interpolate(
            input,
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
