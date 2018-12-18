function Solver(calcs) {
    "use strict";
    var defaultCalc = Object.keys(calcs)[0];
    var solver = calcs[defaultCalc];
    if (!solver) {
        return;
    }
    solver.all = calcs;
    solver.getArgs = function (calc) {
        var argsRx = /\(([a-zA-Z0-9_,\s]+)\)/;
        var content = calc.toString();
        var matches = content.match(argsRx);
        return matches[1].split(/[,\u0020]+/);
    };
    solver.getAnswer = function (calc) {
        calc = calc.toString();
        var returnIndex = calc.lastIndexOf("return");
        var answerRx = /return (\w+)/;
        var answer = "";
        if (returnIndex > -1) {
            answer = calc.substring(returnIndex).match(answerRx)[1];
        }
        return answer;
    };
    solver.getSolvable = function (calcs, params) {
        var solve = this;
        var calcsKeys = Object.keys(calcs);
        var paramsKeys = Object.keys(params);
        var solvable = [];
        calcsKeys.forEach(function (calcKey) {
            var args = solve.getArgs(calcs[calcKey]);
            var missing = [];

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
        var solve = this;
        var solvable;

        solvable = solve.getSolvable(calcs, data);
        solvable.forEach(function (index) {
            var args = solve.getArgs(calcs[index]);
            var answer = solve.getAnswer(calcs[index]);
            args = args.map(function collateArguments(arg) {
                return data[arg];
            });
            if (!data[answer]) {
                data[answer] = calcs[index].apply(this, args);
            }
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
