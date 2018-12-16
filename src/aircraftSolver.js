/*jslint browser:true */
/*globals Solver, aircraftFormulas, CONSTANTS, solvePoly */

function aircraftSolver(Solver, data) {
    "use strict";

    function dummyFunc(dummy) {
        return dummy;
    }

    var solverFormulas = [
        dummyFunc
    ];
    var formulas = data.formulas;
    var appendicies = data.appendicies;

    formulas.forEach(function (formulaGroup) {
        solverFormulas.push(new Solver(formulaGroup));
    });

    Object.keys(appendicies).forEach(function (appKey) {
        appendicies[appKey].unshift([dummyFunc]);

        var appendix = appendicies[appKey];
        solverFormulas[appKey] = [];
        appendix.forEach(function (appendixGroup) {
            solverFormulas[appKey].push(new Solver(appendixGroup));
        });
    });

    solverFormulas.all = solverFormulas.reduce(function (prev, next) {
        if (next.all) {
            prev = prev.concat(next.all);
        }
        return prev;
    }, []);
    solverFormulas.all = new Solver(solverFormulas.all);

    return solverFormulas;
}
