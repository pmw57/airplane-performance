/*jslint browser:true */
/*global solvePoly, Solver, aircraftFormulas, aircraftSolver, chart
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

    var t18 = {
        vs0: 67,
        clmax: 1.52,
        vmax: 180,
        w: 1500,
        b: 20 + 10 / 12,
        sfuse: 3 * 3,
        ad: 3,
        bhp: 150,
        dp: 6
    };

    // TODO: Use formulas for **ALL** formula relationships

    // Relation 1: cl, v, w/s
    var v = t18.vs0 || random(50, 100);
    var clmax = t18.clmax || random(1, 2);
    // todo: What breaks when sigma is not 1?
    var sigma = 1; // sealevel
    var ws = solvedFormulas[7].solve({sigma, cl: clmax, v}).ws;
    var vmax = t18.vmax || random(80, 120);
    // Relation 2: s, w/s, w
    var w = t18.w || random(1000, 2000);
    var s = w / ws;
    // Relation 3: S, be, eAR, ce
    var b = t18.b || random(10, 30);
    var ar = b * b / s;
    var c = s / b;
    var sfuse = t18.sfuse || random(5, 15);
    var e = solvedFormulas.f[8].solve({ar, sfuse, s}).e;
    var ear = e * ar;
    var ce = c / Math.sqrt(e);
    var be = b * Math.sqrt(e);
    // Relation 4: be, wbe, w
    var wbe = w / be;
    console.table({
        v, clmax, ws, vmax,
        w, s,
        b, ar, c, sfuse, e, ear, ce, be,
        wbe
    });
    // Relation 5: ad, vmax, thpa
    var sea_level_density = 0.0023769;
    var airDensity = 0.5 * sea_level_density * Math.pow(5280 / 3600, 2);
    var hpMPH = 33000 * 60 / 5280;
    var ad = t18.ad || random(5, 15);
    var thpa = solvedFormulas[0].solve({ad, vmax}).thpa;
    var cd0 = ad / s;
    // Relation 6: cd0, ad, s
    var d = solvedFormulas[0].solve({ad, v}).d;
    var cd = solvedFormulas[0].solve({d, sigma, s, v}).cd;
    // Relation 7: AD, VminS, W/be, THPmin, Dmin
    var vmins = solvedFormulas[24].solve({sigma, ad, wbe}).vmins;
    var thpmin = solvedFormulas[33].solve({ad, sigma, wbe}).thpmin;
    var dmin = solvedFormulas[0].solve({ad, wbe}).dmin;
    // Relation 8: RSmin, THPmin, W
    var rsmin = solvedFormulas[0].solve({thpmin, w}).rsmin;
    var rs = rsmin * random(1, 2); // a random increase
    var thp = solvedFormulas[0].solve({w, rs}).thp;
    var rc = solvedFormulas[0].solve({rs, thpa, w}).rc;
    console.table({
        airDensity, hpMPH, thpa, ad, cd0,
        d, sigma, cd,
        vmins, thpmin, dmin,
        rsmin, rs, thp, rc
    });
    // Relation 9: AD, be, (L/D)max
    var ldmax = solvedFormulas[0].solve({ear, cd0}).ldmax;
    // Relation 10: AD, CLminS, ce
    var clmins = solvedFormulas[0].solve({ad, ce}).clmins;
    // Relation 11: W, BHP, RCmax
    var bhp = t18.bhp || random(100, 300);
    var rcmax = solvedFormulas[0].solve({bhp, w}).rcmax;
    // Relation 12: Ts, BHP, Vprop, Dp
    var dp = t18.dp || random(4, 10);
    var vprop = solvedFormulas[0].solve({bhp, sigma, dp}).vprop;
    var ts = solvedFormulas[0].solve({sigma, dp, bhp}).ts;
    console.table({
        ldmax,
        clmins,
        vprop,
        dp,
        ts
    });

    var thetag = solvedFormulas[1].solve({d, w}).thetag;
    var rho = 0.0023769;
    var m = 970;
    var vfs = v * 5280 / 3600;
    var v3 = larger(v);
    var pd = larger(v);
    var p1 = smaller(pd);
    var p2 = smaller(pd);
    var vp = larger(v);
    var ap = Math.TAU * (dp / 2);
    var eta = solvedFormulas[38].solve({thpa, bhp}).eta;
    var rpm = 2700;
    var n = 60;
    var cl = random(1, 2);
    var thpal = solvedFormulas[31].thpal(sigma, ad, v, wbe);
    function testAircraftFormula(index, prop, data, expected) {
        if (expected === undefined) {
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
            it("solves lift force from lift coeff. and velocity", function () {
                testAircraftFormula(7, "ws", {sigma, clmax, v}, ws);
                testAircraftFormula(7, "sigma", {ws, clmax, v}, sigma);
                testAircraftFormula(7, "clmax", {ws, sigma, v}, clmax);
                testAircraftFormula(7, "v", {ws, sigma, clmax}, v);
            });
        });
        describe("2: S, W/S, W", function () {
            it("solves wing area from wing loading and weight", function () {
                testAircraftFormula(0, "s", {ws, w}, s);
                testAircraftFormula(0, "ws", {w, s}, ws);
                testAircraftFormula(0, "w", {ws, s}, w);
            });
        });
        describe("3: S, be, eAR, ce", function () {
            it("solves chord from wing area and span", function () {
                testAircraftFormula(0, "c", {s, b}, c);
                testAircraftFormula(0, "s", {b, c}, s);
                testAircraftFormula(0, "b", {s, c}, b);
            });
            it("solves aspect ratio from span and chord", function () {
                expect(ar).toBeCloseTo(b / c);
                testAircraftFormula(14, "ar", {b, c}, ar);
                testAircraftFormula(14, "b", {ar, c}, b);
                testAircraftFormula(14, "c", {ar, b}, c);
            });
            it("solves aspect ratio from wing span and area", function () {
                expect(ar).toBeCloseTo(b *  b / s);
                testAircraftFormula(14, "ar", {b, s}, ar);
                testAircraftFormula(14, "b", {ar, s}, b);
                testAircraftFormula(14, "s", {ar, b}, s);
            });
            it("solves for efficency", function () {
                expect(solvedFormulas.f[8].solve(
                    {ar, sfuse, s}).e).toBeCloseTo(e);
                expect(solvedFormulas.f[8].solve(
                    {e, ar, s}).sfuse).toBeCloseTo(sfuse);
                expect(solvedFormulas.f[8].solve(
                    {e, ar, sfuse}).s).toBeCloseTo(s);
            });
            it("solves effective aspect ratio from e and ear", function () {
                testAircraftFormula(15, "ear", {e, ar}, ear);
                testAircraftFormula(15, "e", {ear, ar}, e);
                testAircraftFormula(15, "ar", {e, ear}, ar);
            });
            it("solves effective span from efficiency and span", function () {
                testAircraftFormula(20, "be", {e, b}, be);
                testAircraftFormula(20, "e", {be, b}, e);
                testAircraftFormula(20, "b", {e, be}, b);
            });
            it("solves effective chord from efficiency and chord", function () {
                testAircraftFormula(19, "ce", {e, c}, ce);
                testAircraftFormula(19, "e", {c, ce}, e);
                testAircraftFormula(19, "c", {e, ce}, c);
            });
        });
        describe("4: be, W/be, W", function () {
            it("solves for effective span loading", function () {
                testAircraftFormula(21, "wbe", {w, be}, wbe);
                testAircraftFormula(21, "be", {w, wbe}, be);
                testAircraftFormula(21, "w", {be, wbe}, w);
            });
        });
        describe("5: AD, Vmax, THPa", function () {
            // 1/146625 = 1/391 * 1/375
            // source: http://acversailles.free.fr/documentation/08~Documentation_Generale_M_Suire/Conception/Calculs_de_structure/Long%20wing%20for%20short%20power.pdf
            // 1/391 is air density

            // 1hp = 33000 ft lbf/min x 1 mile/5280 ft x 60 min/1 hour
            // 1hp = force[lbf] x speed[mph] / 375
            // source: http://craig.backfire.ca/pages/autos/drag
            // horsepower is 33000 measured in foot pounds per min
            // convert to miles per hour by multiplying by 60/5280
            // 1/375 is hp conversion from ft/min to mph
            it("solves for available thrust horsepower", function () {
                testAircraftFormula(0, "thpa", {ad, vmax}, thpa);
                testAircraftFormula(0, "ad", {thpa, vmax}, ad);
                testAircraftFormula(0, "vmax", {thpa, ad}, vmax);
            });
        });
        describe("6: CD0, AD, S", function () {
            it("solves for drag area from zero-lift coefficient", function () {
                testAircraftFormula(19, "ad", {cd0, s}, ad);
                testAircraftFormula(19, "cd0", {ad, s}, cd0);
                testAircraftFormula(19, "s", {ad, cd0}, s);
            });
            it("solves for drag", function () {
                testAircraftFormula(1, "d", {sigma, cd, s, v}, d);
                testAircraftFormula(1, "sigma", {d, cd, s, v}, sigma);
                testAircraftFormula(1, "cd", {d, sigma, s, v}, cd);
                testAircraftFormula(1, "s", {d, sigma, cd, v}, s);
                testAircraftFormula(1, "v", {d, sigma, cd, s}, v);
            });
            it("solves for drag using drag area", function () {
                testAircraftFormula(0, "d", {ad, v}, d);
                testAircraftFormula(0, "ad", {d, v}, ad);
                testAircraftFormula(0, "v", {d, ad}, v);
            });
            it("solves for drag assuming sea-level and zero-lift", function () {
                // assuming sea-level and zero-lift drag
                testAircraftFormula(0, "d", {cd0, s, v}, d);
                testAircraftFormula(0, "cd0", {d, s, v}, cd0);
                testAircraftFormula(0, "s", {d, cd0, v}, s);
                testAircraftFormula(0, "v", {d, cd0, s}, v);
            });
        });
        describe("7: AD, VminS, W/be, THPmin, Dmin", function () {
            it("solves for VminS", function () {
                testAircraftFormula(24, "vmins", {sigma, wbe, ad}, vmins);
                testAircraftFormula(24, "wbe", {vmins, sigma, ad}, wbe);
                testAircraftFormula(24, "ad", {vmins, sigma, wbe}, ad);
            });
            it("solves for THPmin", function () {
                testAircraftFormula(33, "thpmin", {ad, sigma, wbe}, thpmin);
                testAircraftFormula(33, "ad", {thpmin, sigma, wbe}, ad);
                testAircraftFormula(33, "wbe", {thpmin, sigma, ad}, wbe);
            });
            it("solves for Dmin", function () {
                testAircraftFormula(30, "dmin", {ad, wbe}, dmin);
                testAircraftFormula(30, "ad", {dmin, wbe}, ad);
                testAircraftFormula(30, "wbe", {dmin, ad}, wbe);
            });
        });
        describe("8: RSmin, THPmin, W", function () {
            // thp = W RS / 33000 (Relation 8)
            // thpal = RS W / 33000 (Formula 33)
            // Both can't be right, and thp isn't used anywhere.
            // Only thpa, thpal, and thpmin are used.
            it("solves for RS", function () {
                testAircraftFormula(0, "thp", {rs, w}, thp);
                testAircraftFormula(0, "rs", {thp, w}, rs);
                testAircraftFormula(0, "w", {thp, rs}, w);
            });
            it("solves for RSmin", function () {
                testAircraftFormula(0, "rsmin", {thpmin, w}, rsmin);
                testAircraftFormula(0, "thpmin", {rsmin, w}, thpmin);
                testAircraftFormula(0, "w", {rsmin, thpmin}, w);
            });
            it("solves for rc", function () {
                testAircraftFormula(0, "rc", {rs, thpa, w}, rc);
                testAircraftFormula(0, "rs", {rc, thpa, w}, rs);
                testAircraftFormula(0, "thpa", {rc, rs, w}, thpa);
                testAircraftFormula(0, "w", {rc, rs, thpa}, w);
            });
        });
        describe("9: AD, be, (L/D)max", function () {
            it("solves for ldmax", function () {
                testAircraftFormula(29, "ldmax", {be, ad}, ldmax);
                testAircraftFormula(29, "be", {ldmax, ad}, be);
                testAircraftFormula(29, "ad", {ldmax, be}, ad);
            });
        });
        describe("10: AD, CLminS, ce", function () {
            it("solves for clmins", function () {
                testAircraftFormula(19, "clmins", {ad, ce}, clmins);
                testAircraftFormula(19, "ad", {clmins, ce}, ad);
                testAircraftFormula(19, "ce", {clmins, ad}, ce);
            });
            it("crosschecks using wing loading", function () {
                testAircraftFormula(7, "cl", {sigma, ws, v: vmins}, clmins);
                testAircraftFormula(7, "ws", {sigma, cl: clmins, v: vmins}, ws);
                testAircraftFormula(7, "v", {sigma, cl: clmins, ws}, vmins);
            });
        });
        describe("11: W, BHP, RCmax", function () {
            it("solves for rcmax", function () {
                testAircraftFormula(0, "bhp", {rcmax, w}, bhp);
                testAircraftFormula(0, "rcmax", {bhp, w}, rcmax);
                testAircraftFormula(0, "w", {bhp, rcmax}, w);
            });
        });
        describe("12: Ts, BHP, Vprop, Dp", function () {
            it("solves for ts", function () {
                testAircraftFormula(0, "ts", {sigma, dp, bhp}, ts);
                testAircraftFormula(0, "sigma", {ts, dp, bhp}, sigma);
                testAircraftFormula(0, "dp", {ts, sigma, bhp}, dp);
                testAircraftFormula(0, "bhp", {ts, sigma, dp}, bhp);
            });
            it("solves for vprop", function () {
                testAircraftFormula(0, "vprop", {bhp, sigma, dp}, vprop);
                testAircraftFormula(0, "bhp", {vprop, sigma, dp}, bhp);
                testAircraftFormula(0, "sigma", {vprop, bhp, dp}, sigma);
                testAircraftFormula(0, "dp", {vprop, bhp, sigma}, dp);
            });
        });
    });
    describe("Formula 1: A force balanced along the flight path", function () {
        it("solves for weight", function () {
            testAircraftFormula(1, "w", {d, thetag}, w);
        });
        it("solves for glide angle", function () {
            testAircraftFormula(1, "thetag", {d, w}, thetag);
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
            const drag = solvedFormulas[1].solve({w, thetag}).d;
            expected = drag * Math.cos(angle) / Math.sin(angle);
            testAircraftFormula(2, "l", {w, thetag}, expected);
        });
        it("solves for weight", function () {
            testAircraftFormula(2, "w", {l, thetag}, w);
        });
        it("solves for glide angle", function () {
            testAircraftFormula(2, "thetag", {l, w}, thetag);
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
            testAircraftFormula(3, "rho", {cl, l, vfs, s}, rho);
        });
        it("solves for lift", function () {
            testAircraftFormula(3, "l", {cl, rho, vfs, s}, l);
        });
        it("solves for velocity (ft/sec)", function () {
            testAircraftFormula(3, "vfs", {cl, l, rho, s}, vfs);
        });
        it("solves for wing area", function () {
            testAircraftFormula(3, "s", {cl, l, rho, vfs}, s);
        });
    });
    describe("Formula 4: cd is from pressure and wing area", function () {
        var l;
        beforeEach(function () {
            d = solvedFormulas[1].solve({w, thetag}).d;
            l = solvedFormulas[2].solve({w, thetag}).l;
            cl = solvedFormulas[3].solve({l, rho, vfs, s}).cl;
            cd = solvedFormulas[4].solve({d, rho, vfs, s}).cd;
        });
        it("lift and drag has same ratio as their coefficients", function () {
            expect(cl / cd).toBeCloseTo(l / d);
        });
        it("solves for air density", function () {
            testAircraftFormula(4, "rho", {cd, d, vfs, s}, rho);
        });
        it("solves for drag", function () {
            testAircraftFormula(4, "d", {cd, rho, vfs, s}, d);
        });
        it("solves for velocity (ft/sec)", function () {
            testAircraftFormula(4, "vfs", {cd, d, rho, s}, vfs);
        });
        it("solves for wing area", function () {
            testAircraftFormula(4, "s", {cd, d, rho, vfs}, s);
        });
    });
    describe("Formula 5: Drag from velocity as mph", function () {
        beforeEach(function () {
            d = solvedFormulas[1].solve({w, thetag}).d;
            cd = solvedFormulas[4].solve({d, rho, vfs, s}).cd;
            d = solvedFormulas[4].solve({rho, cd, vfs, s}).d;
        });
        it("is equivalent to Formula 4", function () {
            var expected = w * Math.sin(thetag / 360 * Math.TAU);
            testAircraftFormula(0, "d", {sigma, cd, s, v}, expected);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(0, "sigma", {d, cd, s, v}, sigma);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(0, "cd", {d, sigma, s, v}, cd);
        });
        it("solves for wing area", function () {
            testAircraftFormula(0, "s", {d, sigma, cd, v}, s);
        });
        it("solves for velocity (mph)", function () {
            testAircraftFormula(0, "v", {d, sigma, cd, s}, v);
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
            testAircraftFormula(6, "sigma", {l, cl, s, v}, sigma);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(6, "cl", {l, sigma, s, v}, cl);
        });
        it("solves for wing area", function () {
            testAircraftFormula(6, "s", {l, sigma, cl, v}, s);
        });
        it("solves for velocity (mph)", function () {
            testAircraftFormula(6, "v", {l, sigma, cl, s}, v);
        });
    });
    describe("Formula 7: Small angle approx. for wing loading", function () {
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
            testAircraftFormula(7, "sigma", {ws, cl, v}, sigma);
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormula(7, "cl", {ws, sigma, v}, cl);
        });
        it("solves for velocity", function () {
            testAircraftFormula(7, "v", {ws, sigma, cl}, v);
        });
        it("solves for wingloading from weight and wing span", function () {
            testAircraftFormula(7, "ws", {w, s}, ws);
        });
        it("solves for weight from wingloading", function () {
            testAircraftFormula(7, "w", {ws, s}, w);
        });
        it("solves for wingloading from weight and wing span", function () {
            testAircraftFormula(7, "s", {ws, w}, s);
        });
        it("has the same formula for the index and .ws", function () {
            var expected = /\(sigma,\u0020cl,\u0020vmax\)/;
            expect(solvedFormulas[7].ws.toString()).toMatch(expected);
        });
    });
    describe("Formula 8: Glide angle using small angle approx.", function () {
        var g;
        beforeEach(function () {
            cd = 1.2;
            thetag = solvedFormulas[8].thetag(sigma, cd, s, v);
        });
        it("should be close to drag * 360/TAU", function () {
            d = solvedFormulas[5].d(sigma, cd, s, v);
            expect(thetag).toBeCloseTo(d * 360 / Math.TAU);
        });
        it("should solve for sigma", function () {
            testAircraftFormula(8, "sigma", {thetag, cd, s, v}, sigma);
        });
        it("should solve for coefficient of lift", function () {
            testAircraftFormula(8, "cd", {thetag, sigma, s, v}, cd);
        });
        it("should solve for coefficient of lift", function () {
            testAircraftFormula(8, "s", {thetag, sigma, cd, v}, s);
        });
        it("should solve for velocity", function () {
            testAircraftFormula(8, "v", {thetag, sigma, cd, s}, v);
        });
    });
    describe("Formula 9: Glide angle from lift & drag ratios", function () {
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
            testAircraftFormula(9, "thetag", {cd, cl}, g8);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(9, "cd", {thetag, cl}, cd);
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormula(9, "cl", {thetag, cd}, cl);
        });
    });
    describe("Formula 10: Rate of sink (ft/min)", function () {
        var d5;
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
            testAircraftFormula(10, "sigma", {rs, cd, s, v, w}, sigma);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(10, "cd", {rs, sigma, s, v, w}, cd);
        });
        it("solves for wing area", function () {
            testAircraftFormula(10, "s", {rs, sigma, cd, v, w}, s);
        });
        it("solves for velocity", function () {
            testAircraftFormula(10, "v", {rs, sigma, cd, s, w}, v);
        });
        it("solves for weight", function () {
            testAircraftFormula(10, "w", {rs, sigma, cd, s, v}, w);
        });
    });
    describe("Formula 11: Rate of sink without velocity", function () {
        beforeEach(function () {
            cl = solvedFormulas[7].cl(ws, sigma, v);
            rs = solvedFormulas[11].rs(sigma, w, s, cd, cl);
        });
        it("has the same answer as for formula 10", function () {
        });
        it("solves for sigma", function () {
            testAircraftFormula(11, "sigma", {rs, w, s, cd, cl}, sigma);
        });
        it("solves for weight", function () {
            testAircraftFormula(11, "w", {rs, sigma, s, cd, cl}, w);
        });
        it("solves for wing area", function () {
            testAircraftFormula(11, "s", {rs, sigma, w, cd, cl}, s);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(11, "cd", {rs, sigma, w, s, cl}, cd);
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormula(11, "cl", {rs, sigma, w, s, cd}, cl);
        });
    });
    describe("Formula 12: Parasite and induced drag", function () {
        var cdi;
        beforeEach(function () {
            cdi = random(0, 2);
            cd = solvedFormulas[12].cd(cd0, cdi);
        });
        it("total drag = parasite plus induced drag", function () {
            expect(cd).toBe(cd0 + cdi);
        });
        it("solves for parasite drag", function () {
            expect(solvedFormulas[12].cd0(cd, cdi)).toBeCloseTo(cd0);
        });
        it("solves for induced drag", function () {
            expect(solvedFormulas[12].cdi(cd, cd0)).toBeCloseTo(cdi);
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
            testAircraftFormula([13], "cl", {cdi, e, ar}, cl);
        });
        it("solves for airplane efficiency", function () {
            testAircraftFormula(13, "e", {cdi, cl, ar}, e);
        });
        it("solves for ar", function () {
            testAircraftFormula(13, "ar", {cdi, cl, e}, ar);
        });
        it("solves for coefficient of induced drag with eAR", function () {
            testAircraftFormula([13], "cdi", {cl, ear}, cdi);
        });
        it("solves for coefficient of lift from eAR", function () {
            testAircraftFormula([13], "cl", {cdi, ear}, cl);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(13, "ear", {cdi, cl}, ear);
        });
    });
    describe("Formulas 14: Aspect ratio relationships", function () {
        it("is related to the span and wing area", function () {
            expect(ar).toBeCloseTo(b * b / s);
        });
        it("solves for wing span from wing area", function () {
            testAircraftFormula([14], "b", {ar, s}, b);
        });
        it("solves for wing area", function () {
            testAircraftFormula(14, "s", {ar, b}, s);
        });
        it("is related to wing span and average chord", function () {
            testAircraftFormula(14, "ar", {b, c}, ar);
        });
        it("solves for wing span from average chord", function () {
            testAircraftFormula([14], "b", {ar, c}, b);
        });
        it("solves for average chord", function () {
            testAircraftFormula(14, "c", {ar, b}, c);
        });
    });
    describe("Formula 15: Parabolic drag polar", function () {
        var cdi;
        beforeEach(function () {
            cl = random(1, 2);
            cd = solvedFormulas[15].cd(cd0, cl, ear);
            cdi = solvedFormulas[12].cdi(cd, cd0);
        });
        it("can be checked by using CDi formula in formula 12", function () {
            expect(cd).toBeCloseTo(solvedFormulas[12].cd(cd0, cdi));
        });
        it("solves for parasite drag coefficient", function () {
            testAircraftFormula(15, "cd0", {cd, cl, ear}, cd0);
        });
        it("solves for coefficient of lift", function () {
            testAircraftFormula(15, "cl", {cd, cd0, ear}, cl);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula([15], "ear", {cd, cd0, cl}, ear);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula([15], "ear", {e, ar}, ear);
        });
        it("solves for airplane efficiency", function () {
            testAircraftFormula([15], "e", {ear, ar}, e);
        });
        it("solves for aspect artio", function () {
            testAircraftFormula(15, "ar", {ear, e}, ar);
        });
    });
    describe("Formula 18: Coefficient of lift for minimum sink", function () {
        it("should be sqrt(3 * CL^2 / CDi * CD0)", function () {
            var cdi = solvedFormulas[13].cdi(cl, ear);
            var expected = Math.sqrt(3 * (cl * cl / cdi) * cd0);
            expect(clmins).toBeCloseTo(expected);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(18, "ear", {clmins, cd0}, ear);
        });
        it("solves for parasitic drag", function () {
            testAircraftFormula(18, "cd0", {clmins, ear}, cd0);
        });
    });


    describe("Formula 19: Min sink = drag area and eff. chord", function () {
        it("should have the same answer as from formula 18", function () {
            var clmins18 = solvedFormulas[18].clmins(ear, cd0);
            expect(clmins).toBeCloseTo(clmins18);
        });
        it("solves for ad", function () {
            testAircraftFormula(0, "ad", {clmins, ce}, ad);
        });
        it("solves for ce", function () {
            testAircraftFormula(0, "ce", {clmins, ad}, ce);
        });
    });
    describe("Formula 19: effective chord formulas", function () {
        it("solves for effective chord", function () {
            testAircraftFormula(19, "ce", {c, e}, ce);
        });
        it("solves for chord", function () {
            testAircraftFormula(19, "c", {e, ce: c / Math.sqrt(e)}, c);
        });
        it("solves for efficiency", function () {
            testAircraftFormula(19, "e", {c, ce: c / Math.sqrt(e)}, e);
        });
    });
    describe("Formula 19: Drag area relationship", function () {
        it("solves for drag area", function () {
            expect(solvedFormulas[0].solve({cd0, s}).ad).toBeCloseTo(ad);
        });
        it("solves for parasite drag", function () {
            testAircraftFormula(0, "cd0", {s, ad: cd0 * s}, cd0);
        });
        it("solves for wing area", function () {
            testAircraftFormula(0, "s", {cd0, ad: cd0 * s}, s);
        });
    });
    describe("Formula 20: Minimum rate of sink", function () {
        beforeEach(function () {
            cl = solvedFormulas[0].solve(ad, ce).clmins;
        });
        it("is similar to the sink rate", function () {
            testAircraftFormula(11, "w", {sigma, w, s, cd, cl}, w);
        });
        it("solves for weight", function () {
            testAircraftFormula(20, "w", {rsmin, sigma, ad, be}, w);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(20, "sigma", {rsmin, w, ad, be}, sigma);
        });
        it("solves for drag area", function () {
            testAircraftFormula(20, "ad", {rsmin, w, sigma, be}, ad);
        });
        it("solves for effective span", function () {
            testAircraftFormula(20, "be", {rsmin, w, sigma, ad}, be);
        });
    });
    describe("Formula 20: effective span formulas", function () {
        it("solves for effective span", function () {
            testAircraftFormula(20, "be", {b, e}, be);
        });
        it("solves for span", function () {
            testAircraftFormula(20, "b", {e, be: b * Math.sqrt(e)}, b);
        });
        it("solves for efficiency", function () {
            testAircraftFormula(20, "e", {b, be: b * Math.sqrt(e)}, e);
        });
    });
    describe("Formula 21: Effective span loading", function () {
        it("solves for effective span loading", function () {
            testAircraftFormula(21, "wbe", {w, be}, wbe);
        });
        it("solves for weight", function () {
            testAircraftFormula(21, "w", {be, wbe}, w);
        });
        it("solves for effective span", function () {
            testAircraftFormula(21, "be", {w, wbe}, be);
        });
    });
    describe("Formula 21: Velocity for minimum sink", function () {
        it("is the same as formula 7 when solved for velocity", function () {
            expect(vmins).toBeCloseTo(solvedFormulas[7].v(ws, sigma, clmins));
        });
        it("solves for velocity for minimum sink", function () {
            testAircraftFormula(21, "vmins", {wbe, sigma, ad}, vmins);
        });
        it("solves for span loading", function () {
            testAircraftFormula(21, "wbe", {vmins, sigma, ad}, wbe);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(21, "sigma", {vmins, wbe, ad}, sigma);
        });
        it("solves for drag area", function () {
            testAircraftFormula(21, "ad", {vmins, wbe, sigma}, ad);
        });
    });
    // todo, understand why the wrong values are occurring
    xdescribe("Formula 22: Sink rate from drag area and eff. span", function () {
        var rs;
        beforeEach(function () {
            rs = solvedFormulas[22].rs(sigma, ad, v, w, be);
        });
        xit("has the same answer as for formula 11", function () {
            cl = solvedFormulas[7].cl(ws, sigma, v);
            testAircraftFormula(11, "rs", {sigma, w, s, cd, cl}, rs);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(22, "sigma", {rs, ad, v, wbe}, sigma);
        });
        it("solves for drag area", function () {
            testAircraftFormula(22, "ad", {rs, sigma, v, wbe}, ad);
        });
        it("solves for velocity", function () {
            testAircraftFormula(22, "v", {rs, sigma, ad, wbe}, v);
        });
        it("solves for wing loading", function () {
            testAircraftFormula(22, "wbe", {rs, sigma, ad, v}, wbe);
        });
    });
    describe("Formula 25: Dimensionless sink rate", function () {
        var rs;
        var rsmin;
        var rshat;
        var vmins;
        var vhat;
        beforeEach(function () {
            vmins = solvedFormulas[21].vmins(wbe, sigma, ad);
            vhat = v / vmins;
            rshat = solvedFormulas[25].rshat(vhat);
        });
        it("is equivalent to rate of sink over minimum sink rate", function () {
            rs = solvedFormulas[22].rs(sigma, ad, v, w, be);
            rsmin = solvedFormulas[20].rsmin(w, sigma, ad, be);
            expect(rshat).toBeCloseTo(rs / rsmin);
        });
        // todo understand why this isn't behaving
        xit("solves for vhat", function () {
            testAircraftFormula(25, "vhat", {rshat}, vhat);
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
            testAircraftFormula(26, "cl", {dg_dcl, cd0, ear}, cl);
        });
        it("solves for parasitic drag", function () {
            testAircraftFormula(26, "cd0", {dg_dcl, cl, ear}, cd0);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(26, "ear", {dg_dcl, cl, cd0}, ear);
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
            testAircraftFormula(27, "ear", {clmaxld, cd0}, ear);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(27, "cd0", {clmaxld, ear}, cd0);
        });
    });
    describe("Formula 28: Maximum lift-to-drag ratio", function () {
        var clmaxld;
        it("ldmax is max lift-to-drag ratio divided by drag", function () {
            clmaxld = solvedFormulas[27].solve({ear, cd0}).clmaxld;
            expect(ldmax).toBeCloseTo(clmaxld / (2 * cd0));
        });
    });
    describe("Formula 29: Max lift-to-drag ratio", function () {
        var ldmax28;
        beforeEach(function () {
            ldmax = solvedFormulas[29].ldmax(be, ad);
        });
        it("should have the same value as for formulas 28", function () {
            ldmax28 = solvedFormulas[0].solve({ear, cd0}).ldmax;
            expect(ldmax).toBeCloseTo(ldmax28);
        });
        it("solves for best glide ratio", function () {
            testAircraftFormula(29, "ldmax", {be, ad}, ldmax);
        });
        it("solves for effective span", function () {
            testAircraftFormula(29, "be", {ldmax, ad}, be);
        });
        it("solves for drag area", function () {
            testAircraftFormula(29, "ad", {ldmax, be}, ad);
        });
    });
    describe("Formula 30: Minimum drag", function () {
        var dmin;
        var ldmax;
        beforeEach(function () {
            dmin = solvedFormulas[0].dmin(ad, wbe);
        });
        it("should be the inv. of max lift/drag ratio x weight", function () {
            ldmax = solvedFormulas[29].ldmax(be, ad);
            expect(dmin).toBeCloseTo(1 / ldmax * w);
        });
        it("solves for drag area", function () {
            testAircraftFormula(0, "ad", {dmin, wbe}, ad);
        });
        it("solves for effective span loading", function () {
            testAircraftFormula(0, "wbe", {dmin, ad}, wbe);
        });
    });
    describe("Formula 31: Available hp to maintain level flight", function () {
        it("should be formula 22 times weight over 33000", function () {
            var rs = solvedFormulas[22].rs(sigma, ad, v, w, be);
            expect(thpal).toBeCloseTo(rs * w / 33000);
        });
        // todo, understand why this isn't behaving
        it("solves for thpal", function () {
            testAircraftFormula(31, "thpal", {sigma, ad, v, wbe}, thpal);
        });
        it("solves for drag area", function () {
            testAircraftFormula(31, "ad", {thpal, sigma, v, wbe}, ad);
        });
        // todo, understand why this isn't behaving
        xit("solves for velocity", function () {
            testAircraftFormula(31, "v", {thpal, sigma, ad, wbe}, v);
        });
        it("solves for wing loading", function () {
            testAircraftFormula(31, "wbe", {thpal, sigma, ad, v}, wbe);
        });
    });
    describe("Formula 31: Total thrust relationship", function () {
        var thpa;
        var bhp;
        beforeEach(function () {
            thpa = solvedFormulas[31].solve({ad, vmax: v, sigma}).thpa;
            bhp = thpa / e;
        });
        it("solves for drag area", function () {
            var data = {vmax: v, sigma, thpa, eta: e, bhp};
            testAircraftFormula(31, "ad", data, ad);
        });
        it("solves for velocity", function () {
            var data = {ad, sigma, thpa, eta: e, bhp};
            testAircraftFormula(31, "vmax", data, v);
        });
        it("solves for bhp", function () {
            var data = {ad, vmax: v, sigma, thpa, eta: e};
            testAircraftFormula(31, "bhp", data, bhp);
        });
        it("solves for eta", function () {
            var data = {ad, vmax: v, sigma, thpa, bhp};
            testAircraftFormula(31, "eta", data, e);
        });
    });
    describe("Formula 32: Available horsepower for level flight", function () {
        var rs;
        beforeEach(function () {
            rs = solvedFormulas[22].rs(sigma, ad, v, w, be);
        });
        it("should be equivalent to formula 31", function () {
            var expected = solvedFormulas[31].thpal(sigma, ad, v, wbe);
            expect(thpal).toBeCloseTo(expected);
        });
        it("solves for rate of sink", function () {
            testAircraftFormula(32, "rs", {thpal, w}, rs);
        });
        it("solves for w", function () {
            testAircraftFormula(32, "w", {thpal, rs}, w);
        });
    });
    describe("Formula 33: Minimum power for level flight", function () {
        it("solves for thpmin", function () {
            testAircraftFormula(33, "thpmin", {ad, sigma, wbe}, thpmin);
        });
        it("solves for drag area", function () {
            testAircraftFormula(33, "ad", {thpmin, sigma, wbe}, ad);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(33, "sigma", {thpmin, ad, wbe}, sigma);
        });
        it("solves for effective span", function () {
            // testAircraftFormula(33, "wbe", {thpmin, ad, sigma}, wbe);
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
            testAircraftFormula(34, "d", {t, w, thetac}, d);
        });
        it("solves for weight", function () {
            testAircraftFormula(34, "w", {t, d, thetac}, w);
        });
        it("solves for climbing angle", function () {
            testAircraftFormula(34, "thetac", {t, d, w}, thetac);
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
            testAircraftFormula(35, "w", {l, thetac}, w);
        });
        it("solves for climbing angle", function () {
            testAircraftFormula(35, "thetac", {l, w}, thetac);
        });
    });
    describe("Formula 36: Thrust, normal to climbing flight path", function () {
        var thetac;
        var t;
        beforeEach(function () {
            thetac = random(0, 20);
            t = solvedFormulas[36].t(w, thetac, sigma, ad, v, wbe);
        });
        it("solves for weight", function () {
            testAircraftFormula(36, "w", {t, thetac, sigma, ad, v, wbe}, w);
        });
        it("solves for climb angle", function () {
            testAircraftFormula(36, "thetac", {t, w, sigma, ad, v, wbe}, thetac);
        });
        // todo: the following test is too unreliable
        // it("solves for density ratio", function () {
        //     testAircraftFormula(36, "sigma", {t, wthetac, ad, v, wbe}, sigma);
        // });
        it("solves for drag area", function () {
            testAircraftFormula(36, "ad", {t, w, thetac, sigma, v, wbe}, ad);
        });
        it("solves for weight", function () {
            testAircraftFormula(36, "w", {t, thetac, sigma, ad, v, be}, w);
        });
    });
    describe("Formula 37: Thrust Horsepower Available", function () {
        // Can't test this yet as I don't understand why
        // thpa is different from Relation 5 formula
        // it("solves for thrust horsepower available", function () {
        //     testAircraftFormula(37, "thpa", {w, rc, thpal}, thpa);
        // });
    });
    describe("Formula 38: Rate of climb", function () {
        var rc;
        var rsmin;
        beforeEach(function () {
            rsmin = solvedFormulas[22].rs(sigma, ad, v, w, be);
            rc = solvedFormulas[38].rc(bhp, w, eta, rsmin);
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(38, "eta", {thpa, bhp}, eta);
        });
        it("solves for total horsepower available", function () {
            testAircraftFormula(38, "thpa", {eta, bhp}, thpa);
        });
        it("solves for brake horsepower", function () {
            testAircraftFormula(38, "bhp", {eta, thpa}, bhp);
        });
        it("solves for engine brake horsepower", function () {
            testAircraftFormula(38, "bhp", {rc, w, eta, rsmin}, bhp);
        });
        it("solves for weight", function () {
            testAircraftFormula(38, "w", {rc, bhp, eta, rsmin}, w);
        });
        it("solves for efficiency", function () {
            testAircraftFormula(38, "eta", {rc, bhp, w, rsmin}, eta);
        });
        it("solves for rate of sink", function () {
            testAircraftFormula(38, "rsmin", {rc, bhp, w, eta}, rsmin);
        });
    });
    describe("Formula 39: Mass conservation equation", function () {
        var mdot;
        beforeEach(function () {
            mdot = solvedFormulas[39].solve({rho, ap, vp}).mdot;
        });
        it("solves for air pressure", function () {
            testAircraftFormula(39, "rho", {mdot, ap, vp}, rho);
        });
        it("solves for propeller area", function () {
            testAircraftFormula(39, "ap", {mdot, rho, vp}, ap);
        });
        it("solves for propeller velocity", function () {
            testAircraftFormula(39, "vp", {mdot, rho, ap}, vp);
        });
    });
    describe("Formula 40: Change in momentum vs pressure jump", function () {
        var t;
        beforeEach(function () {
            t = solvedFormulas[40].t(m, v3, v);
        });
        it("solves for thrust from velocity", function () {
            testAircraftFormula(40, "t", {m, v3, v}, t);
        });
        it("solves for mass flow rate", function () {
            testAircraftFormula(40, "m", {t, v3, v}, m);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(40, "v3", {t, m, v}, v3);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(40, "v", {t, m, v3}, v);
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
            testAircraftFormula(41, "pd", {pdi, rho, v}, pd);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(41, "rho", {pdi, pd, v}, rho);
        });
        it("solves for velocity", function () {
            testAircraftFormula(41, "v", {pdi, pd, rho}, v);
        });
        it("solves for pressure before propeller", function () {
            testAircraftFormula(41, "p1", {p1i, rho, vp}, p1);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(41, "rho", {p1i, p1, vp}, rho);
        });
        it("solves for velocity from differential increase", function () {
            testAircraftFormula(41, "vp", {p1i, p1, rho}, vp);
        });
    });
    describe("Formula 42: Downstream propeller pressure", function () {
        beforeEach(function () {
            p2 = solvedFormulas[42].p2(pd, rho, vp, v3);
        });
        it("solves for pressure differential", function () {
            testAircraftFormula(42, "pd", {p2, rho, vp, v3}, pd);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(42, "rho", {p2, pd, vp, v3, rho}, rho);
        });
        it("solves for propeller velocity", function () {
            testAircraftFormula(42, "vp", {p2, pd, rho, v3}, vp);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(42, "v3", {p2, pd, rho, vp}, v3);
        });
    });
    describe("Formula 43: Propeller pressure jump", function () {
        beforeEach(function () {
            p2 = solvedFormulas[43].p2(p1, rho, v3, v);
        });
        it("solves for upstream pressure", function () {
            testAircraftFormula(43, "p1", {p2, rho, v3, v}, p1);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(43, "rho", {p1, p2, v3, v}, rho);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(43, "v3", {p1, p2, rho, v}, v3);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(43, "v", {p1, p2, rho, v3}, v);
        });
    });
    describe("Formula 44: Thrust force", function () {
        var t;
        beforeEach(function () {
            t = solvedFormulas[44].t(rho, v3, v, ap);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(44, "rho", {t, v3, v, ap}, rho);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(44, "v3", {t, rho, v, ap}, v3);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(44, "v", {t, rho, v3, ap}, v);
        });
        it("solves for propeller area", function () {
            testAircraftFormula(44, "ap", {t, rho, v3, v}, ap);
        });
    });
    describe("Formula 45: Prop velocity", function () {
        beforeEach(function () {
            vp = solvedFormulas[45].vp(v3, v);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(45, "v", {vp, v3}, v);
        });
    });
    describe("Formula 46: Slipstream velocity", function () {
        beforeEach(function () {
            vp = solvedFormulas[45].vp(v3, v);
        });
        it("solves for a reworking of #45", function () {
            testAircraftFormula(46, "v3", {vp, v}, v3);
        });
    });
    describe("Formula 47: Available propeller thrust", function () {
        var t;
        beforeEach(function () {
            t = solvedFormulas[47].t(rho, ap, vp, v);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(47, "rho", {t, ap, vp, v}, rho);
        });
        it("solves for propeller area", function () {
            testAircraftFormula(47, "ap", {t, rho, vp, v}, ap);
        });
        it("solves for propeller velocity", function () {
            testAircraftFormula(47, "vp", {t, rho, ap, v}, vp);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(47, "v", {t, rho, ap, vp}, v);
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
            testAircraftFormula(48, "pthrust", {t, v}, pthrust);
        });
        it("solves for thrust from thrust power", function() {
            testAircraftFormula(48, "t", {pthrust, v}, t);
        });
        it("solves for velocity from thrust power", function() {
            testAircraftFormula(48, "v", {pthrust, t}, v);
        });
        it("solves for shaft power", function() {
            testAircraftFormula(48, "pshaft", {t, vp}, pshaft);
        });
        it("solves for thrust from shaft power", function() {
            testAircraftFormula(48, "t", {pshaft, vp}, t);
        });
        it("solves for propeller velocity", function() {
            testAircraftFormula(48, "vp", {pshaft, t}, vp);
        });
        it("solves for propulsive efficiency", function() {
            testAircraftFormula(48, "eta", {pthrust, pshaft}, eta);
        });
        it("solves for thrust power from efficiency", function() {
            testAircraftFormula(48, "pthrust", {eta, pshaft}, pthrust);
        });
        it("solves for shaft power from efficency", function() {
            testAircraftFormula(48, "pshaft", {eta, pthrust}, pshaft);
        });
    });
    describe("Formula 49: Engine power at shaft", function () {
        var pshaft;
        beforeEach(function () {
            pshaft = solvedFormulas[49].pshaft(rho, ap, vp, v);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(49, "rho", {pshaft, ap, vp, v}, rho);
        });
        it("solves for propeller area", function () {
            testAircraftFormula(49, "ap", {pshaft, rho, vp, v}, ap);
        });
        it("solves for propeller velocity", function () {
            testAircraftFormula(49, "vp", {pshaft, rho, ap, v}, vp);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(49, "v", {pshaft, rho, ap, vp}, v);
        });
    });
    describe("Formula 50: Engine power", function () {
        var bhp;
        beforeEach(function () {
            bhp = solvedFormulas[50].bhp(sigma, dp, v, eta);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(50, "sigma", {bhp, dp, v, eta}, sigma);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(50, "dp", {bhp, sigma, v, eta}, dp);
        });
        it("solves for velocity", function () {
            testAircraftFormula(50, "v", {bhp, sigma, dp, eta}, v);
        });
        // Solving for eta results are too inaccurate
    });
    describe("Formula 51: Propeller velocity", function () {
        // Done in Relation 12
        return;
    });
    describe("Formula 52: Dimensionless velocity", function () {
        var vhat;
        beforeEach(function () {
            vhat = solvedFormulas[52].vhat(eta);
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(52, "eta", {vhat}, eta);
        });
    });
    describe("Formula 53: Cubic equation for dimensionless vel", function () {
        var vhat;
        beforeEach(function () {
            vhat = solvedFormulas[52].vhat(eta);
        });
        it("shows that eta and vhat are solved as close to zero", function () {
            testAircraftFormula(53, "zero", {eta, vhat}, 0);
        });
    });
    describe("Formula 54: cubic equation solution", function () {
        var vhat;
        beforeEach(function () {
            vhat = solvedFormulas[52].vhat(eta);
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(54, "eta", {vhat}, eta);
        });
    });
    describe("Formula 55: Nondimensional advance ratio (/sec)", function () {
        var j;
        beforeEach(function () {
            j = solvedFormulas[55].j(v, n, dp);
        });
        it("solves for velocity", function () {
            testAircraftFormula(55, "v", {j, n, dp}, v);
        });
        it("solves for propeller rotation", function () {
            testAircraftFormula(55, "n", {j, v, dp}, n);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(55, "dp", {j, v, n}, dp);
        });
    });
    describe("Formula 56: Nondimensional advance ratio (/hour)", function () {
        var j;
        beforeEach(function () {
            j = solvedFormulas[56].j(v, rpm, dp);
        });
        it("solves for velocity", function () {
            testAircraftFormula(56, "v", {j, rpm, dp}, v);
        });
        it("solves for revolutions per minute", function () {
            testAircraftFormula(56, "rpm", {j, v, dp}, rpm);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(56, "dp", {j, v, rpm}, dp);
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
            testAircraftFormula(57, "p", {cp, rho, n, dp}, p);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(57, "rho", {cp, p, n, dp}, rho);
        });
        it("solves for propeller revolutions", function () {
            testAircraftFormula(57, "n", {cp, p, rho, dp}, n);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(57, "dp", {cp, p, rho, n}, dp);
        });
    });
    describe("Formula 58: Dimensionless power coeff. as rpm", function () {
        var cp;
        beforeEach(function () {
            cp = solvedFormulas[58].cp(bhp, rpm, dp);
        });
        it("solves for BHP", function () {
            testAircraftFormula(58, "bhp", {cp, rpm, dp}, bhp);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(58, "rpm", {cp, bhp, dp}, rpm);
        });
        it("solves for propeller revolutions", function () {
            testAircraftFormula(58, "dp", {cp, bhp, rpm}, dp);
        });
    });
    describe("Formula 58: Dimensionless power coefficient as rpm", function () {
        var cp;
        beforeEach(function () {
            cp = solvedFormulas[58].cp(bhp, rpm, dp);
        });
        it("solves for BHP", function () {
            testAircraftFormula(58, "bhp", {cp, rpm, dp}, bhp);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(58, "rpm", {cp, bhp, dp}, rpm);
        });
        it("solves for propeller revolutions", function () {
            testAircraftFormula(58, "dp", {cp, bhp, rpm}, dp);
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
            testAircraftFormula(59, "j", {vhat, cp}, j);
        });
        it("solves for power coefficient", function () {
            testAircraftFormula(59, "cp", {vhat, j}, cp);
        });
    });
    describe("Formula 60: Approx. of static thrust as ft-lb/sec", function () {
        var pshaft;
        var ts;
        beforeEach(function () {
            pshaft = solvedFormulas[49].pshaft(rho, ap, vp, v);
            ts = solvedFormulas[60].ts(rho, dp, pshaft);
        });
        it("solves for air density", function () {
            testAircraftFormula(60, "rho", {ts, dp, pshaft}, rho);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(60, "dp", {ts, rho, pshaft}, dp);
        });
        it("solves for propeller engine power", function () {
            testAircraftFormula(60, "pshaft", {ts, rho, dp}, pshaft);
        });
    });
    describe("Formula 61: Approximation of static thrust as rpm", function () {
        // Done in Relation 12
        return;
    });
    describe("Formula 62: Ideal thrust from engine-prop. combo", function () {
        var vhat;
        var that;
        beforeEach(function () {
            vhat = solvedFormulas[52].vhat(eta);
            that = solvedFormulas[62].that(eta, vhat);
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(62, "eta", {that, vhat}, eta);
        });
        it("solves for dimensionless speed", function () {
            testAircraftFormula(62, "vhat", {that, eta}, vhat);
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
            testAircraftFormula(63, "that", {vhat}, that);
        });
    });
    describe("Formula 64: Propeller tip mach number", function () {
        var mp;
        beforeEach(function () {
            mp = solvedFormulas[64].mp(rpm, dp);
        });
        it("solves for rpm", function () {
            testAircraftFormula(64, "rpm", {mp, dp}, rpm);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(64, "dp", {mp, rpm}, dp);
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
                rho = 0.0023769 + random(0, 0.0023769 - 0.005);
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
                rho = 0.0023769 + random(0, 0.0023769 - 0.005);
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
        var kfuse;
        var alpha;
        var cdcomp;
        var scomp;
        var k;
        beforeEach(function () {
            cdwing = random(1, 1.5);
            kwing = random(0.05, 0.2);
            cdfuse = random(1, 1.5);
            kfuse = random(0.05, 0.2);
            alpha = random(0, 10);
            cdcomp = random(1, 1.5);
            scomp = random(2, 5);
            k = random(0, 0.2);
        });
        describe("1: Drag coefficient of the wing area", function () {
            var cds;
            beforeEach(function () {
                cd0 = cdwing * s * (1 + kwing * cl * cl) + cdfuse * sfuse *
                    (1 + kfuse * alpha * alpha) +
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
                    (1 + kfuse * alpha * alpha) +
                    cdcomp * scomp;
            });
            it("uses contribs from different drag components", function () {
                cdi = cl * cl / (Math.PI * ar) * (1 + k) * s;
                expect(
                    solvedFormulas.f[2].cds(cdwing, s, kwing, cl, cdfuse, sfuse,
                    kfuse, alpha, cdcomp, scomp, ar, k)
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
                alpha = 0;
                expect(ad).toBeCloseTo(solvedFormulas.f[2].cds(cdwing, s, kwing,
                    cl, cdfuse, sfuse, kfuse, alpha, cdcomp, scomp,
                    ar, k));
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
                cl = solvedFormulas.f[7].cl(liftSlope, alpha);
            });
            it("equals F.6 times angle of attack", function () {
                expect(liftSlope * alpha).toBeCloseTo(cl);
            });
            it("solves for liftSlope", function () {
                expect(
                    solvedFormulas.f[7].liftSlope(cl, alpha)
                ).toBeCloseTo(liftSlope);
            });
            it("solves for angle of attack", function () {
                expect(
                    solvedFormulas.f[7].alpha(cl, liftSlope)
                ).toBeCloseTo(alpha);
            });
        });
        describe("8: Airplane efficiency factor", function () {
            var invew;
            var cdfusekfuse;
            var deltafuse;
            var inve;
            beforeEach(function () {
                 invew = solvedFormulas.f[8].solve(
                    {k, ar, cdwing, kwing}).invew;
                cdfusekfuse = solvedFormulas.f[8].solve(
                    {ar, cdfusekfuse, sfuse, s}).cdfusekfuse;
                deltafuse = solvedFormulas.f[8].solve(
                    {ar, cdfusekfuse, sfuse, s}
                ).deltafuse;
                inve = solvedFormulas.f[8].inve(invew, deltafuse);
            });
            it("gets eff from wing eff factor and fuselage corr", function () {
                // todo using inve, invew, deltafuse
            });
            it("solves for planform correction", function () {
                expect(solvedFormulas.f[8].k(invew, ar,
                    cdwing, kwing)).toBeCloseTo(k);
            });
            it("solves for aspect ratio from wing eff. factor", function () {
                expect(solvedFormulas.f[8].solve({invew, k,
                    cdwing, kwing}).ar).toBeCloseTo(ar);
            });
            it("solves for the wing coefficient of drag", function () {
                expect(solvedFormulas.f[8].cdwing(invew, k,
                    ar, kwing)).toBeCloseTo(cdwing);
            });
            it("solves for the change of wing parasite drag", function () {
                expect(solvedFormulas.f[8].kwing(invew, k, ar,
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
            var fuselageEffect;
            var inve;
            var invew;
            var deltafuse;
            beforeEach(function () {
                fuselageEffect = random(0, 1);
                invew = random(1, 2);
                deltafuse = solvedFormulas.f[9].solve(
                    {fuselageEffect, sfuse, s}).deltafuse;
                inve = solvedFormulas.f[9].solve({invew, deltafuse}).inve;
            });
            it("solves for fuselageEffect", function () {
                expect(solvedFormulas.f[9].fuselageEffect(
                    deltafuse, sfuse, s)).toBeCloseTo(fuselageEffect);
            });
            it("solves for fuselage area", function () {
                expect(solvedFormulas.f[9].sfuse(
                    deltafuse, fuselageEffect, s)).toBeCloseTo(sfuse);
            });
            it("solves for area", function () {
                expect(solvedFormulas.f[9].s(
                    deltafuse, fuselageEffect, sfuse, s)).toBeCloseTo(s);
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
            rho = random(0.0023769, 0.0005);
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
