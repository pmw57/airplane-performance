/*jslint browser:true */
/*globals Solver, formulas, describe, xdescribe, beforeEach, it, xit, expect */
(function () {
    'use strict';
    describe('Formula methods', function () {
        var formula = function () {
                var answer = '';
                return answer;
            },
            formulas = [
                formula,
                formula,
                formula
            ];
        it('stores all variations of a formula in a method called all', function () {
            var solver = new Solver(formulas);
            expect(solver.all).toBeDefined();
        });
    });
}());
