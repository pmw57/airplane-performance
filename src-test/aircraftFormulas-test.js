/*jslint browser:true */
/*global solvePoly, Solver, aircraftFormulas, aircraftSolver,
    describe, beforeEach, it, xit, expect */
var formulas = aircraftFormulas(window.CONSTANTS, solvePoly);
var solvedFormulas = aircraftSolver(Solver, formulas);
(function () {
    "use strict";
    var random = function (low, high) {
        return Math.random() * (high - low) + low;
    };
    var smaller = function (num) {
        return num * (1 - Math.random() / 5);
    };
    var larger = function (num) {
        return num * (1 + Math.random() / 5);
    };
    // relation 1: cl, v, w/s
    var v = random(50, 100);
    var clmax = random(1, 2);
    var ws = solvedFormulas[0].solve({cl: clmax, v}).ws;
    console.log(ws);
    var vmax = random(80, 120);
    // relation 2: s, w/s, w
    var w = random(500, 1500);
    var s = w / ws;
    // relation 3: S, be, eAR, ce
    var b = random(20, 40);
    var c = s / b;
    var ar = b * b / s;
    var sfuse = 3 * 3;

    // var w = random(500, 2000);
    var thetag = random(1, 20);
    var e = random(0.8, 1);
    var c = random(3, 7);
    var s = b * c;
    var ar = b / c;
    var ear = e * ar;
    var ce = c / Math.sqrt(e);
    var be = b * Math.sqrt(e);
    var cd0 = random(0, 2);
    var ad = cd0 * s;
    var rho = 0.002377;
    var m = 970;
    var vfs = v * 5280 / 3600;
    var v3 = larger(v);
    var pd = larger(v);
    var p1 = smaller(pd);
    var p2 = smaller(pd);
    var vp = larger(v);
    var dp = 6;
    var ap = Math.TAU * (dp / 2);
    var eta = smaller(1);
    var sigma = 1;
    var rpm = 2700;
    var n = 60;
    var bhp = 150;
    var cl = random(1, 2);
    function testAircraftFormula(index, prop, args, expected) {
        expect(
            solvedFormulas[index][prop].apply(undefined, args)
        ).toBeCloseTo(expected);
    }
    function testAircraftFormulaSolve(index, prop, data, expected) {
        if (!expected) {
            expected = data[prop];
            delete data[prop];
        }
        expect(solvedFormulas[index].solve(data)[prop]).toBeCloseTo(expected);
    }
    describe("AircraftFormulas object", function () {
        beforeEach(function () {
            solvedFormulas = aircraftSolver(Solver, formulas);
        });
        it("has a solve method on its array items", function () {
            expect(solvedFormulas[1].solve).toBeDefined();
        });
        it("is accessible as an object property", function () {
            expect(typeof solvedFormulas[1].d).toBe("function");
        });
        it("uses an all function for all available formulas", function () {
            expect(solvedFormulas[1].all[0]).toBeDefined();
        });
        it("uses an overall all function for all formulas", function () {
            expect(solvedFormulas.all).toBeDefined();
        });
        describe("overall solver", function () {
            it("is defined", function () {
                expect(solvedFormulas.all.solve).toBeDefined();
            });
            it("is an array", function () {
                expect(typeof solvedFormulas.all.solve).toBe("function");
            });
        });
    });
    describe("Relations", function () {
        describe("1: CL, V, W/S", function () {
            it("can calculate lift force", function () {
                testAircraftFormulaSolve(0, "ws", {cl: clmax, v}, ws);
            });
            it("can calculate coefficient of lift", function () {
                testAircraftFormulaSolve(0, "cl", {ws, v}, clmax);
            });
            it("can calculate velocity", function () {
                testAircraftFormulaSolve(0, "v", {ws, cl: clmax}, v);
            });
        });
        describe("2: S, W/S, W", function () {
            it("can calculate wing area", function () {
                testAircraftFormulaSolve(0, "s", {ws, w}, s);
            });
            it("can calculate wing loading", function () {
                testAircraftFormulaSolve(0, "ws", {w, s}, ws);
            });
            it("can calculate gross weight", function () {
                testAircraftFormulaSolve(0, "w", {ws, s}, w);
            });
        });
        describe("3: S, be, eAR, ce", function () {
            it("knows chord relations", function () {
                expect(c).toBeCloseTo(s / b);
                testAircraftFormulaSolve(0, "c", {s, b}, c);
            });
            it("solves wing area from span and chord", function () {
                testAircraftFormulaSolve(0, "s", {b, c}, s);
            });
            it("solves wing span from area and chord", function () {
                testAircraftFormulaSolve(0, "b", {s, c}, b);
            });
            it("knows aspect ratio from chord", function () {
                expect(ar).toBeCloseTo(b / c);
                testAircraftFormulaSolve(0, "ar", {b, c}, ar);
            });
            it("solves span from aspect ratio and chord", function () {
                testAircraftFormulaSolve(0, "b", {ar, c}, b);
            });
            it("solves chord from aspect ratio and span", function () {
                testAircraftFormulaSolve(0, "c", {ar, b}, c);
            });
            it("knows aspect ratio from wing area", function () {
                expect(ar).toBeCloseTo(b *  b / s);
                testAircraftFormulaSolve(0, "ar", {b, s}, ar);
            });
            it("solves span from aspect ratio and area", function () {
                testAircraftFormulaSolve(0, "b", {ar, s}, b);
            });
            it("solves area from aspect ratio and span", function () {
                testAircraftFormulaSolve(0, "s", {ar, b}, s);
            });
            it("solves for effiency", function () {
                testAircraftFormulaSolve(0, "ar", {b, s}, ar);
            });
            it("solves for efficiency", function () {
                // todo
            });
        });
    });
    describe("Formula 1: A force balanced along the flight path", function () {
        var d;
        beforeEach(function () {
            d = solvedFormulas[1].d(w, thetag);
        });
        it("solves for weight", function () {
            testAircraftFormula(1, "w", [d, thetag], w);
        });
        it("solves for glide angle", function () {
            testAircraftFormula(1, "thetag", [d, w], thetag);
        });
    });
    describe("Formula 2: Lift is similar to the flight path", function () {
        var l;
        var angle;
        var expected;
        beforeEach(function () {
            l = solvedFormulas[2].l(w, thetag);
        });
        it("is equivalent to drag * cos/sin of the glide angle", function () {
            angle = thetag * Math.TAU / 360;
            const drag = solvedFormulas[1].d(w, thetag);
            expected = drag * Math.cos(angle) / Math.sin(angle);
            testAircraftFormula(2, "l", [w, thetag], expected);
        });
        it("solves for weight", function () {
            testAircraftFormula(2, "w", [l, thetag], w);
        });
        it("solves for glide angle", function () {
            testAircraftFormula(2, "thetag", [l, w], thetag);
        });
    });
    describe("Formula 3: Coeff of lift from pressure and area", function () {
        var dynamicPressure;
        var l;
        beforeEach(function () {
            dynamicPressure = 0.5 * rho * vfs * vfs;
            l = solvedFormulas[2].l(w, thetag);
            cl = solvedFormulas[3].cl(l, rho, vfs, s);
        });
        it("is lift over dynamic pressure and wing area", function () {
            expect(cl).toBe(l / (dynamicPressure * s));
        });
        it("solves for air density", function () {
            testAircraftFormula(3, "rho", [cl, l, vfs, s], rho);
        });
        it("solves for lift", function () {
            testAircraftFormula(3, "l", [cl, rho, vfs, s], l);
        });
        it("solves for velocity (ft/sec)", function () {
            testAircraftFormulaSolve(3, "vfs", {cl, l, rho, s}, vfs);
        });
        it("solves for wing area", function () {
            testAircraftFormula(3, "s", [cl, l, rho, vfs], s);
        });
    });
    describe("Formula 4: cd is from pressure and wing area", function () {
        var d;
        var l;
        var cd;
        beforeEach(function () {
            d = solvedFormulas[1].d(w, thetag);
            l = solvedFormulas[2].l(w, thetag);
            cl = solvedFormulas[3].cl(l, rho, vfs, s);
            cd = solvedFormulas[4].cd(d, rho, vfs, s);
        });
        it("lift and drag has same ratio as their coefficients", function () {
            expect(cl / cd).toBeCloseTo(l / d);
        });
        it("solves for air density", function () {
            testAircraftFormula(4, "rho", [cd, d, vfs, s], rho);
        });
        it("solves for drag", function () {
            testAircraftFormula(4, "d", [cd, rho, vfs, s], d);
        });
        it("solves for velocity (ft/sec)", function () {
            testAircraftFormula(4, "vfs", [cd, d, rho, s], vfs);
        });
        it("solves for wing area", function () {
            testAircraftFormula(4, "s", [cd, d, rho, vfs], s);
        });
    });
    describe("Formula 5: Drag from velocity as mph", function () {
        var d;
        var cd;
        beforeEach(function () {
            d = solvedFormulas[1].d(w, thetag);
            cd = solvedFormulas[4].cd(d, rho, vfs, s);
            d = solvedFormulas[4].d(rho, cd, vfs, s);
        });
        it("is equivalent to Formula 4", function () {
            var expected = w * Math.sin(thetag / 360 * Math.TAU);
            expect(solvedFormulas[5].d(sigma, cd, s, v)).toBeCloseTo(expected);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(5, "sigma", [d, cd, s, v], sigma);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(5, "cd", [d, sigma, s, v], cd);
        });
        it("solves for wing area", function () {
            testAircraftFormula(5, "s", [d, sigma, cd, v], s);
        });
        it("solves for velocity (mph)", function () {
            testAircraftFormula(5, "v", [d, sigma, cd, s], v);
        });
    });
    describe("Formula 6: Lift from velocity as mph", function () {
        var l;
        beforeEach(function () {
            l = solvedFormulas[2].l(w, thetag);
            cl = solvedFormulas[3].cl(l, rho, vfs, s);
            l = solvedFormulas[3].l(rho, cl, vfs, s);
        });
        it("is equivalent to Formula 5", function () {
            var expected = w * Math.cos(thetag / 360 * Math.TAU);
            expect(solvedFormulas[6].l(sigma, cl, s, v)).toBeCloseTo(expected);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(6, "sigma", [l, cl, s, v], sigma);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(6, "cl", [l, sigma, s, v], cl);
        });
        it("solves for wing area", function () {
            testAircraftFormula(6, "s", [l, sigma, cl, v], s);
        });
        it("solves for velocity (mph)", function () {
            testAircraftFormula(6, "v", [l, sigma, cl, s], v);
        });
    });
    describe("Formula 7: Small angle approx. for wing loading", function () {
        var ws;
        beforeEach(function () {
            cl = solvedFormulas[6].cl(w, sigma, s, v);
            ws = solvedFormulas[7].solve({sigma, cl, v}).ws;
        });
        it("is close to formula 6 about lift from velocity", function() {
            var liftForce = solvedFormulas[6].l(sigma, cl, s, v);
            var wingLoading = solvedFormulas[7].ws(sigma, cl, v);
            expect(wingLoading).toBeCloseTo(liftForce / s);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(7, "sigma", [ws, cl, v], sigma);
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormula(7, "cl", [ws, sigma, v], cl);
        });
        it("solves for velocity", function () {
            testAircraftFormula(7, "v", [ws, sigma, cl], v);
        });
        it("solves for wingloading from weight and wing span", function () {
            testAircraftFormulaSolve(7, "ws", {w, s}, ws);
        });
        it("solves for weight from wingloading", function () {
            testAircraftFormulaSolve(7, "w", {ws, s}, w);
        });
        it("solves for wingloading from weight and wing span", function () {
            testAircraftFormula(7, "s", [ws, w], s);
        });
        it("has the same formula for the index and .ws", function () {
            var expected = /\(sigma,\u0020cl,\u0020vmax\)/;
            expect(solvedFormulas[7].ws.toString()).toMatch(expected);
        });
    });
    describe("Formula 8: Glide angle using small angle approx.", function () {
        var cd;
        var d;
        var g;
        beforeEach(function () {
            cd = 1.2;
            g = solvedFormulas[8].thetag(sigma, cd, s, v);
        });
        it("should be close to drag * 360/TAU", function () {
            d = solvedFormulas[5].d(sigma, cd, s, v);
            expect(g).toBeCloseTo(d * 360 / Math.TAU);
        });
        it("should solve for sigma", function () {
            testAircraftFormula(8, "sigma", [g, cd, s, v], sigma);
        });
        it("should solve for coefficient of lift", function () {
            testAircraftFormula(8, "cd", [g, sigma, s, v], cd);
        });
        it("should solve for coefficient of lift", function () {
            testAircraftFormula(8, "s", [g, sigma, cd, v], s);
        });
        it("should solve for velocity", function () {
            testAircraftFormula(8, "v", [g, sigma, cd, s], v);
        });
    });
    describe("Formula 9: Glide angle from lift & drag ratios", function () {
        var cd;
        var v8;
        var g8;
        beforeEach(function () {
            cd = random(0.05, 2);
            cl = random(0.05, 2);
            thetag = solvedFormulas[9].thetag(cd, cl);
        });
        it("has the same glide angle result as for Formula 8", function () {
            v8 = solvedFormulas[8].v(thetag, sigma, cd, s);
            g8 = solvedFormulas[8].thetag(sigma, cd, s, v8);
            testAircraftFormula(9, "thetag", [cd, cl], g8);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(9, "cd", [thetag, cl], cd);
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormula(9, "cl", [thetag, cd], cl);
        });
    });
    describe("Formula 10: Rate of sink (ft/min)", function () {
        var cd;
        var d5;
        var rs;
        beforeEach(function () {
            cd = random(1, 1.5);
            thetag = solvedFormulas[8].thetag(cd, sigma, s, v);
            d5 = solvedFormulas[5].d(sigma, cd, s, v);
            rs = solvedFormulas[10].rs(sigma, cd, s, v, w);
        });
        it("is velocity * (drag / weight) * (5280 / 60)", function () {
            expect(rs / 88).toBeCloseTo(d5 / w * v);
        });
        it("solves for sigma", function () {
            testAircraftFormula(10, "sigma", [rs, cd, s, v, w], sigma);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(10, "cd", [rs, sigma, s, v, w], cd);
        });
        it("solves for wing area", function () {
            testAircraftFormula(10, "s", [rs, sigma, cd, v, w], s);
        });
        it("solves for velocity", function () {
            testAircraftFormula(10, "v", [rs, sigma, cd, s, w], v);
        });
        it("solves for weight", function () {
            testAircraftFormula(10, "w", [rs, sigma, cd, s, v], w);
        });
    });
    describe("Formula 11: Rate of sink without velocity", function () {
        var cd;
        var rs;
        beforeEach(function () {
            cd = random(1, 1.5);
            cl = solvedFormulas[7].cl(w / s, sigma, v);
            rs = solvedFormulas[11].rs(sigma, w, s, cd, cl);
        });
        it("has the same answer as for formula 10", function () {
            expect(rs).toBeCloseTo(solvedFormulas[10].rs(sigma, cd, s, v, w));
        });
        it("solves for sigma", function () {
            testAircraftFormula(11, "sigma", [rs, w, s, cd, cl], sigma);
        });
        it("solves for weight", function () {
            testAircraftFormula(11, "w", [rs, sigma, s, cd, cl], w);
        });
        it("solves for wing area", function () {
            testAircraftFormula(11, "s", [rs, sigma, w, cd, cl], s);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(11, "cd", [rs, sigma, w, s, cl], cd);
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormula(11, "cl", [rs, sigma, w, s, cd], cl);
        });
    });
    describe("Formula 12: Parasite and induced drag", function () {
        var cdi;
        var cd;
        beforeEach(function () {
            cdi = random(0, 2);
            cd = solvedFormulas[12].cd(cd0, cdi);
        });
        it("total drag = parasite plus induced drag", function () {
            expect(cd).toBe(cd0 + cdi);
        });
        it("solves for parasite drag", function () {
            expect(solvedFormulas[12].cd0(cd, cdi)).toBe(cd0);
        });
        it("solves for induced drag", function () {
            expect(solvedFormulas[12].cdi(cd, cd0)).toBe(cdi);
        });
    });
    describe("Formula 13: induced drag coeff. from lift coeff.", function () {
        var cdi;
        beforeEach(function () {
            cl = random(1, 2);
            cdi = solvedFormulas[13].solve({cl, e, ar}).cdi;
        });
        it("follows lifting line theory", function () {
            var area = 0.5 * Math.TAU * ar;
            expect(cdi).toBeCloseTo(cl * cl / (e * area));
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormulaSolve([13], "cl", {cdi, e, ar}, cl);
        });
        it("solves for airplane efficiency", function () {
            testAircraftFormula(13, "e", [cdi, cl, ar], e);
        });
        it("solves for ar", function () {
            testAircraftFormula(13, "ar", [cdi, cl, e], ar);
        });
        it("solves for coefficient of induced drag with eAR", function () {
            testAircraftFormulaSolve([13], "cdi", {cl, ear}, cdi);
        });
        it("solves for coefficient of lift from eAR", function () {
            testAircraftFormulaSolve([13], "cl", {cdi, ear}, cl);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(13, "ear", [cdi, cl], ear);
        });
    });
    describe("Formulas 14: Aspect ratio relationships", function () {
        it("is related to the span and wing area", function () {
            expect(ar).toBeCloseTo(b * b / s);
        });
        it("solves for wing span from wing area", function () {
            testAircraftFormulaSolve([14], "b", {ar, s}, b);
        });
        it("solves for wing area", function () {
            testAircraftFormula(14, "s", [ar, b], s);
        });
        it("is related to wing span and average chord", function () {
            testAircraftFormulaSolve(14, "ar", {b, c}, ar);
        });
        it("solves for wing span from average chord", function () {
            testAircraftFormulaSolve([14], "b", {ar, c}, b);
        });
        it("solves for average chord", function () {
            testAircraftFormula(14, "c", [ar, b], c);
        });
    });
    describe("Formula 15: Parabolic drag polar", function () {
        var cdi;
        var cd;
        beforeEach(function () {
            cl = random(1, 2);
            cd = solvedFormulas[15].cd(cd0, cl, ear);
            cdi = solvedFormulas[12].cdi(cd, cd0);
        });
        it("can be checked by using CDi formula in formula 12", function () {
            expect(cd).toBeCloseTo(solvedFormulas[12].cd(cd0, cdi));
        });
        it("solves for parasite drag coefficient", function () {
            testAircraftFormula(15, "cd0", [cd, cl, ear], cd0);
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormula(15, "cl", [cd, cd0, ear], cl);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormulaSolve([15], "ear", {cd, cd0, cl}, ear);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormulaSolve([15], "ear", {e, ar}, ear);
        });
        it("solves for airplane efficiency", function () {
            testAircraftFormulaSolve([15], "e", {ear, ar}, e);
        });
        it("solves for aspect artio", function () {
            testAircraftFormula(15, "ar", [ear, e], ar);
        });
    });
    describe("Formula 18: Coefficient of lift for minimum sink", function () {
        var clmins;
        beforeEach(function () {
            clmins = solvedFormulas[18].clmins(ear, cd0);
        });
        it("should be sqrt(3 * CL^2 / CDi * CD0)", function () {
            var cdi = solvedFormulas[13].cdi(cl, ear);
            var expected = Math.sqrt(3 * (cl * cl / cdi) * cd0);
            expect(clmins).toBeCloseTo(expected);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(18, "ear", [clmins, cd0], ear);
        });
        it("solves for parasitic drag", function () {
            testAircraftFormula(18, "cd0", [clmins, ear], cd0);
        });
    });


    describe("Formula 19: Min sink = drag area and eff. chord", function () {
        it("should have the same answer as from formula 18", function () {
            var clmins = solvedFormulas[19].clmins(ad, ce);
            var clmins18 = solvedFormulas[18].clmins(ear, cd0);
            expect(clmins).toBeCloseTo(clmins18);
        });
        it("solves for ad", function () {
            var clmins = solvedFormulas[19].clmins(ad, ce);
            testAircraftFormulaSolve(19, "ad", {clmins, ce}, ad);
        });
        it("solves for ce", function () {
            var clmins = solvedFormulas[19].clmins(ad, ce);
            testAircraftFormulaSolve(19, "ce", {clmins, ad}, ce);
        });
    });
    describe("Formula 19: effective chord formulas", function () {
        it("solves for effective chord", function () {
            testAircraftFormulaSolve(19, "ce", {c, e}, ce);
        });
        it("solves for chord", function () {
            testAircraftFormulaSolve(19, "c", {e, ce: c / Math.sqrt(e)}, c);
        });
        it("solves for efficiency", function () {
            testAircraftFormulaSolve(19, "e", {c, ce: c / Math.sqrt(e)}, e);
        });
    });
    describe("Formula 19: Drag area relationship", function () {
        it("solves for drag area", function () {
            expect(solvedFormulas[19].solve({cd0, s}).ad).toBe(ad);
        });
        it("solves for parasite drag", function () {
            testAircraftFormulaSolve(19, "cd0", {s, ad: cd0 * s}, cd0);
        });
        it("solves for wing area", function () {
            testAircraftFormulaSolve(19, "s", {cd0, ad: cd0 * s}, s);
        });
    });
    describe("Formula 20: Minimum rate of sink", function () {
        var cd;
        var rsmin;
        beforeEach(function () {
            cl = solvedFormulas[19].clmins(ad, ce);
            cd = solvedFormulas[15].cd(cd0, cl, ear);
            rsmin = solvedFormulas[20].rsmin(w, sigma, ad, be);
        });
        it("is similar to the sink rate", function () {
            testAircraftFormulaSolve(11, "w", {sigma, w, s, cd, cl}, w);
        });
        it("solves for weight", function () {
            testAircraftFormulaSolve(20, "w", {rsmin, sigma, ad, be}, w);
        });
        it("solves for density ratio", function () {
            testAircraftFormulaSolve(20, "sigma", {rsmin, w, ad, be}, sigma);
        });
        it("solves for drag area", function () {
            testAircraftFormulaSolve(20, "ad", {rsmin, w, sigma, be}, ad);
        });
        it("solves for effective span", function () {
            testAircraftFormulaSolve(20, "be", {rsmin, w, sigma, ad}, be);
        });
    });
    describe("Formula 20: effective span formulas", function () {
        it("solves for effective span", function () {
            testAircraftFormulaSolve(20, "be", {b, e}, be);
        });
        it("solves for span", function () {
            testAircraftFormulaSolve(20, "b", {e, be: b * Math.sqrt(e)}, b);
        });
        it("solves for efficiency", function () {
            testAircraftFormulaSolve(20, "e", {b, be: b * Math.sqrt(e)}, e);
        });
    });
    describe("Formula 21: Velocity for minimum sink", function () {
        var vmins;
        beforeEach(function () {
            vmins = solvedFormulas[21].vmins(w, be, sigma, ad);
        });
        it("is the same as formula 7 when solved for velocity", function () {
            var clmins = solvedFormulas[19].clmins(ad, ce);
            var ws = w / s;
            expect(vmins).toBeCloseTo(solvedFormulas[7].v(ws, sigma, clmins));
        });
        it("solves for weight", function () {
            testAircraftFormulaSolve(21, "w", {vmins, be, sigma, ad}, w);
        });
        it("solves for effective span", function () {
            testAircraftFormulaSolve(21, "be", {vmins, w, sigma, ad}, be);
        });
        it("solves for density ratio", function () {
            testAircraftFormulaSolve(21, "sigma", {vmins, w, be, ad}, sigma);
        });
        it("solves for drag area", function () {
            testAircraftFormulaSolve(21, "ad", {vmins, w, be, sigma}, ad);
        });
    });
    describe("Formula 21: Effective span loading", function () {
        it("solves for effective span loading", function () {
            testAircraftFormulaSolve(21, "wbe", {w, be}, w / be);
        });
        it("solves for weight", function () {
            testAircraftFormulaSolve(21, "w", {be, wbe: w / be}, w);
        });
        it("solves for effective span", function () {
            testAircraftFormulaSolve(21, "be", {w, wbe: w / be}, be);
        });
    });
    describe("Formula 22: Sink rate from drag area and eff. span", function () {
        var rs;
        beforeEach(function () {
            rs = solvedFormulas[22].rs(sigma, ad, v, w, be);
        });
        it("has the same answer as for formula 11", function () {
            var ws = w / s;
            cl = solvedFormulas[7].cl(ws, sigma, v);
            var cd = solvedFormulas[15].cd(cd0, cl, ear);
            testAircraftFormulaSolve(11, "rs", {sigma, w, s, cd, cl}, rs);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(22, "sigma", [rs, ad, v, w, be], sigma);
        });
        it("solves for drag area", function () {
            testAircraftFormula(22, "ad", [rs, sigma, v, w, be], ad);
        });
        it("solves for velocity", function () {
            testAircraftFormula(22, "v", [rs, sigma, ad, w, be], v);
        });
        it("solves for weight", function () {
            testAircraftFormula(22, "w", [rs, sigma, ad, v, be], w);
        });
        it("solves for effective span", function () {
            testAircraftFormula(22, "be", [rs, sigma, ad, v, w], be);
        });
    });
    describe("Formula 25: Dimensionless sink rate", function () {
        var rs;
        var rsmin;
        var rshat;
        var vmins;
        var vhat;
        beforeEach(function () {
            vmins = solvedFormulas[21].vmins(w, be, sigma, ad);
            vhat = v / vmins;
            rshat = solvedFormulas[25].rshat(vhat);
        });
        it("is equivalent to rate of sink over minimum sink rate", function () {
            rs = solvedFormulas[22].rs(sigma, ad, v, w, be);
            rsmin = solvedFormulas[20].rsmin(w, sigma, ad, be);
            expect(rshat).toBeCloseTo(rs / rsmin);
        });
        it("solves for vhat", function () {
            testAircraftFormula(25, "vhat", [rshat], vhat);
        });
    });
    describe("Formula 26: d/dx glide angle using drag coeff.", function () {
        var dg_dcl;
        var cd;
        beforeEach(function () {
            cl = random(1, 2);
            dg_dcl = solvedFormulas[26].dg_dcl(cl, cd0, ear);
        });
        it("should be formula 9 d/dx with respect to CL", function () {
            cd = solvedFormulas[15].cd(cd0, cl, ear);
            expect(dg_dcl).toBeCloseTo(solvedFormulas[9].thetag(cd, cl) / cl);
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormula(26, "cl", [dg_dcl, cd0, ear], cl);
        });
        it("solves for parasitic drag", function () {
            testAircraftFormula(26, "cd0", [dg_dcl, cl, ear], cd0);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(26, "ear", [dg_dcl, cl, cd0], ear);
        });
    });
    describe("Formula 27: Coeff. of lift for max lift-to-drag", function () {
        var clmaxld;
        var dg_dcl;
        it("is the same as Formulas 26 for coefficient of lift", function () {
            clmaxld = solvedFormulas[27].clmaxld(ear, cd0);
            cl = random(1, 2);
            dg_dcl = solvedFormulas[26].dg_dcl(cl, cd0, ear);
            var clmaxld26 = Math.sqrt(1 / (-1 / (cl * cl) +
                dg_dcl * Math.TAU / 360 / cd0));
            expect(clmaxld26).toBeCloseTo(clmaxld);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(27, "ear", [clmaxld, cd0], ear);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(27, "cd0", [clmaxld, ear], cd0);
        });
    });
    describe("Formula 28: Maximum lift-to-drag ratio", function () {
        var ldmax;
        var clmaxld;
        beforeEach(function () {
            ldmax = solvedFormulas[28].ldmax(ear, cd0);
        });
        it("ldmax is max lift-to-drag ratio divided by drag", function () {
            clmaxld = solvedFormulas[27].clmaxld(ear, cd0);
            expect(ldmax).toBeCloseTo(clmaxld / (2 * cd0));
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormulaSolve(28, "ear", {ldmax, cd0}, ear);
        });
        it("solves for parasite drag", function () {
            testAircraftFormulaSolve(28, "cd0", {ldmax, ear}, cd0);
        });
    });
    describe("Formula 29: Max lift-to-drag ratio", function () {
        var ldmax;
        var ldmax28;
        beforeEach(function () {
            ldmax = solvedFormulas[29].ldmax(be, ad);
        });
        it("should have the same value as for formulas 28", function () {
            ldmax28 = solvedFormulas[28].ldmax(ear, cd0);
            expect(ldmax).toBeCloseTo(ldmax28);
        });
        it("should solve for effective span", function () {
            testAircraftFormula(29, "be", [ldmax, ad], be);
        });
        it("should solve for drag area", function () {
            testAircraftFormula(29, "ad", [ldmax, be], ad);
        });
    });
    describe("Formula 30: Minimum drag", function () {
        var dmin;
        var ldmax;
        beforeEach(function () {
            dmin = solvedFormulas[30].dmin(ad, w, be);
        });
        it("should be the inv. of max lift/drag ratio x weight", function () {
            ldmax = solvedFormulas[29].ldmax(be, ad);
            expect(dmin).toBeCloseTo(1 / ldmax * w);
        });
        it("solves for drag area", function () {
            testAircraftFormula(30, "ad", [dmin, w, be], ad);
        });
        it("solves for weight", function () {
            testAircraftFormula(30, "w", [dmin, ad, be], w);
        });
        it("solves for effective span", function () {
            testAircraftFormula(30, "be", [dmin, ad, w], be);
        });
    });
    describe("Formula 31: Available hp to maintain level flight", function () {
        var thpal;
        var rs;
        beforeEach(function () {
            thpal = solvedFormulas[31].thpal(sigma, ad, v, w, be);
        });
        it("should be formula 22 times weight over 33000", function () {
            rs = solvedFormulas[22].rs(sigma, ad, v, w, be);
            expect(thpal).toBeCloseTo(rs * w / 33000);
        });
        it("solves for density ratio", function () {
            testAircraftFormulaSolve(31, "sigma", {thpal, ad, v, w, be}, sigma);
        });
        it("solves for drag area", function () {
            testAircraftFormulaSolve(31, "ad", {thpal, sigma, v, w, be}, ad);
        });
        it("solves for velocity", function () {
            testAircraftFormulaSolve(31, "v", {thpal, sigma, ad, w, be}, v);
        });
        it("solves for weight", function () {
            testAircraftFormula(31, "w", [thpal, sigma, ad, v, be], w);
        });
        it("solves for effective span", function () {
            testAircraftFormula(31, "be", [thpal, sigma, ad, v, w], be);
        });
    });
    describe("Formula 31: Total thrust relationship", function () {
        var thpa;
        beforeEach(function () {
            thpa = solvedFormulas[31].solve({ad, vmax: v, sigma}).thpa;
            bhp = thpa / e;
        });
        it("solves for drag area", function () {
            var data = {vmax: v, sigma, thpa, eta: e, bhp};
            testAircraftFormulaSolve(31, "ad", data, ad);
        });
        it("solves for velocity", function () {
            var data = {ad, sigma, thpa, eta: e, bhp};
            testAircraftFormulaSolve(31, "vmax", data, v);
        });
        it("solves for bhp", function () {
            var data = {ad, vmax: v, sigma, thpa, eta: e};
            testAircraftFormulaSolve(31, "bhp", data, bhp);
        });
        it("solves for eta", function () {
            var data = {ad, vmax: v, sigma, thpa, bhp};
            testAircraftFormulaSolve(31, "eta", data, e);
        });
    });
    describe("Formula 32: Available horsepower for level flight", function () {
        var thpal;
        var rs;
        beforeEach(function () {
            rs = solvedFormulas[22].rs(sigma, ad, v, w, be);
            thpal = solvedFormulas[32].thpal(rs, w);
        });
        it("should be equivalent to formula 31", function () {
            var expected = solvedFormulas[31].thpal(sigma, ad, v, w, be);
            expect(thpal).toBeCloseTo(expected);
        });
        it("solves for rate of sink", function () {
            testAircraftFormula(32, "rs", [thpal, w], rs);
        });
        it("solves for w", function () {
            testAircraftFormula(32, "w", [thpal, rs], w);
        });
    });
    describe("Formula 33: Minimum power for level flight", function () {
        var thpmin;
        var rsmin;
        beforeEach(function () {
            thpmin = solvedFormulas[33].thpmin(ad, sigma, w, be);
        });
        it("should be equivalent to formula 32", function () {
            rsmin = solvedFormulas[20].rsmin(w, sigma, ad, be);
            testAircraftFormula(32, "thpal", [rsmin, w], thpmin);
        });
        it("solves for drag area", function () {
            testAircraftFormula(33, "ad", [thpmin, sigma, w, be], ad);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(33, "sigma", [thpmin, ad, w, be], sigma);
        });
        it("solves for weight", function () {
            testAircraftFormula(33, "w", [thpmin, ad, sigma, be], w);
        });
        it("solves for effective span", function () {
            testAircraftFormula(33, "be", [thpmin, ad, sigma, w], be);
        });
    });
    describe("Formula 34: Thrust from a climbing flight", function () {
        var t;
        var d;
        var thetac;
        beforeEach(function () {
            thetac = random(0, 20);
            d = random(100, 500);
            t = solvedFormulas[34].t(d, w, thetac);
        });
        it("thrust is drag + weight x climb angle", function () {
            expect(t).toBeCloseTo(d + w * Math.sin(thetac / 360 * Math.TAU));
        });
        it("solves for drag", function () {
            testAircraftFormula(34, "d", [t, w, thetac], d);
        });
        it("solves for weight", function () {
            testAircraftFormula(34, "w", [t, d, thetac], w);
        });
        it("solves for climbing angle", function () {
            testAircraftFormula(34, "thetac", [t, d, w], thetac);
        });
    });
    describe("Formula 35: Lift from a climbing angle", function () {
        var l;
        var thetac;
        beforeEach(function () {
            thetac = random(0, 20);
            l = solvedFormulas[35].l(w, thetac);
        });
        it("should be the same as for lift from a gliding flight", function () {
            expect(l).toBeCloseTo(solvedFormulas[2].l(w, thetac));
        });
        it("solves for weight", function () {
            testAircraftFormula(35, "w", [l, thetac], w);
        });
        it("solves for climbing angle", function () {
            testAircraftFormula(35, "thetac", [l, w], thetac);
        });
    });
    describe("Formula 36: Thrust, normal to climbing flight path", function () {
        var thetac;
        var t;
        beforeEach(function () {
            thetac = random(0, 20);
            t = solvedFormulas[36].t(thetac, sigma, ad, v, w, be);
        });
        it("solves for climb angle", function () {
            testAircraftFormula(36, "thetac", [t, sigma, ad, v, w, be], thetac);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(36, "sigma", [t, thetac, ad, v, w, be], sigma);
        });
        it("solves for drag area", function () {
            testAircraftFormula(36, "ad", [t, thetac, sigma, v, w, be], ad);
        });
        it("solves for velocity", function () {
            testAircraftFormula(36, "v", [t, thetac, sigma, ad, w, be, v], v);
        });
        it("solves for weight", function () {
            testAircraftFormula(36, "w", [t, thetac, sigma, ad, v, be], w);
        });
        it("solves for effective span", function () {
            testAircraftFormula(36, "be", [t, thetac, sigma, ad, v, w], be);
        });
    });
    describe("Formula 38: Rate of climb", function () {
        var rc;
        var rs;
        beforeEach(function () {
            rs = solvedFormulas[22].rs(sigma, ad, v, w, be);
            rc = solvedFormulas[38].rc(bhp, w, eta, rs);
        });
        it("solves for engine brake horsepower", function () {
            testAircraftFormula(38, "bhp", [rc, w, eta, rs], bhp);
        });
        it("solves for weight", function () {
            testAircraftFormula(38, "w", [rc, bhp, eta, rs], w);
        });
        it("solves for efficiency", function () {
            testAircraftFormula(38, "eta", [rc, bhp, w, rs], eta);
        });
        it("solves for rate of sink", function () {
            testAircraftFormula(38, "rsmin", [rc, bhp, w, eta], rs);
        });
    });
    describe("Formula 39: Mass conservation equation", function () {
        var mdot;
        beforeEach(function () {
            mdot = solvedFormulas[39].solve({rho, ap, vp}).mdot;
        });
        it("solves for air pressure", function () {
            testAircraftFormula(39, "rho", [mdot, ap, vp], rho);
        });
        it("solves for propeller area", function () {
            testAircraftFormula(39, "rho", [mdot, rho, vp], ap);
        });
        it("solves for propeller velocity", function () {
            testAircraftFormula(39, "rho", [mdot, rho, ap], vp);
        });
    });
    describe("Formula 40: Change in momentum vs pressure jump", function () {
        var t;
        beforeEach(function () {
            t = solvedFormulas[40].t(m, v3, v);
        });
        it("solves for thrust from velocity", function () {
            testAircraftFormula(40, "t", [m, v3, v], t);
        });
        it("solves for mass flow rate", function () {
            testAircraftFormula(40, "m", [t, v3, v], m);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(40, "v3", [t, m, v], v3);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(40, "v", [t, m, v3], v);
        });
    });
    describe("Formula 41: Upstream propeller pressure increase", function () {
        var pdi;
        var p1i;
        beforeEach(function () {
            pdi = solvedFormulas[41].pdi(pd, rho, v);
            p1i = solvedFormulas[41].p1i(p1, rho, vp);
        });
        it("solves for pressure differential", function () {
            testAircraftFormula(41, "pd", [pdi, rho, v], pd);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(41, "rho", [pdi, pd, v], rho);
        });
        it("solves for velocity", function () {
            testAircraftFormula(41, "v", [pdi, pd, rho], v);
        });
        it("solves for pressure before propeller", function () {
            testAircraftFormula(41, "p1", [p1i, rho, vp], p1);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(41, "rho", [p1i, p1, vp], rho);
        });
        it("solves for velocity from differential increase", function () {
            testAircraftFormula(41, "v", [p1i, p1, rho], vp);
        });
    });
    describe("Formula 42: Downstream propeller pressure", function () {
        beforeEach(function () {
            p2 = solvedFormulas[42].p2(pd, rho, vp, v3);
        });
        it("solves for pressure differential", function () {
            testAircraftFormula(42, "pd", [p2, rho, vp, v3], pd);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(42, "rho", [p2, pd, vp, v3, rho], rho);
        });
        it("solves for propeller velocity", function () {
            testAircraftFormula(42, "vp", [p2, pd, rho, v3], vp);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(42, "v3", [p2, pd, rho, vp], v3);
        });
    });
    describe("Formula 43: Propeller pressure jump", function () {
        beforeEach(function () {
            p2 = solvedFormulas[43].p2(p1, rho, v3, v);
        });
        it("solves for upstream pressure", function () {
            testAircraftFormula(43, "p1", [p2, rho, v3, v], p1);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(43, "rho", [p1, p2, v3, v], rho);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(43, "v3", [p1, p2, rho, v], v3);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(43, "v", [p1, p2, rho, v3], v);
        });
    });
    describe("Formula 44: Thrust force", function () {
        var t;
        beforeEach(function () {
            t = solvedFormulas[44].t(rho, v3, v, ap);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(44, "rho", [t, v3, v, ap], rho);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(44, "v3", [t, rho, v, ap], v3);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(44, "v", [t, rho, v3, ap], v);
        });
        it("solves for propeller area", function () {
            testAircraftFormula(44, "ap", [t, rho, v3, v], ap);
        });
    });
    describe("Formula 45: Prop velocity", function () {
        beforeEach(function () {
            vp = solvedFormulas[45].vp(v3, v);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(45, "v", [vp, v3], v);
        });
    });
    describe("Formula 46: Slipstream velocity", function () {
        beforeEach(function () {
            vp = solvedFormulas[45].vp(v3, v);
        });
        it("solves for a reworking of #45", function () {
            testAircraftFormula(46, "v3", [vp, v], v3);
        });
    });
    describe("Formula 47: Available propeller thrust", function () {
        var t;
        beforeEach(function () {
            t = solvedFormulas[47].t(rho, ap, vp, v);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(47, "rho", [t, ap, vp, v], rho);
        });
        it("solves for propeller area", function () {
            testAircraftFormula(47, "ap", [t, rho, vp, v], ap);
        });
        it("solves for propeller velocity", function () {
            testAircraftFormula(47, "vp", [t, rho, ap, v], vp);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(47, "v", [t, rho, ap, vp], v);
        });
    });
    describe("Formula 48: Propulsive efficiency proportionality", function () {
        var t;
        var pthrust;
        var pshaft;
        beforeEach(function () {
            t = solvedFormulas[47].t(rho, ap, vp, v);
            pthrust = t * v;
            pshaft = solvedFormulas[49].pshaft(rho, ap, vp, v);
            eta = pthrust / pshaft;
        });
        it("solves for thrust power", function() {
            testAircraftFormulaSolve(48, "pthrust", {t, v}, pthrust);
        });
        it("solves for thrust from thrust power", function() {
            testAircraftFormulaSolve(48, "t", {pthrust, v}, t);
        });
        it("solves for velocity from thrust power", function() {
            testAircraftFormulaSolve(48, "v", {pthrust, t}, v);
        });
        it("solves for shaft power", function() {
            testAircraftFormulaSolve(48, "pshaft", {t, vp}, pshaft);
        });
        it("solves for thrust from shaft power", function() {
            testAircraftFormulaSolve(48, "t", {pshaft, vp}, t);
        });
        it("solves for propeller velocity", function() {
            testAircraftFormulaSolve(48, "vp", {pshaft, t}, vp);
        });
        it("solves for propulsive efficiency", function() {
            testAircraftFormulaSolve(48, "eta", {pthrust, pshaft}, eta);
        });
        it("solves for thrust power from efficiency", function() {
            testAircraftFormulaSolve(48, "pthrust", {eta, pshaft}, pthrust);
        });
        it("solves for shaft power from efficency", function() {
            testAircraftFormulaSolve(48, "pshaft", {eta, pthrust}, pshaft);
        });
    });
    describe("Formula 49: Engine power at shaft", function () {
        var pshaft;
        beforeEach(function () {
            pshaft = solvedFormulas[49].pshaft(rho, ap, vp, v);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(49, "rho", [pshaft, ap, vp, v], rho);
        });
        it("solves for propeller area", function () {
            testAircraftFormula(49, "ap", [pshaft, rho, vp, v], ap);
        });
        it("solves for propeller velocity", function () {
            testAircraftFormula(49, "vp", [pshaft, rho, ap, v], vp);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(49, "v", [pshaft, rho, ap, vp], v);
        });
    });
    describe("Formula 50: Engine power", function () {
        beforeEach(function () {
            bhp = solvedFormulas[50].bhp(sigma, dp, v, eta);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(50, "sigma", [bhp, dp, v, eta], sigma);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(50, "dp", [bhp, sigma, v, eta], dp);
        });
        it("solves for velocity", function () {
            testAircraftFormula(50, "v", [bhp, sigma, dp, eta], v);
        });
        // Solving for eta results are too inaccurate
    });
    describe("Formula 51: Propeller velocity", function () {
        var vprop;
        beforeEach(function () {
            bhp = solvedFormulas[50].bhp(sigma, dp, v, eta);
            vprop = solvedFormulas[51].vprop(bhp, sigma, dp);
        });
        it("solves for engine power", function () {
            testAircraftFormula(51, "bhp", [vprop, sigma, dp], bhp);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(51, "sigma", [vprop, bhp, dp], sigma);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(51, "dp", [vprop, bhp, sigma], dp);
        });
    });
    describe("Formula 52: Dimensionless velocity", function () {
        var vhat;
        beforeEach(function () {
            vhat = solvedFormulas[52].vhat(eta);
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(52, "eta", [vhat], eta);
        });
    });
    describe("Formula 53: Cubic equation for dimensionless vel", function () {
        var vhat;
        beforeEach(function () {
            vhat = solvedFormulas[52].vhat(eta);
        });
        it("shows that eta and vhat are solved as close to zero", function () {
            testAircraftFormula(53, "zero", [eta, vhat], 0);
        });
    });
    describe("Formula 54: cubic equation solution", function () {
        var vhat;
        beforeEach(function () {
            vhat = solvedFormulas[52].vhat(eta);
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(54, "eta", [vhat], eta);
        });
    });
    describe("Formula 55: Nondimensional advance ratio (/sec)", function () {
        var j;
        beforeEach(function () {
            j = solvedFormulas[55].j(v, n, dp);
        });
        it("solves for velocity", function () {
            testAircraftFormula(55, "v", [j, n, dp], v);
        });
        it("solves for propeller rotation", function () {
            testAircraftFormula(55, "n", [j, v, dp], n);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(55, "dp", [j, v, n], dp);
        });
    });
    describe("Formula 56: Nondimensional advance ratio (/hour)", function () {
        var j;
        beforeEach(function () {
            j = solvedFormulas[56].j(v, rpm, dp);
        });
        it("solves for velocity", function () {
            testAircraftFormula(56, "v", [j, rpm, dp], v);
        });
        it("solves for revolutions per minute", function () {
            testAircraftFormula(56, "rpm", [j, v, dp], rpm);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(56, "dp", [j, v, rpm], dp);
        });
    });
    describe("Formula 57: Dimensionless power coeff. (ft-lb/sec)", function () {
        var p;
        var cp;
        beforeEach(function () {
            p = solvedFormulas[49].pshaft(rho, ap, vp, v);
            cp = solvedFormulas[57].cp(p, rho, n, dp);
        });
        it("solves for engine shaft power", function () {
            testAircraftFormula(57, "p", [cp, rho, n, dp], p);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(57, "rho", [cp, p, n, dp], rho);
        });
        it("solves for propeller revolutions", function () {
            testAircraftFormula(57, "n", [cp, p, rho, dp], n);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(57, "dp", [cp, p, rho, n], dp);
        });
    });
    describe("Formula 58: Dimensionless power coeff. as rpm", function () {
        var cp;
        beforeEach(function () {
            cp = solvedFormulas[58].cp(bhp, rpm, dp);
        });
        it("solves for BHP", function () {
            testAircraftFormula(58, "bhp", [cp, rpm, dp], bhp);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(58, "rpm", [cp, bhp, dp], rpm);
        });
        it("solves for propeller revolutions", function () {
            testAircraftFormula(58, "dp", [cp, bhp, rpm], dp);
        });
    });
    describe("Formula 58: Dimensionless power coefficient as rpm", function () {
        var cp;
        beforeEach(function () {
            cp = solvedFormulas[58].cp(bhp, rpm, dp);
        });
        it("solves for BHP", function () {
            testAircraftFormula(58, "bhp", [cp, rpm, dp], bhp);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(58, "rpm", [cp, bhp, dp], rpm);
        });
        it("solves for propeller revolutions", function () {
            testAircraftFormula(58, "dp", [cp, bhp, rpm], dp);
        });
    });
    describe("Formula 59: Dimensionless velocity", function () {
        var j;
        var cp;
        var vhat;
        beforeEach(function () {
            j = solvedFormulas[56].j(v, rpm, dp);
            cp = solvedFormulas[58].cp(bhp, rpm, dp);
            vhat = solvedFormulas[59].vhat(j, cp);
        });
        it("solves for nondimensional advance ratio", function () {
            testAircraftFormula(59, "j", [vhat, cp], j);
        });
        it("solves for power coefficient", function () {
            testAircraftFormula(59, "cp", [vhat, j], cp);
        });
    });
    describe("Formula 60: Approx. of static thrust as ft-lb/sec", function () {
        var p;
        var ts;
        beforeEach(function () {
            p = solvedFormulas[49].pshaft(rho, ap, vp, v);
            ts = solvedFormulas[60].ts(rho, dp, p);
        });
        it("solves for air density", function () {
            testAircraftFormula(60, "rho", [ts, dp, p], rho);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(60, "dp", [ts, rho, p], dp);
        });
        it("solves for propeller engine power", function () {
            testAircraftFormula(60, "pshaft", [ts, rho, dp], p);
        });
    });
    describe("Formula 61: Approximation of static thrust as rpm", function () {
        var ts;
        beforeEach(function () {
            ts = solvedFormulas[61].ts(sigma, dp, bhp);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(61, "sigma", [ts, dp, bhp], sigma);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(61, "dp", [ts, sigma, bhp], dp);
        });
        it("solves for BHP", function () {
            testAircraftFormula(61, "bhp", [ts, sigma, dp], bhp);
        });
    });
    describe("Formula 62: Ideal thrust from engine-prop. combo", function () {
        var vhat;
        var that;
        beforeEach(function () {
            vhat = solvedFormulas[52].vhat(eta);
            that = solvedFormulas[62].that(eta, vhat);
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(62, "eta", [that, vhat], eta);
        });
        it("solves for dimensionless speed", function () {
            testAircraftFormula(62, "vhat", [that, eta], vhat);
        });
    });
    describe("Formula 63: Thrust ratio from dimensionless vel.", function () {
        var vhat;
        var that;
        beforeEach(function () {
            vhat = solvedFormulas[52].vhat(eta);
            that = solvedFormulas[62].that(eta, vhat);
        });
        it("solves for ideal thrust ratio", function () {
            testAircraftFormula(63, "that", [vhat], that);
        });
    });
    describe("Formula 64: Propeller tip mach number", function () {
        var mp;
        beforeEach(function () {
            mp = solvedFormulas[64].mp(rpm, dp);
        });
        it("solves for rpm", function () {
            testAircraftFormula(64, "rpm", [mp, dp], rpm);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(64, "dp", [mp, rpm], dp);
        });
    });
    xdescribe("Appendix D", function () {
        function convertToRankine(f) {
            return f + 460;
        }
        describe("1: differential form for vertical momentum", function () {
            // dp/dh = -ρg
            var dh;
            var g;
            beforeEach(function () {
                dh = random(1, 100);
                rho = 0.002377 + random(0, 0.002377 - 0.005);
                g = 32.1740; // ft/sec^2
                dp = -rho * g * dh;
            });
            it("solves for dp", function () {
                expect(solvedFormulas.d[1].dp(rho, dh)).toBeCloseTo(dp);
            });
            it("solves for dh", function () {
                expect(solvedFormulas.d[1].dh(dp, rho)).toBeCloseTo(dh);
            });
            it("solves for rho", function () {
                expect(solvedFormulas.d[1].rho(dp, dh)).toBeCloseTo(rho);
            });
        });
        describe("1: differential form for vertical momentum", function () {
            // dp/dh = -ρg
            var dh;
            var g;
            beforeEach(function () {
                dh = random(1, 100);
                rho = 0.002377 + random(0, 0.002377 - 0.005);
                g = 32.1740; // ft/sec^2
                dp = -rho * g * dh;
            });
            it("solves for dp", function () {
                expect(solvedFormulas.d[1].dp(rho, dh)).toBeCloseTo(dp);
            });
        });
        describe("6: Density pressure in Isothermal atmo.", function () {
            var p0;
            var h;
            var t0;
            var p;
            beforeEach(function () {
                p0 = 1 - Math.random() / 10;
                h = Math.random() * 1000;
                t0 = Math.random() * 50 * 460; // rankine
                p = solvedFormulas.d[6].p(p0, h, t0);
            });
            it("solves for height", function () {
                expect(solvedFormulas.d[6].h(p, p0, t0, h)).toBeCloseTo(h);
            });
            it("solves for constant temperature", function () {
                expect(solvedFormulas.d[6].t0(p, p0, h, t0)).toBeCloseTo(t0);
            });
        });
        describe("7: Density ratio in Isothermal atmosphere", function () {
            var h;
            var t0;
            beforeEach(function () {
                h = Math.random() * 1000;
                t0 = convertToRankine(Math.random() * 50);
                sigma = solvedFormulas.d[7].sigma(h, t0);
            });
            it("solves for height", function () {
                expect(solvedFormulas.d[7].h(sigma, t0)).toBeCloseTo(h);
            });
            it("solves for constant temperature", function () {
                expect(solvedFormulas.d[7].t0(sigma, h, t0)).toBeCloseTo(t0);
            });
        });
        describe("8: Density ratio in characteristic atmosphere", function () {
            var h;
            var h0;
            var t0;
            beforeEach(function () {
                h = Math.random() * 1000;
                t0 = 519; // average at sealevel
                h0 = 27713; // characteristic altitude: R * t0 / G
                sigma = solvedFormulas.d[8].sigma(h, h0);
            });
            it("is equivalent to formulas D.7", function () {
                expect(solvedFormulas.d[7].sigma(h, t0)).toBeCloseTo(sigma);
            });
            it("it solves for height", function () {
                expect(solvedFormulas.d[8].h(sigma, h0)).toBeCloseTo(h);
            });
            it("it solves for characteristic altitude", function () {
                expect(solvedFormulas.d[8].h0(sigma, h)).toBeCloseTo(h0);
            });
        });
        describe("12: Variation of density ratio up to 36240 ft", function () {
            var h;
            var f;
            beforeEach(function () {
                h = Math.random() * 36240;
                f = random(32, 80);
                sigma = solvedFormulas.d[12].sigma(h, f);
            });
            it("is a ratio of 1 at sealevel", function () {
                expect(solvedFormulas.d[12].sigma(0, f)).toBe(1);
            });
            it("solves for height", function () {
                expect(solvedFormulas.d[12].h(sigma, f)).toBeCloseTo(h);
            });
            it("solves for temperature", function () {
                expect(solvedFormulas.d[12].f(sigma, h)).toBeCloseTo(f);
            });
            it("uses -70F for altitudes at 36240 ft and higher", function () {
                var lowAltAt80 = solvedFormulas.d[12].sigma(36000, 80);
                var lowAltAt0 = solvedFormulas.d[12].sigma(36000, 0);
                var highAltAt80 = solvedFormulas.d[12].sigma(37000, 80);
                var highAltAt0 = solvedFormulas.d[12].sigma(37000, 0);
                expect(lowAltAt80).toBeGreaterThan(lowAltAt0);
                expect(highAltAt80).toBe(highAltAt0);
            });
        });
    });
    describe("F: Airplane efficiency factor, e; ground effect", function () {
        var cdwing;
        var kwing;
        var cdfuse;
        var sfuse;
        var kfuse;
        var angleOfAttack;
        var cdcomp;
        var scomp;
        var planformCorrection;
        beforeEach(function () {
            cdwing = random(1, 1.5);
            kwing = random(0.05, 0.2);
            cdfuse = random(1, 1.5);
            sfuse = random(6, 20);
            kfuse = random(0.05, 0.2);
            angleOfAttack = random(0, 10);
            cdcomp = random(1, 1.5);
            scomp = random(2, 5);
            planformCorrection = random(0, 0.2);
        });
        describe("1: Drag coefficient of the wing area", function () {
            var cds;
            beforeEach(function () {
                cd0 = cdwing * s * (1 + kwing * cl * cl) + cdfuse * sfuse *
                    (1 + kfuse * angleOfAttack * angleOfAttack) +
                    cdcomp + scomp;
                cds = solvedFormulas.f[1].cds(cd0, cl, ear, s);
            });
            it("is the drag coeff. with induced drag across wing", function () {
                expect(solvedFormulas[15].cd(cd0, cl, ear) * s).toBe(cds);
            });
            it("solves for coefficient of drag", function () {
                expect(
                    solvedFormulas.f[1].cd0(cds, cl, ear, s)
                ).toBeCloseTo(cd0);
            });
            it("solves for coefficient of lift", function () {
                expect(
                    solvedFormulas.f[1].cl(cds, cd0, ear, s)
                ).toBeCloseTo(cl);
            });
            it("solves for effective aspect ratio", function () {
                expect(
                    solvedFormulas.f[1].ear(cds, cd0, cl, s)
                ).toBeCloseTo(ear);
            });
            it("solves for wing span", function () {
                expect(
                    solvedFormulas.f[1].s(cds, cd0, cl, ear)
                ).toBeCloseTo(s);
            });
        });
        describe("2: Drag coefficient from separate components", function () {
            var cdi;
            beforeEach(function () {
                cd0 = cdwing * s * (1 + kwing * cl * cl) + cdfuse * sfuse *
                    (1 + kfuse * angleOfAttack * angleOfAttack) +
                    cdcomp * scomp;
            });
            it("uses contribs from different drag components", function () {
                cdi = cl * cl / (Math.PI * ar) * (1 + planformCorrection) * s;
                expect(
                    solvedFormulas.f[2].cds(cdwing, s, kwing, cl, cdfuse, sfuse,
                    kfuse, angleOfAttack, cdcomp, scomp, ar, planformCorrection)
                ).toBeCloseTo(cd0 + cdi);
            });
        });
        describe("5: Drag area from separate components", function () {
            beforeEach(function () {
                ad = solvedFormulas.f[5].ad(cdwing, s, cdfuse, sfuse,
                    cdcomp, scomp);
            });
            it("is the same as F.2 at zero lift conditions", function () {
                cl = 0;
                angleOfAttack = 0;
                expect(ad).toBeCloseTo(solvedFormulas.f[2].cds(cdwing, s, kwing,
                    cl, cdfuse, sfuse, kfuse, angleOfAttack, cdcomp, scomp,
                    ar, planformCorrection));
            });
        });
        describe("6: Lift slope", function () {
            var liftSlope;
            beforeEach(function () {
                liftSlope = solvedFormulas.f[6].liftSlope(ar);
            });
            it("solves for aspect ratio", function () {
                expect(solvedFormulas.f[6].ar(liftSlope)).toBeCloseTo(ar);
            });
        });
        describe("7: Linear approximation of coefficient of lift", function () {
            var liftSlope;
            beforeEach(function () {
                liftSlope = solvedFormulas.f[6].liftSlope(ar);
                cl = solvedFormulas.f[7].cl(liftSlope, angleOfAttack);
            });
            it("equals F.6 times angle of attack", function () {
                expect(liftSlope * angleOfAttack).toBeCloseTo(cl);
            });
            it("solves for liftSlope", function () {
                expect(
                    solvedFormulas.f[7].liftSlope(cl, angleOfAttack)
                ).toBeCloseTo(liftSlope);
            });
            it("solves for angle of attack", function () {
                expect(
                    solvedFormulas.f[7].angleOfAttack(cl, liftSlope)
                ).toBeCloseTo(angleOfAttack);
            });
        });
        describe("8: Airplane efficiency factor", function () {
            var invew;
            var cdfusekfuse;
            var deltafuse;
            var inve;
            beforeEach(function () {
                 invew = solvedFormulas.f[8].solve(
                    {planformCorrection, ar, cdwing, kwing}).invew;
                cdfusekfuse = solvedFormulas.f[8].solve(
                    {ar, cdfusekfuse, sfuse, s}).cdfusekfuse;
                deltafuse = solvedFormulas.f[8].solve(
                    {ar, cdfusekfuse, sfuse, s}
                ).deltafuse;
                inve = solvedFormulas.f[8].inve(invew, deltafuse);
            });
            it("gets eff from wing eff factor and fuselage corr", function () {
                    // console.log({inve, invew, deltafuse});
            });
            it("solves for planform correction", function () {
                expect(solvedFormulas.f[8].planformCorrection(invew, ar,
                    cdwing, kwing)).toBeCloseTo(planformCorrection);
            });
            it("solves for aspect ratio from wing eff. factor", function () {
                expect(solvedFormulas.f[8].solve({invew, planformCorrection,
                    cdwing, kwing}).ar).toBeCloseTo(ar);
            });
            it("solves for the wing coefficient of drag", function () {
                expect(solvedFormulas.f[8].cdwing(invew, planformCorrection,
                    ar, kwing)).toBeCloseTo(cdwing);
            });
            it("solves for the change of wing parasite drag", function () {
                expect(solvedFormulas.f[8].kwing(invew, planformCorrection, ar,
                    cdwing)).toBeCloseTo(kwing);
            });
            // we need kfuse for these tests
            it("solves for aspect ratio from fuselage corr.", function () {
                // todo: add formulas for aspect ratio from fuselage correction
            });
            it("solves for fuselage coefficient of drag", function () {
                // expect(solvedFormulas.f[8].cdfuse(deltafuse, ar,
                //     kfuse, sfuse, s)).toBeCloseTo(cdfuse);
            });
            it("solves for change of fuselage parasite drag", function () {
                // expect(solvedFormulas.f[8].kfuse(deltafuse, ar,
                //     cdfuse, sfuse, s, kfuse)).toBeCloseTo(kfuse);
            });
            it("solves for fuselage area", function () {
                // expect(solvedFormulas.f[8].sfuse(deltafuse, ar,
                //     cdfuse, kfuse, s, sfuse)).toBeCloseTo(sfuse);
            });
            it("solves for wing area", function () {
                // expect(solvedFormulas.f[8].s(deltafuse, ar,
                //     cdfuse, kfuse, sfuse, s)).toBeCloseTo(s);
            });
            it("solves for wing efficiency from fuselage efficiency and overall efficiency", function () {
                expect(solvedFormulas.f[8].solve(
                    {inve, deltafuse}).invew).toBeCloseTo(invew);
            });
            it("solves for fuselage efficiency from wing efficiency and overall efficiency", function () {
                expect(solvedFormulas.f[8].solve(
                    {inve, invew}).deltafuse).toBeCloseTo(deltafuse);
            });
        });
        describe("End of appendix formulas", function () {
            var fuselageCorrection;
            var inve;
            var invew;
            var deltafuse;
            beforeEach(function () {
                fuselageCorrection = random(0, 1);
                invew = random(1, 2);
                deltafuse = solvedFormulas.f[9].solve(
                    {fuselageCorrection, sfuse, s}).deltafuse;
                inve = solvedFormulas.f[9].solve({invew, deltafuse}).inve;
            });
            it("solves for fuselageCorrection", function () {
                expect(solvedFormulas.f[9].fuselageCorrection(
                    deltafuse, sfuse, s)).toBeCloseTo(fuselageCorrection);
            });
            it("solves for fuselage area", function () {
                expect(solvedFormulas.f[9].sfuse(
                    deltafuse, fuselageCorrection, s)).toBeCloseTo(sfuse);
            });
            it("solves for area", function () {
                expect(solvedFormulas.f[9].s(
                    deltafuse, fuselageCorrection, sfuse, s)).toBeCloseTo(s);
            });
            it("can solve for invew", function () {
                expect(solvedFormulas.f[9].solve(
                    {inve, deltafuse}).invew).toBeCloseTo(invew);
            });
            it("can invert an inverted efficiency", function () {
                expect(solvedFormulas.f[9].e(1 / e)).toBeCloseTo(e);
            });
            it("can invert the aircraft efficiency", function () {
                expect(solvedFormulas.f[9].solve({e}).inve).toBeCloseTo(1 / e);
            });
            describe("Ground effect", function () {
                var i;
                var values;
                var value;
                var h;
                var ew;
                var ewgd;
                var kgd;
                beforeEach(function () {
                    ew = random(1, 2);
                    h = random(0, 1000);
                    kgd = h / b;
                });
                it("can deal with ground effect", function () {
                    values = [
                        {x: 0.05, y: 2.9962},
                        {x: 0.07, y: 2.3991},
                        {x: 0.1, y: 1.9235},
                        {x: 0.2, y: 1.3631},
                        {x: 0.3, y: 1.2002},
                        {x: 0.4, y: 1.1369},
                        {x: 0.5, y: 1.1096}
                    ];
                    // values.forEach(function (value) {
                    //     expect(solvedFormulas.f[9].ewgd(
                    //         1, value.x, 1)).toBeCloseTo(value.y);
                    // });
                });
                it("works out ground effect on wing efficiency", function () {
                    kgd = solvedFormulas.f[9].ewgd(1, h, b);
                    ewgd = solvedFormulas.f[9].ewgd(ew, h, b);
                    expect(ewgd).toBeCloseTo(ew * kgd);
                });
            });
        });
    });
    xdescribe("G: Drag analysis", function () {
        describe("1: Drag area", function () {
            var cdf;
            var af;
            var cdw;
            var sw;
            beforeEach(function () {
                cdf = random(0.01, 0.10);
                af = random(1, 5);
                cdw = random(0.001, 0.010);
                sw = random(10, 50);
                ad = solvedFormulas.g[1].ad(cdf, af, cdw, sw);
            });
            it("solves for pressure drag coefficient", function () {
                expect(solvedFormulas.g[1].cdf(
                    ad, af, cdw, sw)).toBeCloseTo(cdf);
            });
            it("solves for frontal area", function () {
                expect(solvedFormulas.g[1].af(
                    ad, cdf, cdw, sw)).toBeCloseTo(af);
            });
            it("solves for skin drag coefficient", function () {
                expect(solvedFormulas.g[1].cdw(
                    ad, cdf, af, sw)).toBeCloseTo(cdw);
            });
            it("solves for wetted area", function () {
                expect(solvedFormulas.g[1].sw(
                    ad, cdf, af, cdw)).toBeCloseTo(sw);
            });
        });
    });
    xdescribe("J: Equation of state", function () {
        var r;
        var p;
        beforeEach(function () {
            rho = random(0.002377, 0.0005);
            r = random(390, 518);
            p = solvedFormulas.j[1].p(rho, r);
        });
        it("solves for rho", function () {
            expect(solvedFormulas.j[1].solve({p, r}).rho).toBeCloseTo(rho);
        });
        it("solves for rankine", function () {
            expect(solvedFormulas.j[1].r(p, rho)).toBeCloseTo(r);
        });
        describe("Density ratio", function () {
            beforeEach(function () {
                sigma = solvedFormulas.j[1].sigma(rho);
            });
            it("solves for rho", function () {
                expect(solvedFormulas.j[1].solve({sigma}).rho).toBeCloseTo(rho);
            });
        });
    });
}());
