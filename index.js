'use strict';

var GLOBAL_ATTRIBUTE_PREFIX = '$';

module.exports = create;
module.exports.is = is;
module.exports.mix = mix;

function create(parameters) {
    var property = parameters.property !== undefined ? parameters.property : '$zoom';

    var isGlobalConstant = !is(parameters);
    var isFeatureConstant = isGlobalConstant || property[0] === GLOBAL_ATTRIBUTE_PREFIX;

    if (isGlobalConstant) {
        return create_(parameters);
    } else if (isFeatureConstant) {
        return create_(null, function(values) { return evaluate(parameters, values); });
    } else {
        return create_(null, null, function(values) { return evaluate(parameters, values); });
    }
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
    } else {
        assert(false, 'Invalid function type "' + parameters.type + '"');
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

function create_(constant, globalInnerFunction, featureInnerFunction) {
    var globalFunction, featureFunction;
    if (!globalInnerFunction && !featureInnerFunction) {
        featureFunction = function() { return constant; };
        featureFunction.value =  constant;
        featureFunction.isConstant = true;
        featureFunction.isGlobalConstant = true;
        featureFunction.isFeatureConstant = true;

        globalFunction = function() { return featureFunction; };
        globalFunction.value = constant;
        globalFunction.isConstant = true;
        globalFunction.isGlobalConstant = true;
        globalFunction.isFeatureConstant = true;

    } else if (globalInnerFunction && featureInnerFunction) {
        globalFunction = function(globalInput) {
            var globalOutput = globalInnerFunction(globalInput);
            featureFunction = function(featureInput) {
                return featureInnerFunction(featureInput, globalOutput);
            };
            featureFunction.isConstant = false;
            featureFunction.isGlobalConstant = false;
            featureFunction.isFeatureConstant = false;

            return featureFunction;
        };

        globalFunction.isConstant = false;
        globalFunction.isGlobalConstant = false;
        globalFunction.isFeatureConstant = false;

    } else if (globalInnerFunction) {
        globalFunction = function(globalInput) {
            var value = globalInnerFunction(globalInput);
            featureFunction = function() { return value; };
            featureFunction.isConstant = true;
            featureFunction.isGlobalConstant = false;
            featureFunction.isFeatureConstant = true;

            featureFunction.value = value;
            return featureFunction;
        };

        globalFunction.isConstant = false;
        globalFunction.isGlobalConstant = false;
        globalFunction.isFeatureConstant = true;

    } else if (featureInnerFunction) {
        featureFunction = function(featureInput) {
            return featureInnerFunction(featureInput);
        };
        featureFunction.isConstant = false;
        featureFunction.isGlobalConstant = false;
        featureFunction.isFeatureConstant = false;

        globalFunction = function() { return featureFunction; };
        globalFunction.isConstant = false;
        globalFunction.isGlobalConstant = false;
        globalFunction.isFeatureConstant = false;

    } else {
        assert(false);
    }

    return globalFunction;
}

function mix(lowerFunction, upperFunction, ratio) {
    assert(ratio >= 0 && ratio <= 1);

    if (lowerFunction.isGlobalConstant && upperFunction.isGlobalConstant) {
        return create_(mix_(lowerFunction.value, upperFunction.value, ratio));

    } else if (lowerFunction.isGlobalConstant && upperFunction.isFeatureConstant) {
        return create_(null, function(globalInput) {
            return mix_(lowerFunction.value, upperFunction(globalInput).value, ratio);
        });

    } else if (lowerFunction.isFeatureConstant && upperFunction.isGlobalConstant) {
        return create_(null, function(globalInput) {
            return mix_(lowerFunction(globalInput).value, upperFunction.value, ratio);
        });

    } else if (lowerFunction.isFeatureConstant && upperFunction.isFeatureConstant) {
        return create_(null, function(globalInput) {
            return mix_(lowerFunction(globalInput).value, upperFunction(globalInput).value, ratio);
        });

    } else if (lowerFunction.isFeatureConstant) {
        return create_(null, function(globalInput) {
            return lowerFunction(globalInput).value;
        }, function(featureInput, globalOutput) {
            return mix_(globalOutput, upperFunction({})(featureInput), ratio);
        });

    } else if (upperFunction.isFeatureConstant) {
        return create_(null, function(globalInput) {
            return upperFunction(globalInput).value;
        }, function(featureInput, globalOutput) {
            return mix_(lowerFunction({})(featureInput), globalOutput, ratio);
        });

    } else {
        return create_(null, null, function(featureInput) {
            return mix_(lowerFunction({})(featureInput), upperFunction({})(featureInput), ratio);
        });

    }
}

function mix_(lowerValue, upperValue, ratio) {
    return lowerValue * (1 - ratio) + upperValue * ratio;
}

function assert(predicate, message) {
    if (!predicate) {
        throw new Error(message || 'Assertion failed');
    }
}
