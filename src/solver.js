function Solver(calcs) {
    'use strict';
    var defaultCalc = Object.keys(calcs)[0],
        solver = calcs[defaultCalc];
    if (!solver) {
        return;
    }
    solver.all = calcs;
    solver.getArgs = function (calc) {
        var argsRx = /\(([a-zA-Z0-9\_, ]+)\)/,
            content = calc.toString();
            // matches = content.match(argsRx);
        // if (!matches) {
        //     throw new SyntaxError('Invalid argument search');
        // }
        return content.match(argsRx)[1].split(/[, ]+/);
    };
    solver.getAnswer = function (calc) {
        calc = calc.toString();
        var returnIndex = calc.lastIndexOf('return'),
            answerRx = /return (\w+)/,
            answer = '';
        if (returnIndex > -1) {
            answer = calc.substring(returnIndex).match(answerRx)[1];
        }
        return answer;
    };
    solver.getSolvable = function (calcs, params) {
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
    solver.solve = function (data) {
        var solve = this,
            solvable;

        solvable = solve.getSolvable(calcs, data);
        solvable.forEach(function (index) {
            var args = solve.getArgs(calcs[index]),
                answer = solve.getAnswer(calcs[index]);
            args = args.map(function collateArguments(arg) {
                return data[arg];
            });
            data[answer] = calcs[index].apply(this, args);
        });
        return data;
    };
    calcs.forEach(function (calc) {
        var answer = solver.getAnswer(calc);
        solver[answer] = calc;
    });
    solver.calcs = calcs;
    return solver;
}
