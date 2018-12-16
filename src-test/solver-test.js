/*jslint browser:true */
/*globals Solver, formulas, describe, xdescribe, beforeEach, it, xit, expect */
(function () {
    'use strict';
    describe('Formula methods', function () {
        var formula, formulas, solver;
        beforeEach(function () {
            formula = function () {
                var answer = '';
                return answer;
            };
        });
        it('stores all variations of a formula in a method called all', function () {
            formulas = [
                formula,
                formula,
                formula
            ];
            solver = new Solver(formulas);
            expect(solver.all).toBeDefined();
        });
        it('handles underscores in arguments', function () {
            formulas = [
                function (under_score) {
                    return under_score;
                }
            ];
            solver = new Solver(formulas);
        });
        it('uses the last return within a function', function () {
            formula = function () {
                function internalFunction() {
                    var solverShouldNotSeeThisReturn = 'bad';
                    return solverShouldNotSeeThisReturn;
                }
                var solverShouldSeeThisReturn = 'good';
                internalFunction();
                return solverShouldSeeThisReturn;
            };
            solver = new Solver([formula]);
            window.solver = solver;
            expect(solver.hasOwnProperty('solverShouldSeeThisReturn')).toBeTruthy();
        });
        it('handles no return value found in a function', function () {
            formula = function notFoundHere() {
                // no r e t u r n keyword in this function
            };
            expect(new Solver([formula])).not.toThrow();
        });
    });
}());
