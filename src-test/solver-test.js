/*jslint browser:true */
/*global Solver, formulas, describe, xdescribe, beforeEach, it, xit, expect */
(function () {
    "use strict";
    describe("Formula methods", function () {
        var formula;
        var formulas;
        var solver;
        beforeEach(function () {
            formula = function () {
                var answer = "";
                return answer;
            };
        });
        it("can handle an empty solver array", function () {
            formulas = [];
            solver = new Solver(formulas);
            expect(solver.constructor.name).toBe("Solver");
        });
        it("stores all variations of a formula in .all method", function () {
            formulas = [
                formula,
                formula,
                formula
            ];
            solver = new Solver(formulas);
            expect(solver.all).toBeDefined();
        });
        it("handles underscores in arguments", function () {
            formulas = [
                function (under_score) {
                    return under_score;
                }
            ];
            solver = new Solver(formulas);
        });
        it("uses the last return within a function", function () {
            formula = function () {
                function internalFunction() {
                    var solverShouldNotSeeThisReturn = "bad";
                    return solverShouldNotSeeThisReturn;
                }
                var solverShouldSeeThisReturn = "good";
                internalFunction();
                return solverShouldSeeThisReturn;
            };
            solver = new Solver([formula]);
            window.solver = solver;
            expect(solver.hasOwnProperty(
                "solverShouldSeeThisReturn"
            )).toBeTruthy();
        });
        it("ignores formulas for which no data is present", function () {
            var data = {};
            formula = function shouldSkipThisFunc(b) {
                var shouldNotReturn = b;
                return shouldNotReturn;
            };
            solver = new Solver([formula]);
            data = solver.solve(data);
            expect(data.hasOwnProperty("shouldNotReturn")).toBe(false);
        });
        it("solves for non-existing data", function () {
            var data = {
                newData: "new"
            };
            formula = function solveForNonExistingData(newData) {
                var nonExisting = newData;
                return nonExisting;
            };
            solver = new Solver([formula]);
            data = solver.solve(data);
            expect(data.nonExisting).toBe("new");
        });
        it("doesn't replace already existing data", function () {
            var data = {
                preExisting: "unchanged",
                newData: "changed"
            };
            formula = function solveForPreExistingData(newData) {
                var preExisting = newData;
                return preExisting;
            };
            solver = new Solver([formula]);
            data = solver.solve(data);
            expect(data.preExisting).toBe("unchanged");
        });
    });
}());
