/*jslint browser:true */
/*global solvePoly, Solver, aircraftFormulas, aircraftSolver, chart, CONSTANTS
    describe, beforeEach, it, expect */
var formulas = aircraftFormulas(CONSTANTS, solvePoly);
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

    var crafts = {
        t18: {
            vs0: 67,
            clmax: 1.52,
            vmax: 180,
            w: 1506,
            we: 900,
            b: 20 + 10 / 12,
            sfuse: 3 * 3,
            ad: 3,
            bhp: 150,
            dp: 6,
            rpm: 2700
        },
        random: {
            vs0: random(50, 100),
            clmax: random(1, 2),
            vmax: random(80, 120),
            w: random(1000, 2000),
            we: random(500, 1000),
            b: random(10, 30),
            sfuse: random(5, 15),
            ad: random(5, 15),
            bhp: random(100, 300),
            dp: random(4, 10),
            rpm: random(2000, 4000)
        }
    };
    var craftType = "t18";
    var craft = crafts[craftType];
    var rho = window.CONSTANTS.SEALEVEL_DENSITY; // sea-level air density
    var f = CONSTANTS.AVERAGE_SEALEVEL_FAHRENHEIT;
    var r = f + CONSTANTS.FAHRENHEIT_TO_RANKINE;

    // Relation 1: cl, v, w/s
    var vs0 = craft.vs0;
    var clmax = craft.clmax;
    var vmax = craft.vmax;
    var sigma = 1; // sealevel
    var ws = solvedFormulas[7].solve({sigma, clmax, vs0}).ws;
    // Relation 2: s, w/s, w
    var w = craft.w;
    var we = craft.we;
    var wu = solvedFormulas[0].solve({w, we}).wu;
    var s = solvedFormulas[0].solve({w, ws}).s;
    // Relation 3: S, be, eAR, ce
    var b = craft.b;
    var sfuse = craft.sfuse;
    var ar = solvedFormulas[14].solve({b, s}).ar;
    var c = solvedFormulas[0].solve({s, b}).c;
    var e = solvedFormulas.f[8].solve({ar, sfuse, s}).e;
    var ear = solvedFormulas[15].solve({e, ar}).ear;
    var ce = solvedFormulas[19].solve({c, e}).ce;
    var be = solvedFormulas[20].solve({b, e}).be;
    // Relation 4: be, wbe, w
    var wbe = solvedFormulas[21].solve({w, be}).wbe;
    console.table({
        vs0, clmax, ws, vmax,
        w, s,
        b, ar, c, sfuse, e, ear, ce, be,
        wbe
    });
    // Relation 5: ad, vmax, thpa
    var ad = craft.ad;
    var thpa = solvedFormulas[0].solve({ad, vmax}).thpa;
    var cd0 = solvedFormulas[19].solve({ad, s}).cd0;
    // Relation 6: cd0, ad, s
    var v = craft.vs0;
    // var v = random(vs0, vmax);
    var d = solvedFormulas[0].solve({ad, v}).d;
    var cd = solvedFormulas[0].solve({d, sigma, s, v}).cd;
    // Relation 7: AD, VminS, W/be, THPmin, Dmin
    var vmins = solvedFormulas[24].solve({sigma, ad, wbe}).vmins;
    var thpmin = solvedFormulas[33].solve({ad, sigma, wbe}).thpmin;
    var dmin = solvedFormulas[0].solve({ad, wbe}).dmin;
    // Relation 8: RSmin, THPmin, W
    var rsmin = solvedFormulas[0].solve({thpmin, w}).rsmin;
    var rs = solvedFormulas[22].solve({sigma, ad, v, w, be}).rs;
    var bhp = craft.bhp;
    var eta = solvedFormulas[38].solve({thpa, bhp}).eta; // Formula 38
    var rc = solvedFormulas[38].solve({bhp, w, eta, rs}).rc;
    console.table({
        thpa, ad, cd0,
        d, sigma, cd,
        vmins, thpmin, dmin,
        rsmin, rs, bhp, eta, rc
    });
    // Relation 9: AD, be, (L/D)max
    var ldmax = solvedFormulas[28].solve({ear, cd0}).ldmax;
    // Relation 10: AD, CLminS, ce
    var clmins = solvedFormulas[19].solve({ad, ce}).clmins;
    var clmaxld = solvedFormulas[27].solve({clmins}).clmaxld;
    // Relation 11: W, BHP, RCmax
    var rcmax = solvedFormulas[0].solve({bhp, w}).rcmax;
    // Relation 12: Ts, BHP, Vprop, Dp
    var dp = craft.dp;
    var vprop = solvedFormulas[0].solve({bhp, sigma, dp}).vprop;
    var ts = solvedFormulas[0].solve({sigma, dp, bhp}).ts;
    console.table({
        ldmax,
        clmins,
        clmaxld,
        rcmax,
        dp,
        vprop,
        ts
    });
    // Relation 13: Dp, RPM, Mp
    var rpm = craft.rpm;
    var mp = solvedFormulas[64].solve({rpm, dp}).mp;
    console.table({
        rpm, mp
    });
    var thetag = solvedFormulas[1].solve({d, w}).thetag;
    var vfs = solvedFormulas[3].solve({v}).vfs;
    var l = solvedFormulas[2].solve({w, thetag}).l;
    var cl = solvedFormulas[3].solve({l, rho, vfs, s}).cl;
    var vp = solvedFormulas[48].solve({eta, v}).vp;
    var ap = solvedFormulas[39].solve({dp}).ap;
    var mdot = solvedFormulas[39].solve({rho, ap, vp}).mdot;
    var v3 = solvedFormulas[46].solve({vp, v}).v3;
    var a3 = solvedFormulas[39].solve({mdot, rho, v3}).a3;
    var p = solvedFormulas.d[3].solve({rho, r}).p;
    var p1 = solvedFormulas[41].solve({p, rho, vp, v}).p1;
    var n = 60; // Formula 55
    var p2 = solvedFormulas[42].solve({p, rho, vp, v3}).p2;
    var thpal = solvedFormulas[31].solve({sigma, ad, v, wbe}).thpal;
    function testAircraftFormula(index, prop, data, expected) {
        if (expected === undefined) {
            expected = data[prop];
            delete data[prop];
        }
        expect(solvedFormulas[index].solve(data)[prop]).toBeCloseTo(expected);
    }
    describe("TODO", function () {
        describe("Use formulas for **ALL** formula relationships", function () {
            it("");
        });
        describe("remove the need for custom objects from tests", function () {
            it("");
        });
        describe("remove simplified formulas w/out density ratio", function () {
            it("");
        });
        describe("use return instead of assign then return", function () {
            it("");
        });
        describe("move sigma and density to the beginning", function () {
            it("");
        });
        describe("move 5280 / 60 type conversions to the end", function () {
            it("");
        });
        describe("Formula 1: lift, airspeed, and weight", function () {
            it("");
        });
        describe("Formula 6 - what's up with cl", function () {
            it("");
        });
        describe("Formula 10,11 - why doesn't normal rs work?", function () {
            it("");
        });
        describe("Formula 16 - working towards Formula 18", function () {
            it("");
        });
        describe("Formula 17 - working towards Formula 18", function () {
            it("");
        });
        describe("Formula 22 - why do wrong values happen", function () {
            it("");
        });
        describe("Formula 23 - create tests", function () {
            it("");
        });
        describe("Formula 25 - why isn't vtilde behaving?", function () {
            it("");
        });
        describe("Formula 31 - why isn't thpal behaving", function () {
            it("");
        });
        describe("Formula 31 - why isn't velocity behaving", function () {
            it("");
        });
        describe("Formula 33 - fix effective span test", function () {
            it("");
        });
        describe("Formula 36 - unreliable density ratio test", function () {
            it("");
        });
        describe("Formula 37 - Why is Relation 5 thpa different?", function () {
            it("");
        });
        describe("Formula 39 - test mdotFromRhoA3V3 functions", function () {
            it("");
        });
        describe("Appendix D2-D5, D9-D11 - test functions", function () {
            it("");
        });
        describe("Appendix F8 - eff with inve, invew, deltafuse", function () {
            it("");
        });
        describe("Appendix F8 - test kfuse formulas", function () {
            it("");
        });
        describe("What breaks when sigma is not 1?", function () {
            it("");
        });
        describe("What happens when the velocity varies?", function () {
            it("");
        });
        describe("Check formulas for correctness", function () {
            it("");
        });
        describe("Check appendices for correctness", function () {
            it("");
        });
    });
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
            it("solves for useful weight", function () {
                testAircraftFormula(0, "w", {we, wu}, w);
                testAircraftFormula(0, "we", {w, wu}, we);
                testAircraftFormula(0, "wu", {w, we}, wu);
            });
            it("solves lift force from lift coeff. and velocity", function () {
                testAircraftFormula(7, "ws", {sigma, clmax, vs0}, ws);
                testAircraftFormula(7, "sigma", {ws, clmax, vs0}, sigma);
                testAircraftFormula(7, "clmax", {ws, sigma, vs0}, clmax);
                testAircraftFormula(7, "vs0", {ws, sigma, clmax}, vs0);
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
            // source: Long Wings for Short Power pdf
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
            it("solves thpa using efficiency", function () {
                testAircraftFormula(0, "thpa", {bhp, eta}, thpa);
                testAircraftFormula(0, "bhp", {thpa, eta}, bhp);
                testAircraftFormula(0, "eta", {thpa, bhp}, eta);
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
            // Can also use Formula 38 with bhp and eta
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
                testAircraftFormula(7, "clmins", {sigma, ws, vmins}, clmins);
                testAircraftFormula(7, "ws", {sigma, clmins, vmins}, ws);
                testAircraftFormula(7, "vmins", {sigma, clmins, ws}, vmins);
            });
            it("solves for clmaxld", function () {
                testAircraftFormula(27, "clmaxld", {clmins}, clmaxld);
                testAircraftFormula(27, "clmins", {clmaxld}, clmins);
            });
        });
        describe("11: W, BHP, RCmax", function () {
            it("solves for rcmax", function () {
                testAircraftFormula(0, "rcmax", {bhp, w}, rcmax);
                testAircraftFormula(0, "bhp", {rcmax, w}, bhp);
                testAircraftFormula(0, "w", {bhp, rcmax}, w);
            });
            it("solves for clmins", function () {
                testAircraftFormula(7, "clmins", {ws, vmins}, clmins);
                testAircraftFormula(7, "ws", {clmins, vmins}, ws);
                testAircraftFormula(7, "vmins", {ws, clmins}, vmins);
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
            it("idealised thrust matches chart figures", function () {
                const vtilde = v / vprop;
                const that = solvedFormulas[63].solve({vtilde}).that;
                expect(that).toBeCloseTo(chart.thrustRatio.ideal(vtilde));
            });
        });
        describe("13: Dp, RPM, Mp", function () {
            it("solves for Mach number", function () {
                testAircraftFormula(64, "mp", {rpm, dp}, mp);
                testAircraftFormula(64, "rpm", {mp, dp}, rpm);
                testAircraftFormula(64, "dp", {mp, rpm}, dp);
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
        it("is equivalent to drag * cos/sin of the glide angle", function () {
            const angle = thetag * CONSTANTS.RADIANS_TO_DEGREES;
            const drag = solvedFormulas[1].solve({w, thetag}).d;
            const expected = drag * Math.cos(angle) / Math.sin(angle);
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
        it("is lift over dynamic pressure and wing area", function () {
            var dynamicPressure = 0.5 * rho * vfs * vfs;
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
        it("is equivalent to Formula 4", function () {
            var expected = w * Math.sin(thetag / 360 * Math.TAU);
            testAircraftFormula(0, "d", {sigma, cd, s, v}, expected);
        });
        it("solves for drag", function () {
            testAircraftFormula(5, "d", {sigma, cd, s, v}, d);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(5, "sigma", {d, cd, s, v}, sigma);
        });
        it("solves for coefficient of drag", function () {
            testAircraftFormula(5, "cd", {d, sigma, s, v}, cd);
        });
        it("solves for wing area", function () {
            testAircraftFormula(5, "s", {d, sigma, cd, v}, s);
        });
        it("solves for velocity (mph)", function () {
            testAircraftFormula(5, "v", {d, sigma, cd, s}, v);
        });
    });
    describe("Formula 6: Lift from velocity as mph", function () {
        it("is equivalent to Formula 5", function () {
            var expected = w * Math.cos(thetag / 360 * Math.TAU);
            var actual = solvedFormulas[6].solve({sigma, cl, s, v}).l;
            expect(actual).toBeCloseTo(expected);
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
        var cl;
        var ws;
        beforeEach(function () {
            cl = solvedFormulas[6].solve({l: w, sigma, s, v}).cl;
            ws = solvedFormulas[7].solve({sigma, cl, v}).ws;
        });
        it("is close to formula 6 about lift from velocity", function() {
            var liftForce = solvedFormulas[6].solve({sigma, cl, s, v}).l;
            var wingLoading = solvedFormulas[7].solve({sigma, cl, v}).ws;
            expect(wingLoading).toBeCloseTo(liftForce / s);
        });
        it("solves for wing loading", function () {
            testAircraftFormula(7, "ws", {sigma, cl, v}, ws);
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
    });
    describe("Formula 8: Glide angle using small angle approx.", function () {
        var g;
        beforeEach(function () {
            cd = 1.2;
            thetag = solvedFormulas[8].solve({sigma, cd, s, v}).thetag;
        });
        it("should be close to drag * 360/TAU", function () {
            d = solvedFormulas[5].solve({sigma, cd, s, v}).d;
            expect(thetag).toBeCloseTo(d * CONSTANTS.DEGREES_TO_RADIANS);
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
            thetag = solvedFormulas[9].solve({cd, cl}).thetag;
        });
        it("has the same glide angle result as for Formula 8", function () {
            v8 = solvedFormulas[8].solve({thetag, sigma, cd, s}).v;
            g8 = solvedFormulas[8].solve({sigma, cd, s, v: v8}).thetag;
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
        var rs;
        beforeEach(function () {
            thetag = solvedFormulas[8].solve({cd, sigma, s, v}).thetag;
            d5 = solvedFormulas[5].solve({sigma, cd, s, v}).d;
            rs = solvedFormulas[10].solve({sigma, cd, s, v, w}).rs;
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
        var rs;
        beforeEach(function () {
            rs = solvedFormulas[11].solve({sigma, w, s, cd, cl}).rs;
        });
        it("has the same answer as for formula 10", function () {
            return;
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
            cdi = solvedFormulas[12].solve({cd, cd0}).cdi;
        });
        it("total drag = parasite plus induced drag", function () {
            expect(cd).toBe(cd0 + cdi);
        });
        it("solves for parasite drag", function () {
            expect(solvedFormulas[12].solve({cd, cdi}).cd0).toBeCloseTo(cd0);
        });
        it("solves for induced drag", function () {
            expect(solvedFormulas[12].solve({cd, cd0}).cdi).toBeCloseTo(cdi);
        });
    });
    describe("Formula 13: induced drag coeff. from lift coeff.", function () {
        var cdi;
        beforeEach(function () {
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
            cd = solvedFormulas[15].solve({cd0, cl, ear}).cd;
            cdi = solvedFormulas[12].solve({cd, cd0}).cdi;
        });
        it("can be checked by using CDi formula in formula 12", function () {
            expect(cd).toBeCloseTo(solvedFormulas[12].solve({cd0, cdi}).cd);
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
            var cdi = solvedFormulas[13].solve({cl, ear}).cdi;
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
            var clmins18 = solvedFormulas[18].solve({ear, cd0}).clmins;
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
            expect(vmins).toBeCloseTo(
                solvedFormulas[7].solve({ws, sigma, clmins}).vmins);
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
    xdescribe("Formula 22: Sink rate from drag area and eff span", function () {
        it("has the same answer as for formula 11", function () {
            var rs11 = solvedFormulas[11].solve({sigma, w, s, cd, cl}).rs;
            testAircraftFormula(22, "rs", {rs, ad, v, w, be}, rs11);
        });
        // it("solves for density ratio", function () {
        //     testAircraftFormula(22, "sigma", {rs, ad, v, w, be}, sigma);
        // });
        // it("solves for drag area", function () {
        //     testAircraftFormula(22, "ad", {rs, sigma, v, w, be}, ad);
        // });
        // it("solves for velocity", function () {
        //     testAircraftFormula(22, "v", {rs, sigma, ad, w, be}, v);
        // });
        // it("solves for span loading", function () {
        //     testAircraftFormula(22, "w", {rs, sigma, ad, v, be}, w);
        // });
        // it("solves for span loading", function () {
        //     testAircraftFormula(22, "be", {rs, sigma, ad, v, w}, be);
        // });
    });
    describe("Formula 24:", function () {
        it("solves for velocity of minimum sink", function () {
            testAircraftFormula(24, "vmins", {sigma, wbe, ad}, vmins);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(24, "sigma", {vmins, wbe, ad}, sigma);
        });
        it("solves for wing loading", function () {
            testAircraftFormula(24, "wbe", {vmins, sigma, ad}, wbe);
        });
        it("solves for drag area", function () {
            testAircraftFormula(24, "ad", {vmins, sigma, wbe}, ad);
        });
    });
    describe("Formula 25: Dimensionless sink rate", function () {
        var rshat;
        var vtilde;
        beforeEach(function () {
            vtilde = v / vmins;
            rshat = solvedFormulas[25].solve({vtilde}).rshat;
        });
        it("is equivalent to rate of sink over minimum sink rate", function () {
            expect(rshat).toBeCloseTo(rs / rsmin);
        });
        xit("solves for vtilde", function () {
            testAircraftFormula(25, "vtilde", {rshat}, vtilde);
        });
    });
    describe("Formula 26: d/dx glide angle using drag coeff.", function () {
        var dg_dcl;
        beforeEach(function () {
            dg_dcl = solvedFormulas[26].solve({cl, cd0, ear}).dg_dcl;
        });
        it("should be formula 9 d/dx with respect to CL", function () {
            expect(dg_dcl).toBeCloseTo(
                solvedFormulas[9].solve({cd, cl}).thetag / cl);
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
        it("is the same as Formulas 26 for coefficient of lift", function () {
            var dg_dcl26 = solvedFormulas[26].solve({cl, cd0, ear}).dg_dcl;
            var clmaxld26 = Math.sqrt(1 / (-1 / (cl * cl) +
                dg_dcl26 * CONSTANTS.RADIANS_TO_DEGREES / cd0));
            expect(clmaxld26).toBeCloseTo(clmaxld);
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(27, "ear", {clmaxld, cd0}, ear);
        });
        it("solves for zero-lift drag coefficient", function () {
            testAircraftFormula(27, "cd0", {clmaxld, ear}, cd0);
        });
    });
    describe("Formula 28: Maximum lift-to-drag ratio", function () {
        it("solves for max lift-to-drag ratio", function () {
            expect(solvedFormulas[28].solve({ear, cd0}).ldmax).toBeCloseTo(
                clmaxld / (2 * cd0));
        });
        it("solves for effective aspect ratio", function () {
            testAircraftFormula(28, "ear", {ldmax, cd0}, ear);
        });
        it("solves for zero-lift drag coefficient", function () {
            testAircraftFormula(28, "cd0", {ldmax, ear}, cd0);
        });
    });
    describe("Formula 29: Max lift-to-drag ratio", function () {
        var ldmax28;
        beforeEach(function () {
            ldmax = solvedFormulas[29].solve({be, ad}).ldmax;
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
        it("should be the inv. of max lift/drag ratio x weight", function () {
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
            expect(thpal).toBeCloseTo(rs * w / 33000);
        });
        it("solves for thpal", function () {
            testAircraftFormula(31, "thpal", {sigma, ad, v, wbe}, thpal);
        });
        it("solves for drag area", function () {
            testAircraftFormula(31, "ad", {thpal, sigma, v, wbe}, ad);
        });
        xit("solves for velocity", function () {
            testAircraftFormula(31, "v", {thpal, sigma, ad, wbe}, v);
        });
        it("solves for span loading", function () {
            testAircraftFormula(31, "wbe", {thpal, sigma, ad, v}, wbe);
        });
        // from Relation 5, using density ratio
        it("solves for thpa", function () {
            testAircraftFormula(31, "thpa", {sigma, ad, vmax}, thpa);
        });
        it("solves for sigma", function () {
            testAircraftFormula(31, "sigma", {thpa, ad, vmax}, sigma);
        });
        it("solves for ad", function () {
            testAircraftFormula(31, "ad", {thpa, sigma, vmax}, ad);
        });
        it("solves for vmax", function () {
            testAircraftFormula(31, "vmax", {thpa, sigma, ad}, vmax);
        });
    });
    describe("Formula 32: Available horsepower for level flight", function () {
        it("should be equivalent to formula 31", function () {
            var expected = solvedFormulas[31].solve({sigma, ad, v, wbe}).thpal;
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
            return;
        });
    });
    describe("Formula 34: Thrust from a climbing flight", function () {
        var t;
        var thetac;
        beforeEach(function () {
            thetac = random(0, 20);
            t = solvedFormulas[34].solve({d, w, thetac}).t;
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
            l = solvedFormulas[35].solve({w, thetac}).l;
        });
        it("should be the same as for lift from a gliding flight", function () {
            const l2 = solvedFormulas[2].solve({w, thetag: thetac}).l;
            expect(l).toBeCloseTo(l2);
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
            t = solvedFormulas[36].solve({w, thetac, sigma, ad, v, wbe}).t;
        });
        it("solves for thrust", function () {
            testAircraftFormula(36, "t", {w, thetac, sigma, ad, v, wbe}, t);
        });
        it("solves for weight", function () {
            testAircraftFormula(36, "w", {t, thetac, sigma, ad, v, wbe}, w);
        });
        it("solves for climb angle", function () {
            testAircraftFormula(36, "thetac",
                {t, w, sigma, ad, v, wbe}, thetac);
        });
        it("solves for density ratio", function () {
            testAircraftFormula(36, "sigma",
                {t, w, thetac, ad, v, wbe}, sigma);
        });
        xit("solves for density ratio", function () {
            testAircraftFormula(36, "sigma",
                {t, thetac, ad, v, wbe}, sigma);
        });
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
        xit("solves for thrust horsepower available", function () {
            testAircraftFormula(37, "thpa", {w, rc, thpal}, thpa);
        });
    });
    describe("Formula 38: Rate of climb", function () {
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
            testAircraftFormula(38, "rc", {bhp, w, eta, rs}, rc);
        });
        it("solves for engine brake horsepower", function () {
            testAircraftFormula(38, "bhp", {rc, w, eta, rs}, bhp);
        });
        it("solves for weight", function () {
            testAircraftFormula(38, "w", {rc, bhp, eta, rs}, w);
        });
        it("solves for efficiency", function () {
            testAircraftFormula(38, "eta", {rc, bhp, w, rs}, eta);
        });
        it("solves for rate of sink", function () {
            testAircraftFormula(38, "rs", {rc, bhp, w, eta}, rs);
        });
    });
    describe("Formula 39: Mass conservation equation", function () {
        var mdot;
        beforeEach(function () {
            mdot = solvedFormulas[39].solve({rho, ap, vp}).mdot;
        });
        it("solves for propeller area", function () {
            testAircraftFormula(39, "ap", {dp}, ap);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(39, "dp", {ap}, dp);
        });
        it("solves for mass flow rate", function () {
            testAircraftFormula(39, "mdot", {rho, ap, vp}, mdot);
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
            t = solvedFormulas[40].solve({mdot, v3, v}).t;
        });
        it("solves for thrust from velocity", function () {
            testAircraftFormula(40, "t", {mdot, v3, v}, t);
        });
        it("solves for mass flow rate", function () {
            testAircraftFormula(40, "mdot", {t, v3, v}, mdot);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(40, "v3", {t, mdot, v}, v3);
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(40, "v", {t, mdot, v3}, v);
        });
    });
    describe("Formula 41: Upstream propeller pressure increase", function () {
        it("solves for freestream pressure", function () {
            testAircraftFormula(41, "p", {p1, rho, vp, v}, p);
            testAircraftFormula(41, "p1", {p, rho, vp, v}, p1);
            testAircraftFormula(41, "rho", {p, p1, vp, v}, rho);
            testAircraftFormula(41, "vp", {p, p1, rho, v}, vp);
            testAircraftFormula(41, "v", {p, p1, rho, vp}, v);
        });
    });
    describe("Formula 42: Downstream propeller pressure", function () {
        beforeEach(function () {
            p2 = solvedFormulas[42].solve({p, rho, vp, v3}).p2;
        });
        it("solves for pressure distribution", function () {
            testAircraftFormula(42, "p", {p2, rho, vp, v3}, p);
        });
        it("solves for pressure density", function () {
            testAircraftFormula(42, "rho", {p2, p, vp, v3}, rho);
        });
        it("solves for propeller velocity", function () {
            testAircraftFormula(42, "vp", {p2, p, rho, v3}, vp);
        });
        it("solves for slipstream velocity", function () {
            testAircraftFormula(42, "v3", {p2, p, rho, vp}, v3);
        });
    });
    describe("Formula 43: Propeller pressure jump", function () {
        beforeEach(function () {
            p2 = solvedFormulas[43].solve({p1, rho, v3, v}).p2;
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
            t = solvedFormulas[44].solve({rho, v3, v, ap}).t;
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
            vp = solvedFormulas[45].solve({v3, v}).vp;
        });
        it("solves for freestream velocity", function () {
            testAircraftFormula(45, "v", {vp, v3}, v);
        });
    });
    describe("Formula 46: Slipstream velocity", function () {
        beforeEach(function () {
            vp = solvedFormulas[45].solve({v3, v}).vp;
        });
        it("solves for a reworking of #45", function () {
            testAircraftFormula(46, "v3", {vp, v}, v3);
        });
    });
    describe("Formula 47: Available propeller thrust", function () {
        var t;
        beforeEach(function () {
            t = solvedFormulas[47].solve({rho, ap, vp, v}).t;
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
            t = solvedFormulas[47].solve({rho, ap, vp, v}).t;
            pthrust = t * v;
            pshaft = solvedFormulas[49].solve({rho, ap, vp, v}).pshaft;
            eta = pthrust / pshaft;
        });
        it("solves for thrust power", function() {
            testAircraftFormula(48, "pthrust", {t, v}, pthrust);
            testAircraftFormula(48, "t", {pthrust, v}, t);
            testAircraftFormula(48, "v", {pthrust, t}, v);
        });
        it("solves for shaft power", function() {
            testAircraftFormula(48, "pshaft", {t, vp}, pshaft);
            testAircraftFormula(48, "t", {pshaft, vp}, t);
            testAircraftFormula(48, "vp", {pshaft, t}, vp);
        });
        it("solves for efficiency from pthrust, pshaft", function() {
            testAircraftFormula(48, "eta", {pthrust, pshaft}, eta);
            testAircraftFormula(48, "pthrust", {eta, pshaft}, pthrust);
            testAircraftFormula(48, "pshaft", {eta, pthrust}, pshaft);
        });
        it("solves for efficiency from t, v, vp", function() {
            testAircraftFormula(48, "eta", {t, v, vp}, eta);
            testAircraftFormula(48, "v", {eta, t, vp}, v);
            testAircraftFormula(48, "vp", {eta, t, v}, vp);
        });
        it("solves for efficency from v, vp", function() {
            testAircraftFormula(48, "eta", {v, vp}, eta);
            testAircraftFormula(48, "v", {eta, vp}, v);
            testAircraftFormula(48, "vp", {eta, v}, vp);
        });
    });
    describe("Formula 49: Engine power at shaft", function () {
        var pshaft;
        beforeEach(function () {
            pshaft = solvedFormulas[49].solve({rho, ap, vp, v}).pshaft;
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
            bhp = solvedFormulas[50].solve({sigma, dp, v, eta}).bhp;
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
        var vtilde;
        beforeEach(function () {
            vtilde = solvedFormulas[52].solve({eta}).vtilde;
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(52, "eta", {vtilde}, eta);
        });
    });
    describe("Formula 53: Cubic equation for dimensionless vel", function () {
        var vtilde;
        beforeEach(function () {
            vtilde = solvedFormulas[52].solve({eta}).vtilde;
        });
        it("eta and vtilde are solved as close to zero", function () {
            testAircraftFormula(53, "zero", {eta, vtilde}, 0);
        });
    });
    describe("Formula 54: cubic equation solution", function () {
        var vtilde;
        beforeEach(function () {
            vtilde = solvedFormulas[52].solve({eta}).vtilde;
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(54, "eta", {vtilde}, eta);
        });
    });
    describe("Formula 55: Nondimensional advance ratio (/sec)", function () {
        var j;
        beforeEach(function () {
            j = solvedFormulas[55].solve({v, n, dp}).j;
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
            j = solvedFormulas[56].solve({v, rpm, dp}).j;
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
            p = solvedFormulas[49].solve({rho, ap, vp, v}).pshaft;
            cp = solvedFormulas[57].solve({p, rho, n, dp}).cp;
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
            cp = solvedFormulas[58].solve({bhp, rpm, dp}).cp;
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
            cp = solvedFormulas[58].solve({bhp, rpm, dp}).cp;
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
        var vtilde;
        beforeEach(function () {
            j = solvedFormulas[56].solve({v, rpm, dp}).j;
            cp = solvedFormulas[58].solve({bhp, rpm, dp}).cp;
            vtilde = solvedFormulas[59].solve({j, cp}).vtilde;
        });
        it("solves for nondimensional advance ratio", function () {
            testAircraftFormula(59, "j", {vtilde, cp}, j);
        });
        it("solves for power coefficient", function () {
            testAircraftFormula(59, "cp", {vtilde, j}, cp);
        });
    });
    describe("Formula 60: Approx. of static thrust as ft-lb/sec", function () {
        var pshaft;
        var ts;
        beforeEach(function () {
            pshaft = solvedFormulas[49].solve({rho, ap, vp, v}).pshaft;
            ts = solvedFormulas[60].solve({rho, dp, pshaft}).ts;
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
        var vtilde;
        var that;
        beforeEach(function () {
            vtilde = solvedFormulas[52].solve({eta}).vtilde;
            that = solvedFormulas[62].solve({eta, vtilde}).that;
        });
        it("solves for propeller efficiency", function () {
            testAircraftFormula(62, "eta", {that, vtilde}, eta);
        });
        it("solves for dimensionless speed", function () {
            testAircraftFormula(62, "vtilde", {that, eta}, vtilde);
        });
    });
    describe("Formula 63: Thrust ratio from dimensionless vel.", function () {
        var vtilde;
        var that;
        beforeEach(function () {
            vtilde = solvedFormulas[52].solve({eta}).vtilde;
            that = solvedFormulas[62].solve({eta, vtilde}).that;
        });
        it("solves for ideal thrust ratio", function () {
            testAircraftFormula(63, "that", {vtilde}, that);
        });
    });
    describe("Formula 64: Propeller tip mach number", function () {
        it("solves for rpm", function () {
            testAircraftFormula(64, "rpm", {mp, dp}, rpm);
        });
        it("solves for propeller diameter", function () {
            testAircraftFormula(64, "dp", {mp, rpm}, dp);
        });
    });
    describe("Appendix D", function () {
        function convertToRankine(f) {
            return f + 460;
        }
        describe("1: differential form for vertical momentum", function () {
            // dp/dh = -ρg
            var dh;
            var g;
            beforeEach(function () {
                dh = random(1, 100);
                var airDensity = CONSTANTS.SEALEVEL_DENSITY;
                rho = airDensity + random(0, airDensity - 0.005);
                g = CONSTANTS.G; // ft/sec^2
                dp = -rho * g * dh;
            });
            it("solves for dp", function () {
                expect(solvedFormulas.d[1].solve({rho, dh}).dp).toBeCloseTo(dp);
            });
            it("solves for dh", function () {
                expect(solvedFormulas.d[1].solve({dp, rho}).dh).toBeCloseTo(dh);
            });
            it("solves for rho", function () {
                expect(solvedFormulas.d[1].solve(
                    {dp, dh}).rho).toBeCloseTo(rho);
            });
        });
        describe("D.1: differential form for vertical momentum", function () {
            // dp/dh = -ρg
            var dh;
            var g;
            beforeEach(function () {
                dh = random(1, 100);
                var airDensity = CONSTANTS.SEALEVEL_DENSITY;
                rho = airDensity + random(0, airDensity - 0.005);
                g = CONSTANTS.G; // ft/sec^2
                dp = -rho * g * dh;
            });
            it("solves for dp", function () {
                expect(solvedFormulas.d[1].solve({rho, dh}).dp).toBeCloseTo(dp);
            });
        });
        describe("D.2: ", function () {
            return;
        });
        describe("D.3: ", function () {
            return;
        });
        describe("D.4: ", function () {
            return;
        });
        describe("D.5: ", function () {
            return;
        });
        describe("D.6: Density pressure in Isothermal atmo.", function () {
            var p0;
            var h;
            var t0;
            var p;
            beforeEach(function () {
                p0 = 1 - Math.random() / 10;
                h = Math.random() * 1000;
                t0 = Math.random() * 50 * 460; // rankine
                p = solvedFormulas.d[6].solve({p0, h, t0}).p;
            });
            it("solves for height", function () {
                expect(solvedFormulas.d[6].solve(
                    {p, p0, t0, h}).h).toBeCloseTo(h);
            });
            it("solves for constant temperature", function () {
                expect(solvedFormulas.d[6].solve(
                    {p, p0, h, t0}).t0).toBeCloseTo(t0);
            });
        });
        describe("D.7: Density ratio in Isothermal atmosphere", function () {
            var h;
            var t0;
            beforeEach(function () {
                h = Math.random() * 1000;
                t0 = convertToRankine(Math.random() * 50);
                sigma = solvedFormulas.d[7].sigma(h, t0);
            });
            it("solves for height", function () {
                expect(solvedFormulas.d[7].solve({sigma, t0}).h).toBeCloseTo(h);
            });
            it("solves for constant temperature", function () {
                expect(solvedFormulas.d[7].solve(
                    {sigma, h, t0}).t0).toBeCloseTo(t0);
            });
        });
        describe("D.8: Density ratio in characteristic atmo.", function () {
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
                expect(solvedFormulas.d[8].solve({sigma, h0}).h).toBeCloseTo(h);
            });
            it("it solves for characteristic altitude", function () {
                expect(solvedFormulas.d[8].solve(
                    {sigma, h}).h0).toBeCloseTo(h0);
            });
        });
        describe("D.9: ", function () {
            return;
        });
        describe("D.10: ", function () {
            return;
        });
        describe("D.11: ", function () {
            return;
        });
        describe("D.12: Variation of density ratio", function () {
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
                expect(solvedFormulas.d[12].solve({sigma, f}).h).toBeCloseTo(h);
            });
            it("solves for temperature", function () {
                expect(solvedFormulas.d[12].solve({sigma, h}).f).toBeCloseTo(f);
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
    // Test Appendix F formulas
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
        describe("F.1: Drag coefficient of the wing area", function () {
            var cds;
            beforeEach(function () {
                cd0 = cdwing * s * (1 + kwing * cl * cl) + cdfuse * sfuse *
                    (1 + kfuse * alpha * alpha) +
                    cdcomp + scomp;
                cds = solvedFormulas.f[1].solve({cd0, cl, ear, s}).cds;
            });
            it("is the drag coeff. with induced drag across wing", function () {
                expect(solvedFormulas[15].solve(
                    {cd0, cl, ear}).cd * s).toBe(cds);
            });
            it("solves for coefficient of drag", function () {
                expect(
                    solvedFormulas.f[1].solve({cds, cl, ear, s}).cd0
                ).toBeCloseTo(cd0);
            });
            it("solves for coefficient of lift", function () {
                expect(
                    solvedFormulas.f[1].solve({cds, cd0, ear, s}).cl
                ).toBeCloseTo(cl);
            });
            it("solves for effective aspect ratio", function () {
                expect(
                    solvedFormulas.f[1].solve({cds, cd0, cl, s}).ear
                ).toBeCloseTo(ear);
            });
            it("solves for wing span", function () {
                expect(
                    solvedFormulas.f[1].s(cds, cd0, cl, ear)
                ).toBeCloseTo(s);
            });
        });
        describe("F.2: Drag coefficient from separate components", function () {
            var cdi;
            beforeEach(function () {
                cd0 = cdwing * s * (1 + kwing * cl * cl) + cdfuse * sfuse *
                    (1 + kfuse * alpha * alpha) +
                    cdcomp * scomp;
            });
            it("uses contribs from different drag components", function () {
                cdi = cl * cl / (Math.PI * ar) * (1 + k) * s;
                expect(
                    solvedFormulas.f[2].solve({cdwing, s, kwing, cl, cdfuse,
                    sfuse, kfuse, alpha, cdcomp, scomp, ar, k}).cds
                ).toBeCloseTo(cd0 + cdi);
            });
        });
        describe("F.5: Drag area from separate components", function () {
            beforeEach(function () {
                ad = solvedFormulas.f[5].solve({cdwing, s, cdfuse, sfuse,
                    cdcomp, scomp}).ad;
            });
            it("is the same as F.2 at zero lift conditions", function () {
                var cl = 0;
                var alpha = 0;
                expect(ad).toBeCloseTo(solvedFormulas.f[2].solve({cdwing, s,
                    kwing, cl, cdfuse, sfuse, kfuse, alpha, cdcomp, scomp,
                    ar, k}).cds);
            });
        });
        describe("F.6: Lift slope", function () {
            var liftSlope;
            beforeEach(function () {
                liftSlope = solvedFormulas.f[6].solve({ar}).liftSlope;
            });
            it("solves for aspect ratio", function () {
                expect(solvedFormulas.f[6].solve(
                    {liftSlope}).ar).toBeCloseTo(ar);
            });
        });
        describe("F.7: Linear approximation of coeff. of lift", function () {
            var liftSlope;
            var cl;
            beforeEach(function () {
                liftSlope = solvedFormulas.f[6].solve({ar}).liftSlope;
                cl = solvedFormulas.f[7].solve({liftSlope, alpha}).cl;
            });
            it("equals F.6 times angle of attack", function () {
                expect(liftSlope * alpha).toBeCloseTo(cl);
            });
            it("solves for liftSlope", function () {
                expect(
                    solvedFormulas.f[7].solve({cl, alpha}).liftSlope
                ).toBeCloseTo(liftSlope);
            });
            it("solves for angle of attack", function () {
                expect(
                    solvedFormulas.f[7].solve({cl, liftSlope}).alpha
                ).toBeCloseTo(alpha);
            });
        });
        describe("F.8: Airplane efficiency factor", function () {
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
                inve = solvedFormulas.f[8].solve({invew, deltafuse}).inve;
            });
            it("gets eff from wing eff factor and fuselage corr", function () {
                return;
            });
            it("solves for planform correction", function () {
                expect(solvedFormulas.f[8].solve({invew, ar,
                    cdwing, kwing}).k).toBeCloseTo(k);
            });
            it("solves for aspect ratio from wing eff. factor", function () {
                expect(solvedFormulas.f[8].solve({invew, k,
                    cdwing, kwing}).ar).toBeCloseTo(ar);
            });
            it("solves for the wing coefficient of drag", function () {
                expect(solvedFormulas.f[8].solve({invew, k,
                    ar, kwing}).cdwing).toBeCloseTo(cdwing);
            });
            it("solves for the change of wing parasite drag", function () {
                expect(solvedFormulas.f[8].solve({invew, k, ar,
                    cdwing}).kwing).toBeCloseTo(kwing);
            });
            // we need kfuse for these tests
            it("solves for aspect ratio from fuselage corr.", function () {
                return;
            });
            it("solves for fuselage coefficient of drag", function () {
                // expect(solvedFormulas.f[8].solve({deltafuse, ar,
                //     kfuse, sfuse, s}).cdfuse).toBeCloseTo(cdfuse);
                return;
            });
            it("solves for change of fuselage parasite drag", function () {
                // expect(solvedFormulas.f[8].solve({deltafuse, ar,
                //     cdfuse, sfuse, s, kfuse}).kfuse).toBeCloseTo(kfuse);
                return;
            });
            it("solves for fuselage area", function () {
                // expect(solvedFormulas.f[8].sfuse(deltafuse, ar,
                //     cdfuse, kfuse, s, sfuse)).toBeCloseTo(sfuse);
                return;
            });
            it("solves for wing area", function () {
                // expect(solvedFormulas.f[8].s(deltafuse, ar,
                //     cdfuse, kfuse, sfuse, s)).toBeCloseTo(s);
                return;
            });
            it("solves for wing efficiency", function () {
                expect(solvedFormulas.f[8].solve(
                    {inve, deltafuse}).invew).toBeCloseTo(invew);
            });
            it("solves for fuselage efficiency", function () {
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
                expect(solvedFormulas.f[9].solve({
                    deltafuse, sfuse, s}
                ).fuselageEffect).toBeCloseTo(fuselageEffect);
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
                expect(solvedFormulas.f[9].solve(
                    {inve: 1 / e}).e).toBeCloseTo(e);
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
                    //     expect(solvedFormulas.f[9].solve({
                    //         1, value.x, 1}).ewgd).toBeCloseTo(value.y);
                    // });
                });
                it("works out ground effect on wing efficiency", function () {
                    kgd = solvedFormulas.f[9].solve({h, b}).kgd;
                    ewgd = solvedFormulas.f[9].solve({ew, kgd}).ewgd;
                    expect(ewgd).toBeCloseTo(ew * kgd);
                });
            });
        });
    });
    xdescribe("G: Drag analysis", function () {
        describe("G.1: Drag area", function () {
            var cdf;
            var af;
            var cdw;
            var sw;
            beforeEach(function () {
                cdf = random(0.01, 0.10);
                af = random(1, 5);
                cdw = random(0.001, 0.010);
                sw = random(10, 50);
                ad = solvedFormulas.g[1].solve({cdf, af, cdw, sw}).ad;
            });
            it("solves for pressure drag coefficient", function () {
                expect(solvedFormulas.g[1].solve({
                    ad, af, cdw, sw}).cdf).toBeCloseTo(cdf);
            });
            it("solves for frontal area", function () {
                expect(solvedFormulas.g[1].solve({
                    ad, cdf, cdw, sw}).af).toBeCloseTo(af);
            });
            it("solves for skin drag coefficient", function () {
                expect(solvedFormulas.g[1].solve({
                    ad, cdf, af, sw}).cdw).toBeCloseTo(cdw);
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
            var airDensity = CONSTANTS.SEALEVEL_DENSITY;
            rho = airDensity + random(0, airDensity - 0.005);
            r = random(390, 518);
            p = solvedFormulas.j[1].solve({rho, r}).p;
        });
        it("solves for rho", function () {
            expect(solvedFormulas.j[1].solve({p, r}).rho).toBeCloseTo(rho);
        });
        it("solves for rankine", function () {
            expect(solvedFormulas.j[1].solve({p, rho}).r).toBeCloseTo(r);
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
