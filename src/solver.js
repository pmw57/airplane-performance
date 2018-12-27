function Solver(calcs) {
    "use strict";
    var defaultCalc = Object.keys(calcs)[0];
    var solver = calcs[defaultCalc];
    if (!solver) {
        return;
    }
    solver.all = calcs;
    solver.getArgs = function (calc) {
        function newlineFilter(arg) {
            const ret = "\r";
            return arg.charCodeAt(0) !== ret.charCodeAt(0);
        }
        var argsRx = /\(([a-zA-Z0-9_,\s]+)\)/;
        var content = calc.toString();
        var matches = content.match(argsRx);
        var args = matches[1].split(/[,\u0020]+/);
        return args.filter(newlineFilter);
    };
    solver.getAnswer = function (calc) {
        calc = calc.toString();
        var returnIndex = calc.lastIndexOf("return");
        var answerRx = /function (\w+)From/;
        var match = calc.match(answerRx);
        if (match) {
            return match[1];
        }
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
