'use strict';

var MapboxGLFunction = require('../').interpolated;


// Build a long list of stops
function buildFunction(stopsCount) {
  var stops = [];
  for (var i = 0; i < stopsCount; i++) {
    stops.push([i, i * 2]);
  }

  return  MapboxGLFunction({
      type: 'exponential',
      stops: stops
  });
}


function profileFunction(stops, iterations) {
  var f = buildFunction(stops);
  console.log("\n\n>>> Evaluating " + iterations + " iterations with " + stops + " stops");
  console.log("Only include values within the domain of stops:");
  console.time("Time");
  var value;
  for (var i = 0; i < iterations; i++) {
    value = Math.random() * stops;
    f(value);
  }
  console.timeEnd("Time");

  console.log("Include values outside the domain of stops:");
  console.time("Time");
  for (i = 0; i < iterations; i++) {
    value = Math.random() * (stops * 3) - stops;
    f(value);
  }
  console.timeEnd("Time");
}


profileFunction(10000, 100000);
profileFunction(100, 100000);
profileFunction(10, 1000000);
