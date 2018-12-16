function Solver(calcs) {
    'use strict';
    var defaultCalc = Object.keys(calcs)[0],
        solver = calcs[defaultCalc];
    if (!solver) {
        return;
    }
    solver.all = calcs;
    solver.getArgs = function (calc) {
        var argsRx = /\(([a-zA-Z0-9, ]+)\)/,
            content = calc.toString();
        return content.match(argsRx)[1].split(/[, ]+/);
    };
    solver.getAnswer = function (calc) {
        var answerRx = /return (\w+)/,
            answer = calc.toString().match(answerRx)[1];
        return answer;
    };
    solver.solvable = function (calcs, params) {
        var solve = this,
            calcsKeys = Object.keys(calcs),
            paramsKeys = Object.keys(params),
            solvable = [];
        calcsKeys.forEach(function (calcKey) {
            var args = solve.getArgs(calcs[calcKey]),
                missing = [];

            missing = args.filter(function (arg) {
                if (paramsKeys.indexOf(arg) === -1) {
                    return arg;
                }
            });
            if (!missing.length) {
                solvable.push(calcKey);
            }
        });
        return solvable;
    };
    solver.solve = function (knownParams) {
        var solve = this,
            solvable;

        solvable = solve.solvable(calcs, knownParams);
        solvable.forEach(function (calcKey) {
            var args = solve.getArgs(calcs[calcKey]),
                answer = solve.getAnswer(calcs[calcKey]);
            args = args.map(function (arg) {
                return knownParams[arg];
            });
            knownParams[answer] = calcs[calcKey].apply(this, args);
        });
        return knownParams;
    };
    calcs.forEach(function (calc) {
        var answer = solver.getAnswer(calc);
        solver[answer] = calc;
        solver[answer] = calc;
    });
    solver.calcs = calcs;
    return solver;
}
