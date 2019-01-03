/*jslint browser:true */
/*globals Solver, aircraftFormulas, CONSTANTS, solvePoly */

function aircraftSolver(Solver, data) {
    "use strict";

    var solverFormulas = [];
    var formulas = data.formulas;
    var appendicies = data.appendicies;

    formulas.forEach(function (formulaGroup) {
        solverFormulas.push(new Solver(formulaGroup));
    });

    Object.keys(appendicies).forEach(function (appKey) {
        var appendix = appendicies[appKey];
        solverFormulas[appKey] = [];
        appendix.forEach(function (appendixGroup) {
            solverFormulas[appKey].push(new Solver(appendixGroup));
        });
    });

    return solverFormulas;
}
window.aircraftSolver = aircraftSolver;
