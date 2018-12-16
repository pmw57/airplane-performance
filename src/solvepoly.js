/*globals rpSolve */
function solvePoly(coeffs) {
    'use strict';
    var degree = {Degree: coeffs.length - 1},
        real = [0, 0, 0],
        imag = [0, 0, 0],
        answers = [];
    rpSolve(degree, coeffs, real, imag);
    answers = real.map(function (real, index) {
        return {real: real, i: imag[index]};
    })
        .filter(function (result) {
            return result.i === 0;
        })
        .map(function (result) {
            return result.real;
        });
    return answers;
}
