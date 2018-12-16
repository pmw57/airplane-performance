/*jslint browser:true */
/*globals solvePoly, Solver, aircraftFormulas, aircraftSolver, describe, describe, beforeEach, it, xit, expect */
var formulas = aircraftFormulas(window.CONSTANTS, solvePoly),
    aircraftFormulas = aircraftSolver(Solver, formulas);

/* TODO: Assumptions
s = b * c
ear = e * ar
ce = c / Math.sqrt(e)
eta = thpa / bhp
*/
(function () {
    'use strict';
    var random = function (low, high) {
            return Math.random() * (high - low) + low;
        },
        smaller = function (num) {
            return num * (1 - Math.random() / 5);
        },
        larger = function (num) {
            return num * (1 + Math.random() / 5);
        },
        w = random(500, 2000),
        thetag = random(1, 20),
        e = random(0.8, 1),
        b = random(20, 40),
        c = random(3, 7),
        s = b * c,
        ar = b / c,
        ear = e * ar,
        ce = c / Math.sqrt(e),
        be = b * Math.sqrt(e),
        cd0 = random(0, 2),
        ad = cd0 * s,
        rho = 0.002377,
        m = 970,
        v = random(50, 100),
        vfs = v * 5280 / 3600,
        v3 = larger(v),
        pd = larger(v),
        p1 = smaller(pd),
        p2 = smaller(pd),
        vp = larger(v),
        dp = 6,
        ap = Math.TAU * (dp / 2),
        eta = smaller(1),
        sigma = 1,
        rpm = 2700,
        n = 60,
        bhp = 150,
        cl = random(1, 2);
    function testAircraftFormula(index, prop, args, expected) {
        expect(aircraftFormulas[index][prop].apply(this, args)).toBeCloseTo(expected);
    }
    function testAircraftFormulaSolve(index, prop, data, expected) {
        if (!expected) {
            expected = data[prop];
            delete data[prop];
        }
        expect(aircraftFormulas[index].solve(data)[prop]).toBeCloseTo(expected);
    }
    describe('Formulas are provided as an aircraftFormulas object', function () {
        // beforeEach(function () {
        //     aircraftFormulas = aircraftSolver(Solver, formulas);
        // });
        it('has an object called aircraftFormulas', function () {
            expect(aircraftFormulas).toBeDefined();
        });
        it('is an array of formulas that has a length', function () {
            expect(aircraftFormulas.length).toBeGreaterThan(0);
        });
        it('has a dummy function on the 0th index,', function () {
            expect(aircraftFormulas[0].prototype.constructor.name).toBe('dummyFunc');
        });
        it('has a solve method on its array items', function () {
            expect(aircraftFormulas[1].solve).toBeDefined();
        });
        it('is accessible as an object property', function () {
            expect(typeof aircraftFormulas[1].d).toBe('function');
        });
        it('has a formula object to contain other solutions, called all', function () {
            expect(aircraftFormulas[1].all[0]).toBeDefined();
        });
        it('has an overall formulas object to contain all solutions', function () {
            expect(aircraftFormulas.all).toBeDefined();
        });
        describe('overall solver', function () {
            it('is defined', function () {
                expect(aircraftFormulas.all.solve).toBeDefined();
            });
            it('is an array', function () {
                expect(typeof aircraftFormulas.all.solve).toBe('function');
            });
        });
    });
    describe('Formula 1: A force balanced along the flight path', function () {
        var d;
        beforeEach(function () {
            d = aircraftFormulas[1].d(w, thetag);
        });
        it('solves for weight', function () {
            testAircraftFormula(1, 'w', [d, thetag], w);
        });
        it('solves for glide angle', function () {
            testAircraftFormula(1, 'thetag', [d, w], thetag);
        });
    });
    describe('Formula 2: Lift is a similar normal to the flight path', function () {
        var l, angle, expected;
        beforeEach(function () {
            l = aircraftFormulas[2].l(w, thetag);
        });
        it('is equivalent to drag times cos/sin of the glide angle', function () {
            angle = thetag * Math.TAU / 360;
            expected = aircraftFormulas[1].d(w, thetag) * Math.cos(angle) / Math.sin(angle);
            testAircraftFormula(2, 'l', [w, thetag], expected);
        });
        it('solves for weight', function () {
            testAircraftFormula(2, 'w', [l, thetag], w);
        });
        it('solves for glide angle', function () {
            testAircraftFormula(2, 'thetag', [l, w], thetag);
        });
    });
    describe('Formula 3: Coefficient of lift from dynamic pressure and wing area', function () {
        var dynamicPressure, l;
        beforeEach(function () {
            dynamicPressure = 0.5 * rho * vfs * vfs;
            l = aircraftFormulas[2].l(w, thetag);
            cl = aircraftFormulas[3].cl(l, rho, vfs, s);
        });
        it('is lift over dynamic pressure and wing area', function () {
            expect(cl).toBe(l / (dynamicPressure * s));
        });
        it('solves for air density', function () {
            testAircraftFormula(3, 'rho', [cl, l, vfs, s], rho);
        });
        it('solves for lift', function () {
            testAircraftFormula(3, 'l', [cl, rho, vfs, s], l);
        });
        it('solves for velocity (ft/sec)', function () {
            testAircraftFormulaSolve(3, 'vfs', {cl: cl, l: l, rho: rho, s: s}, vfs);
        });
        it('solves for wing area', function () {
            testAircraftFormula(3, 's', [cl, l, rho, vfs], s);
        });
    });
    describe('Formula 4: Coefficient of drag is from dynamic pressure and wing area', function () {
        var d, l, cd;
        beforeEach(function () {
            d = aircraftFormulas[1].d(w, thetag);
            l = aircraftFormulas[2].l(w, thetag);
            cl = aircraftFormulas[3].cl(l, rho, vfs, s);
            cd = aircraftFormulas[4].cd(d, rho, vfs, s);
        });
        it('has the same ratio between lift and drag, as for their coefficients', function () {
            expect(cl / cd).toBeCloseTo(l / d);
        });
        it('solves for air density', function () {
            testAircraftFormula(4, 'rho', [cd, d, vfs, s], rho);
        });
        it('solves for drag', function () {
            testAircraftFormula(4, 'd', [cd, rho, vfs, s], d);
        });
        it('solves for velocity (ft/sec)', function () {
            testAircraftFormula(4, 'vfs', [cd, d, rho, s], vfs);
        });
        it('solves for wing area', function () {
            testAircraftFormula(4, 's', [cd, d, rho, vfs], s);
        });
    });
    describe('Formula 5: Drag from velocity as mph using density ratio', function () {
        var d, cd;
        beforeEach(function () {
            d = aircraftFormulas[1].d(w, thetag);
            cd = aircraftFormulas[4].cd(d, rho, vfs, s);
            d = aircraftFormulas[4].d(rho, cd, vfs, s);
        });
        it('is equivalent to Formula 4', function () {
            expect(aircraftFormulas[5].d(sigma, cd, s, v)).toBeCloseTo(w * Math.sin(thetag / 360 * Math.TAU));
        });
        it('solves for density ratio', function () {
            testAircraftFormula(5, 'sigma', [d, cd, s, v], sigma);
        });
        it('solves for coefficient of drag', function () {
            testAircraftFormula(5, 'cd', [d, sigma, s, v], cd);
        });
        it('solves for wing area', function () {
            testAircraftFormula(5, 's', [d, sigma, cd, v], s);
        });
        it('solves for velocity (mph)', function () {
            testAircraftFormula(5, 'v', [d, sigma, cd, s], v);
        });
    });
    describe('Formula 6: Lift from velocity as mph using density ratio', function () {
        var l, cl;
        beforeEach(function () {
            l = aircraftFormulas[2].l(w, thetag);
            cl = aircraftFormulas[3].cl(l, rho, vfs, s);
            l = aircraftFormulas[3].l(rho, cl, vfs, s);
        });
        it('is equivalent to Formula 5', function () {
            expect(aircraftFormulas[6].l(sigma, cl, s, v)).toBeCloseTo(w * Math.cos(thetag / 360 * Math.TAU));
        });
        it('solves for density ratio', function () {
            testAircraftFormula(6, 'sigma', [l, cl, s, v], sigma);
        });
        it('solves for coefficient of drag', function () {
            testAircraftFormula(6, 'cl', [l, sigma, s, v], cl);
        });
        it('solves for wing area', function () {
            testAircraftFormula(6, 's', [l, sigma, cl, v], s);
        });
        it('solves for velocity (mph)', function () {
            testAircraftFormula(6, 'v', [l, sigma, cl, s], v);
        });
    });
    describe('Formula 7: Using the small angle approximation to get wing loading', function () {
        var cl, ws;
        beforeEach(function () {
            cl = aircraftFormulas[6].cl(w, sigma, s, v);
            ws = aircraftFormulas[7].solve({sigma: sigma, cl: cl, v: v}).ws;
        });
        xit('should be close to formula 6 about lift from velocity as mph', function () {
            // todo
        });
        it('solves for density ratio', function () {
            testAircraftFormula(7, 'sigma', [ws, cl, v], sigma);
        });
        it('solves for coefficient of lift', function () {
            testAircraftFormula(7, 'cl', [ws, sigma, v], cl);
        });
        it('solves for velocity', function () {
            testAircraftFormula(7, 'v', [ws, sigma, cl], v);
        });
        it('solves for wingloading from weight and wing span', function () {
            testAircraftFormulaSolve(7, 'ws', {w: w, s: s}, ws);
        });
        it('solves for weight from wingloading', function () {
            testAircraftFormula(7, 'w', [ws, s], w);
        });
        it('solves for wingloading from weight and wing span', function () {
            testAircraftFormula(7, 's', [ws, w], s);
        });
        it('has the same formula for the index and .ws property references', function () {
            expect(aircraftFormulas[7].ws.toString()).toMatch(/\(sigma, cl, v\)/);
        });
    });
    describe('Formula 8: Glide angle using small angle approximation', function () {
        var cd, d, g;
        beforeEach(function () {
            cd = 1.2;
            g = aircraftFormulas[8].thetag(sigma, cd, s, v);
        });
        it('should be close to drag * 360/TAU', function () {
            d = aircraftFormulas[5].d(sigma, cd, s, v);
            expect(g).toBeCloseTo(d * 360 / Math.TAU);
        });
        it('should solve for sigma', function () {
            testAircraftFormula(8, 'sigma', [g, cd, s, v], sigma);
        });
        it('should solve for coefficient of lift', function () {
            testAircraftFormula(8, 'cd', [g, sigma, s, v], cd);
        });
        it('should solve for coefficient of lift', function () {
            testAircraftFormula(8, 's', [g, sigma, cd, v], s);
        });
        it('should solve for velocity', function () {
            testAircraftFormula(8, 'v', [g, sigma, cd, s], v);
        });
    });
    describe('Formula 9: Glide angle from lift & drag coefficient ratios', function () {
        var cd, cl, v8, g8;
        beforeEach(function () {
            cd = random(0.05, 2);
            cl = random(0.05, 2);
            thetag = aircraftFormulas[9].thetag(cd, cl);
        });
        it('has the same glide angle result as for Formula 8', function () {
            v8 = aircraftFormulas[8].v(thetag, sigma, cd, s);
            g8 = aircraftFormulas[8].thetag(sigma, cd, s, v8);
            testAircraftFormula(9, 'thetag', [cd, cl], g8);
        });
        it('solves for coefficient of drag', function () {
            testAircraftFormula(9, 'cd', [thetag, cl], cd);
        });
        it('solves for coefficient of lift', function () {
            testAircraftFormula(9, 'cl', [thetag, cd], cl);
        });
    });
    describe('Formula 10: Rate of sink (ft/min)', function () {
        var cd, d5, rs;
        beforeEach(function () {
            cd = random(1, 1.5);
            thetag = aircraftFormulas[8].thetag(cd, sigma, s, v);
            d5 = aircraftFormulas[5].d(sigma, cd, s, v);
            rs = aircraftFormulas[10].rs(sigma, cd, s, v, w);
        });
        it('is velocity * (drag / weight) * (5280 / 60)', function () {
            expect(rs / 88).toBeCloseTo(d5 / w * v);
        });
        it('solves for sigma', function () {
            testAircraftFormula(10, 'sigma', [rs, cd, s, v, w], sigma);
        });
        it('solves for coefficient of drag', function () {
            testAircraftFormula(10, 'cd', [rs, sigma, s, v, w], cd);
        });
        it('solves for wing area', function () {
            testAircraftFormula(10, 's', [rs, sigma, cd, v, w], s);
        });
        it('solves for velocity', function () {
            testAircraftFormula(10, 'v', [rs, sigma, cd, s, w], v);
        });
        it('solves for weight', function () {
            testAircraftFormula(10, 'w', [rs, sigma, cd, s, v], w);
        });
    });
    describe('Formula 11: Rate of sink without velocity', function () {
        var cd, cl, rs;
        beforeEach(function () {
            cd = random(1, 1.5);
            cl = aircraftFormulas[7].cl(w / s, sigma, v);
            rs = aircraftFormulas[11].rs(sigma, w, s, cd, cl);
        });
        it('has the same answer as for formula 10', function () {
            expect(rs).toBeCloseTo(aircraftFormulas[10].rs(sigma, cd, s, v, w));
        });
        it('solves for sigma', function () {
            testAircraftFormula(11, 'sigma', [rs, w, s, cd, cl], sigma);
        });
        it('solves for weight', function () {
            testAircraftFormula(11, 'w', [rs, sigma, s, cd, cl], w);
        });
        it('solves for wing area', function () {
            testAircraftFormula(11, 's', [rs, sigma, w, cd, cl], s);
        });
        it('solves for coefficient of drag', function () {
            testAircraftFormula(11, 'cd', [rs, sigma, w, s, cl], cd);
        });
        it('solves for coefficient of lift', function () {
            testAircraftFormula(11, 'cl', [rs, sigma, w, s, cd], cl);
        });
    });
    describe('Formula 12: Parasite and induced drag', function () {
        var cdi, cd;
        beforeEach(function () {
            cdi = random(0, 2);
            cd = aircraftFormulas[12].cd(cd0, cdi);
        });
        it('follows basic principles of total drag = parasite plus induced drag', function () {
            expect(cd).toBe(cd0 + cdi);
        });
        it('solves for parasite drag', function () {
            expect(aircraftFormulas[12].cd0(cd, cdi)).toBe(cd0);
        });
        it('solves for induced drag', function () {
            expect(aircraftFormulas[12].cdi(cd, cd0)).toBe(cdi);
        });
    });
    describe('Formula 13: Coefficient of induced drag from Coefficient of lift', function () {
        var cl, cdi;
        beforeEach(function () {
            cl = random(1, 2);
            cdi = aircraftFormulas[13].solve({cl: cl, e: e, ar: ar}).cdi;
        });
        it('follows lifting line theory', function () {
            var area = 0.5 * Math.TAU * ar;
            expect(cdi).toBeCloseTo(cl * cl / (e * area));
        });
        it('solves for coefficient of lift', function () {
            testAircraftFormulaSolve([13], 'cl', {cdi: cdi, e: e, ar: ar}, cl);
        });
        it('solves for airplane efficiency', function () {
            testAircraftFormula(13, 'e', [cdi, cl, ar], e);
        });
        it('solves for ar', function () {
            testAircraftFormula(13, 'ar', [cdi, cl, e], ar);
        });
        it('solves for coefficient of induced drag with eAR', function () {
            testAircraftFormulaSolve([13], 'cdi', {cl: cl, ear: ear}, cdi);
        });
        it('solves for coefficient of lift from eAR', function () {
            testAircraftFormulaSolve([13], 'cl', {cdi: cdi, ear: ear}, cl);
        });
        it('solves for effective aspect ratio', function () {
            testAircraftFormula(13, 'ear', [cdi, cl], ear);
        });
    });
    describe('Formulas 14: Aspect ratio relationships', function () {
        it('is related to the span and wing area', function () {
            expect(ar).toBeCloseTo(b * b / s);
        });
        it('solves for wing span from wing area', function () {
            testAircraftFormulaSolve([14], 'b', {ar: ar, s: s}, b);
        });
        it('solves for wing area', function () {
            testAircraftFormula(14, 's', [ar, b], s);
        });
        it('is related to wing span and average chord', function () {
            testAircraftFormulaSolve(14, 'ar', {b: b, c: c}, ar);
        });
        it('solves for wing span from average chord', function () {
            testAircraftFormulaSolve([14], 'b', {ar: ar, c: c}, b);
        });
        it('solves for average chord', function () {
            testAircraftFormula(14, 'c', [ar, b], c);
        });
    });
    describe('Formula 15: Parabolic drag polar', function () {
        var cdi, cd;
        beforeEach(function () {
            cl = random(1, 2);
            cd = aircraftFormulas[15].cd(cd0, cl, ear);
            cdi = aircraftFormulas[12].cdi(cd, cd0);
        });
        it('can be checked by using CDi formula in formula 12', function () {
            expect(cd).toBeCloseTo(aircraftFormulas[12].cd(cd0, cdi));
        });
        it('solves for parasite drag coefficient', function () {
            testAircraftFormula(15, 'cd0', [cd, cl, ear], cd0);
        });
        it('solves for coefficient of lift', function () {
            testAircraftFormula(15, 'cl', [cd, cd0, ear], cl);
        });
        it('solves for effective aspect ratio', function () {
            testAircraftFormulaSolve([15], 'ear', {cd: cd, cd0: cd0, cl: cl}, ear);
        });
        it('solves for effective aspect ratio from airplane efficiency and aspect ratio', function () {
            testAircraftFormulaSolve([15], 'ear', {e: e, ar: ar}, ear);
        });
        it('solves for airplane efficiency', function () {
            testAircraftFormulaSolve([15], 'e', {ear: ear, ar: ar}, e);
        });
        it('solves for aspect artio', function () {
            testAircraftFormula(15, 'ar', [ear, e], ar);
        });
    });
    describe('Formula 18: Coefficient of lift for minimum sink', function () {
        var clmins;
        beforeEach(function () {
            clmins = aircraftFormulas[18].clmins(ear, cd0);
        });
        it('should be sqrt(3 * CL^2 / CDi * CD0)', function () {
            var cl = random(1, 2),
                cdi = aircraftFormulas[13].cdi(cl, ear),
                expected = Math.sqrt(3 * (cl * cl / cdi) * cd0);
            expect(clmins).toBeCloseTo(expected);
        });
        it('solves for effective aspect ratio', function () {
            testAircraftFormula(18, 'ear', [clmins, cd0], ear);
        });
        it('solves for parasitic drag', function () {
            testAircraftFormula(18, 'cd0', [clmins, ear], cd0);
        });
    });


    describe('Formula 19: Minimum sink using drag area and effective chord', function () {
        var clmins18, clmins, data;
        beforeEach(function () {
            clmins = aircraftFormulas[19].clmins(ad, ce);
            data = {
                clmins: clmins,
                ad: ad,
                ce: ce
            };
        });
        it('should have the same answer as from formula 18', function () {
            clmins18 = aircraftFormulas[18].clmins(ear, cd0);

            expect(clmins18).toBeCloseTo(Math.sqrt(3 * Math.PI) * Math.sqrt(e * ar) * Math.sqrt(ad / s));
            expect(clmins18).toBeCloseTo(Math.sqrt(3 * Math.PI) * Math.sqrt(e * ar) * Math.sqrt(ad) * Math.sqrt(1 / s));
            expect(clmins18).toBeCloseTo(Math.sqrt(3 * Math.PI) * Math.sqrt(e) * Math.sqrt(ad) * Math.sqrt(b * b) * Math.sqrt(1 / s) * Math.sqrt(1 / s));
            expect(clmins18).toBeCloseTo(Math.sqrt(3 * Math.PI) * Math.sqrt(e) * Math.sqrt(ad) * Math.sqrt(b * b) * Math.sqrt(1 / s) * Math.sqrt(1 / s));
            expect(clmins18).toBeCloseTo(Math.sqrt(3 * Math.PI) * Math.sqrt(e) * Math.sqrt(ad) * Math.sqrt(b * b) * Math.sqrt(1 / b) * Math.sqrt(1 / c) * Math.sqrt(1 / b) * Math.sqrt(1 / c));
            expect(clmins18).toBeCloseTo(Math.sqrt(3 * Math.PI) * Math.sqrt(e) * Math.sqrt(ad) * Math.sqrt(1 / c) * Math.sqrt(1 / c));
            expect(clmins18).toBeCloseTo(Math.sqrt(3 * Math.PI) * Math.sqrt(ad) * Math.sqrt(e / (c * c)));
            expect(clmins18).toBeCloseTo(Math.sqrt(3 * Math.PI) * Math.sqrt(ad) / ce);
            expect(clmins).toBeCloseTo(clmins18);
        });
        it('solves for ad', function () {
            testAircraftFormulaSolve([19], 'ad', data);
        });
        it('solves for ce', function () {
            testAircraftFormulaSolve([19], 'ce', data);
        });
    });
    describe('Formula 19: effective chord formulas', function () {
        var data;
        beforeEach(function () {
            data = {
                c: c,
                e: e,
                ce: c / Math.sqrt(e)
            };
        });
        it('solves for effective chord', function () {
            testAircraftFormulaSolve(19, 'ce', data);
        });
        it('solves for chord', function () {
            testAircraftFormulaSolve(19, 'c', data);
        });
        it('solves for efficiency', function () {
            testAircraftFormulaSolve(19, 'e', data);
        });
    });
    describe('Formula 19: Drag area relationship', function () {
        var data;
        beforeEach(function () {
            data = {
                cd0: cd0,
                s: s,
                ad: cd0 * s
            };
        });
        it('solves for drag area', function () {
            delete data.ad;
            expect(aircraftFormulas[19].solve(data).ad).toBe(ad);
        });
        it('solves for parasite drag', function () {
            delete data.cd0;
            testAircraftFormulaSolve(19, 'cd0', data, cd0);
        });
        it('solves for wing area', function () {
            delete data.s;
            testAircraftFormulaSolve(19, 's', data, s);
        });
    });
    describe('Formula 20: Minimum rate of sink', function () {
        var cl, cd, rsmin, data;
        beforeEach(function () {
            cl = aircraftFormulas[19].clmins(ad, ce);
            cd = aircraftFormulas[15].cd(cd0, cl, ear);
            rsmin = aircraftFormulas[20].rsmin(w, sigma, ad, be);
            data = {
                rsmin: rsmin,
                w: w,
                sigma: sigma,
                ad: ad,
                be: be
            };
        });
        it('is similar to the sink rate', function () {
            expect(rsmin).toBeCloseTo(aircraftFormulas[11].rs(sigma, w, s, cd, cl));
        });
        it('solves for weight', function () {
            testAircraftFormulaSolve([20], 'w', data);
        });
        it('solves for density ratio', function () {
            testAircraftFormulaSolve([20], 'sigma', data);
        });
        it('solves for drag area', function () {
            testAircraftFormulaSolve([20], 'ad', data);
        });
        it('solves for effective span', function () {
            testAircraftFormulaSolve([20], 'be', data);
        });
    });
    describe('Formula 20: effective span formulas', function () {
        var data;
        beforeEach(function () {
            data = {
                b: b,
                e: e,
                be: b * Math.sqrt(e)
            };
        });
        it('solves for effective span', function () {
            testAircraftFormulaSolve(20, 'be', data);
        });
        it('solves for span', function () {
            testAircraftFormulaSolve(20, 'b', data);
        });
        it('solves for efficiency', function () {
            testAircraftFormulaSolve(20, 'e', data);
        });
    });
    describe('Formula 21: Velocity for minimum sink', function () {
        var clmins, ws, vmins, data;
        beforeEach(function () {
            vmins = aircraftFormulas[21].vmins(w, be, sigma, ad);
            data = {
                vmins: vmins,
                w: w,
                be: be,
                sigma: sigma,
                ad: ad
            };
        });
        it('is the same as formula 7 when solved for velocity', function () {
            clmins = aircraftFormulas[19].clmins(ad, ce);
            ws = w / s;
            expect(vmins).toBeCloseTo(aircraftFormulas[7].v(ws, sigma, clmins));
        });
        it('solves for weight', function () {
            testAircraftFormulaSolve([21], 'w', data);
        });
        it('solves for effective span', function () {
            testAircraftFormulaSolve([21], 'be', data);
        });
        it('solves for density ratio', function () {
            testAircraftFormulaSolve([21], 'sigma', data);
        });
        it('solves for drag area', function () {
            testAircraftFormulaSolve([21], 'ad', data);
        });
    });
    describe('Formula 21: Effective span loading', function () {
        var data;
        beforeEach(function () {
            data = {
                w: w,
                be: be,
                wbe: w / be
            };
        });
        it('solves for effective span loading', function () {
            testAircraftFormulaSolve([21], 'wbe', data);
        });
        it('solves for weight', function () {
            testAircraftFormulaSolve([21], 'w', data);
        });
        it('solves for effective span', function () {
            testAircraftFormulaSolve([21], 'be', data);
        });
    });
    describe('Formula 22: Rate of sink from drag area and effective span', function () {
        var rs, cd, ws, cl;
        beforeEach(function () {
            rs = aircraftFormulas[22].rs(sigma, ad, v, w, be);
        });
        it('has the same answer as for formula 11', function () {
            ws = w / s;
            cl = aircraftFormulas[7].cl(ws, sigma, v);
            cd = aircraftFormulas[15].cd(cd0, cl, ear);
            expect(rs).toBeCloseTo(aircraftFormulas[11].rs(sigma, w, s, cd, cl));
        });
        it('solves for density ratio', function () {
            testAircraftFormula(22, 'sigma', [rs, ad, v, w, be], sigma);
        });
        it('solves for drag area', function () {
            testAircraftFormula(22, 'ad', [rs, sigma, v, w, be], ad);
        });
        it('solves for velocity', function () {
            testAircraftFormula(22, 'v', [rs, sigma, ad, w, be], v);
        });
        it('solves for weight', function () {
            testAircraftFormula(22, 'w', [rs, sigma, ad, v, be], w);
        });
        it('solves for effective span', function () {
            testAircraftFormula(22, 'be', [rs, sigma, ad, v, w], be);
        });
    });
    describe('Formula 25: Dimensionless sink rate in terms of dimensionless velocity', function () {
        var rs, rsmin, rshat, vmins, vhat;
        beforeEach(function () {
            vmins = aircraftFormulas[21].vmins(w, be, sigma, ad);
            vhat = v / vmins;
            rshat = aircraftFormulas[25].rshat(vhat);
        });
        it('is equivalent to rate of sink over minimum sink rate', function () {
            rs = aircraftFormulas[22].rs(sigma, ad, v, w, be);
            rsmin = aircraftFormulas[20].rsmin(w, sigma, ad, be);
            expect(rshat).toBeCloseTo(rs / rsmin);
        });
        it('solves for vhat', function () {
            testAircraftFormula(25, 'vhat', [rshat], vhat);
        });
    });
    describe('Formula 26: Differentiate glide angle using coefficient of drag', function () {
        var cl, dg_dcl, cd;
        beforeEach(function () {
            cl = random(1, 2);
            dg_dcl = aircraftFormulas[26].dg_dcl(cl, cd0, ear);
        });
        it('should be formula 9 differentiated with respect to CL', function () {
            cd = aircraftFormulas[15].cd(cd0, cl, ear);
            expect(dg_dcl).toBeCloseTo(aircraftFormulas[9].thetag(cd, cl) / cl);
        });
        it('solves for coefficient of lift', function () {
            testAircraftFormula(26, 'cl', [dg_dcl, cd0, ear], cl);
        });
        it('solves for parasitic drag', function () {
            testAircraftFormula(26, 'cd0', [dg_dcl, cl, ear], cd0);
        });
        it('solves for effective aspect ratio', function () {
            testAircraftFormula(26, 'ear', [dg_dcl, cl, cd0], ear);
        });
    });
    describe('Formula 27: Coefficient of lift for maximum lift-to-drag', function () {
        var clmaxld, dg_dcl, cl;
        it('is the same as Formulas 26 for coefficient of lift', function () {
            clmaxld = aircraftFormulas[27].clmaxld(ear, cd0);
            cl = random(1, 2);
            dg_dcl = aircraftFormulas[26].dg_dcl(cl, cd0, ear);
            expect(Math.sqrt(1 / (-1 / (cl * cl) + dg_dcl * Math.TAU / 360 / cd0))).toBeCloseTo(clmaxld);
        });
        it('solves for effective aspect ratio', function () {
            testAircraftFormula(27, 'ear', [clmaxld, cd0], ear);
        });
        it('solves for effective aspect ratio', function () {
            testAircraftFormula(27, 'cd0', [clmaxld, ear], cd0);
        });
    });
    describe('Formula 28: Maximum lift-to-drag ratio', function () {
        var ldmax, clmaxld;
        beforeEach(function () {
            ldmax = aircraftFormulas[28].ldmax(ear, cd0);
        });
        it('is maximum coefficient for lift to drag ratio, divided by drag', function () {
            clmaxld = aircraftFormulas[27].clmaxld(ear, cd0);
            expect(ldmax).toBeCloseTo(clmaxld / (2 * cd0));
        });
        it('solves for effective aspect ratio', function () {
            testAircraftFormula(28, 'ear', [ldmax, cd0], ear);
        });
        xit('solves for parasite drag', function () {
            testAircraftFormula(28, 'cd0', [ldmax, ear], cd0);
        });
    });
    describe('Formula 29: Maximum lift-to-drag ratio from effective span and drag area', function () {
        var ldmax, ldmax28;
        beforeEach(function () {
            ldmax = aircraftFormulas[29].ldmax(be, ad);
        });
        it('should have the same value as for formulas 28', function () {
            ldmax28 = aircraftFormulas[28].ldmax(ear, cd0);
            expect(Math.sqrt(Math.PI / 4 * ear / cd0)).toBeCloseTo(ldmax28);
            expect(Math.sqrt(Math.PI) / 2 * Math.sqrt(ear) / Math.sqrt(cd0)).toBeCloseTo(ldmax28);
            expect(Math.sqrt(Math.PI) / 2 * Math.sqrt(e) * b / Math.sqrt(s) / Math.sqrt(cd0)).toBeCloseTo(ldmax28);
            expect(Math.sqrt(Math.PI) / 2 * be / Math.sqrt(ad)).toBeCloseTo(ldmax28);
            expect(ldmax).toBeCloseTo(ldmax28);
        });
        it('should solve for effective span', function () {
            testAircraftFormula(29, 'be', [ldmax, ad], be);
        });
        it('should solve for drag area', function () {
            testAircraftFormula(29, 'ad', [ldmax, be], ad);
        });
    });
    describe('Formula 30: Minimum drag', function () {
        var dmin, ldmax;
        beforeEach(function () {
            dmin = aircraftFormulas[30].dmin(ad, w, be);
        });
        it('should be the inverse of the max lift-to-drag ratio times the weight', function () {
            ldmax = aircraftFormulas[29].ldmax(be, ad);
            expect(dmin).toBeCloseTo(1 / ldmax * w);
        });
        it('solves for drag area', function () {
            testAircraftFormula(30, 'ad', [dmin, w, be], ad);
        });
        it('solves for weight', function () {
            testAircraftFormula(30, 'w', [dmin, ad, be], w);
        });
        it('solves for effective span', function () {
            testAircraftFormula(30, 'be', [dmin, ad, w], be);
        });
    });
    describe('Formula 31: Available horsepower to maintain level flight', function () {
        var thpal, rs;
        beforeEach(function () {
            thpal = aircraftFormulas[31].thpal(sigma, ad, v, w, be);
        });
        it('should be equivalent to formula 22 times weight over 33000', function () {
            rs = aircraftFormulas[22].rs(sigma, ad, v, w, be);
            expect(thpal).toBeCloseTo(rs * w / 33000);
        });
        it('solves for density ratio', function () {
            testAircraftFormula(31, 'sigma', [thpal, ad, v, w, be, sigma], sigma);
        });
        it('solves for drag area', function () {
            testAircraftFormulaSolve(31, 'ad', {
                thpal: thpal,
                sigma: sigma,
                v: v,
                w: w,
                be: be
            }, ad);
        });
        xit('solves for velocity', function () {
            testAircraftFormula(31, 'v', [thpal, sigma, ad, w, be], v);
        });
        it('solves for weight', function () {
            testAircraftFormula(31, 'w', [thpal, sigma, ad, v, be], w);
        });
        it('solves for effective span', function () {
            testAircraftFormula(31, 'be', [thpal, sigma, ad, v, w], be);
        });
    });
    describe('Formula 31: Total thrust relationship', function () {
        var thpa, data;
        beforeEach(function () {
            thpa = aircraftFormulas[31].thpa(ad, v, sigma);
            data = {
                ad: ad,
                vmax: v,
                sigma: sigma,
                thpa: thpa
            };
        });
        it('solves for drag area', function () {
            delete data.ad;
            testAircraftFormulaSolve(31, 'ad', data, ad);
        });
        it('solves for velocity', function () {
            delete data.vmax;
            testAircraftFormulaSolve(31, 'vmax', data, v);
        });
    });
    describe('Formula 32: Available horsepower to maintain level flight', function () {
        var thpal, rs;
        beforeEach(function () {
            rs = aircraftFormulas[22].rs(sigma, ad, v, w, be);
            thpal = aircraftFormulas[32].thpal(rs, w);
        });
        it('should be equivalent to formula 31', function () {
            expect(thpal).toBeCloseTo(aircraftFormulas[31].thpal(sigma, ad, v, w, be));
        });
        it('solves for rate of sink', function () {
            testAircraftFormula(32, 'rs', [thpal, w], rs);
        });
        it('solves for w', function () {
            testAircraftFormula(32, 'w', [thpal, rs], w);
        });
    });
    describe('Formula 33: Minimum power for level flight', function () {
        var thpmin, rsmin;
        beforeEach(function () {
            thpmin = aircraftFormulas[33].thpmin(ad, sigma, w, be);
        });
        it('should be equivalent to formula 32 at minimum rate of sink', function () {
            rsmin = aircraftFormulas[20].rsmin(w, sigma, ad, be);
            testAircraftFormula(32, 'thpal', [rsmin, w], thpmin);
        });
        it('solves for drag area', function () {
            testAircraftFormula(33, 'ad', [thpmin, sigma, w, be], ad);
        });
        it('solves for density ratio', function () {
            testAircraftFormula(33, 'sigma', [thpmin, ad, w, be], sigma);
        });
        it('solves for weight', function () {
            testAircraftFormula(33, 'w', [thpmin, ad, sigma, be], w);
        });
        it('solves for effective span', function () {
            testAircraftFormula(33, 'be', [thpmin, ad, sigma, w], be);
        });
    });
    describe('Formula 34: Thrust from a climbing flight', function () {
        var t, d, thetac;
        beforeEach(function () {
            thetac = random(0, 20);
            d = random(100, 500);
            t = aircraftFormulas[34].t(d, w, thetac);
        });
        it('should have a thrust equal to drag plus weight times climbing angle', function () {
            expect(t).toBeCloseTo(d + w * Math.sin(thetac / 360 * Math.TAU));
        });
        it('solves for drag', function () {
            testAircraftFormula(34, 'd', [t, w, thetac], d);
        });
        it('solves for weight', function () {
            testAircraftFormula(34, 'w', [t, d, thetac], w);
        });
        it('solves for climbing angle', function () {
            testAircraftFormula(34, 'thetac', [t, d, w], thetac);
        });
    });
    describe('Formula 35: Lift from a climbing angle', function () {
        var l, thetac;
        beforeEach(function () {
            thetac = random(0, 20);
            l = aircraftFormulas[35].l(w, thetac);
        });
        it('should be the same as for lift from a gliding flight', function () {
            expect(l).toBeCloseTo(aircraftFormulas[2].l(w, thetac));
        });
        it('solves for weight', function () {
            testAircraftFormula(35, 'w', [l, thetac], w);
        });
        it('solves for climbing angle', function () {
            testAircraftFormula(35, 'thetac', [l, w], thetac);
        });
    });
    describe('Formula 36: Thrust, normal to the climbing flight path', function () {
        var thetac, t;
        beforeEach(function () {
            thetac = random(0, 20);
            t = aircraftFormulas[36].t(thetac, sigma, ad, v, w, be);
        });
        it('solves for climb angle', function () {
            testAircraftFormula(36, 'thetac', [t, sigma, ad, v, w, be], thetac);
        });
        xit('solves for density ratio', function () {
            // TODO: too inaccurate
            testAircraftFormula(36, 'sigma', [t, thetac, ad, v, w, be], sigma);
        });
        it('solves for drag area', function () {
            testAircraftFormula(36, 'ad', [t, thetac, sigma, v, w, be], ad);
        });
        xit('solves for velocity', function () {
            // TODO: too inaccurate
            testAircraftFormula(36, 'v', [t, thetac, sigma, ad, w, be, v], v);
        });
        it('solves for weight', function () {
            testAircraftFormula(36, 'w', [t, thetac, sigma, ad, v, be], w);
        });
        it('solves for effective span', function () {
            testAircraftFormula(36, 'be', [t, thetac, sigma, ad, v, w], be);
        });
    });
    describe('Formula 38: Rate of climb', function () {
        var rc, rs;
        beforeEach(function () {
            rs = aircraftFormulas[22].rs(sigma, ad, v, w, be);
            rc = aircraftFormulas[38].rc(bhp, w, eta, rs);
        });
        it('solves for engine brake horsepower', function () {
            testAircraftFormula(38, 'bhp', [rc, w, eta, rs], bhp);
        });
        it('solves for weight', function () {
            testAircraftFormula(38, 'w', [rc, bhp, eta, rs], w);
        });
        it('solves for efficiency', function () {
            testAircraftFormula(38, 'eta', [rc, bhp, w, rs], eta);
        });
        it('solves for rate of sink', function () {
            testAircraftFormula(38, 'rs', [rc, bhp, w, eta], rs);
        });
    });
    describe('Formula 39: Mass conservation equation', function () {
        var data, mdot;
        beforeEach(function () {
            data = {
                rho: rho,
                ap: ap,
                vp: vp
            };
            mdot = aircraftFormulas[39].solve(data).mdot;
        });
        it('solves for air pressure', function () {
            testAircraftFormula(39, 'rho', [mdot, ap, vp], rho);
        });
        it('solves for propeller area', function () {
            testAircraftFormula(39, 'rho', [mdot, rho, vp], ap);
        });
        it('solves for propeller velocity', function () {
            testAircraftFormula(39, 'rho', [mdot, rho, ap], vp);
        });
    });
    describe('Formula 40: Change in momentum vs pressure jump', function () {
        var t;
        beforeEach(function () {
            t = aircraftFormulas[40].t(m, v3, v);
        });
        it('solves for thrust from velocity', function () {
            testAircraftFormula(40, 't', [m, v3, v], t);
        });
        it('solves for mass flow rate', function () {
            testAircraftFormula(40, 'm', [t, v3, v], m);
        });
        it('solves for slipstream velocity', function () {
            testAircraftFormula(40, 'v3', [t, m, v], v3);
        });
        it('solves for freestream velocity', function () {
            testAircraftFormula(40, 'v', [t, m, v3], v);
        });
    });
    describe('Formula 41: Upstream propeller pressure increase', function () {
        var pdi, p1i;
        beforeEach(function () {
            pdi = aircraftFormulas[41].pdi(pd, rho, v);
            p1i = aircraftFormulas[41].p1i(p1, rho, vp);
        });
        it('solves for pressure differential', function () {
            testAircraftFormula(41, 'pd', [pdi, rho, v], pd);
        });
        it('solves for pressure density from differential increase', function () {
            testAircraftFormula(41, 'rho', [pdi, pd, v], rho);
        });
        it('solves for velocity from differential increase', function () {
            testAircraftFormula(41, 'v', [pdi, pd, rho], v);
        });
        it('solves for pressure before propeller', function () {
            testAircraftFormula(41, 'p1', [p1i, rho, vp], p1);
        });
        it('solves for pressure density from differential increase', function () {
            testAircraftFormula(41, 'rho', [p1i, p1, vp], rho);
        });
        it('solves for velocity from differential increase', function () {
            testAircraftFormula(41, 'v', [p1i, p1, rho], vp);
        });
    });
    describe('Formula 42: Downstream propeller pressure', function () {
        beforeEach(function () {
            p2 = aircraftFormulas[42].p2(pd, rho, vp, v3);
        });
        it('solves for pressure differential', function () {
            testAircraftFormula(42, 'pd', [p2, rho, vp, v3], pd);
        });
        it('solves for pressure density', function () {
            testAircraftFormula(42, 'rho', [p2, pd, vp, v3, rho], rho);
        });
        it('solves for propeller velocity', function () {
            testAircraftFormula(42, 'vp', [p2, pd, rho, v3], vp);
        });
        it('solves for slipstream velocity', function () {
            testAircraftFormula(42, 'v3', [p2, pd, rho, vp], v3);
        });
    });
    describe('Formula 43: Propeller pressure jump', function () {
        beforeEach(function () {
            p2 = aircraftFormulas[43].p2(p1, rho, v3, v);
        });
        it('solves for upstream pressure', function () {
            testAircraftFormula(43, 'p1', [p2, rho, v3, v], p1);
        });
        it('solves for pressure density', function () {
            testAircraftFormula(43, 'rho', [p1, p2, v3, v], rho);
        });
        it('solves for slipstream velocity', function () {
            testAircraftFormula(43, 'v3', [p1, p2, rho, v], v3);
        });
        it('solves for freestream velocity', function () {
            testAircraftFormula(43, 'v', [p1, p2, rho, v3], v);
        });
    });
    describe('Formula 44: Thrust force', function () {
        var t;
        beforeEach(function () {
            t = aircraftFormulas[44].t(rho, v3, v, ap);
        });
        it('solves for pressure density', function () {
            testAircraftFormula(44, 'rho', [t, v3, v, ap], rho);
        });
        it('solves for slipstream velocity', function () {
            testAircraftFormula(44, 'v3', [t, rho, v, ap], v3);
        });
        it('solves for freestream velocity', function () {
            testAircraftFormula(44, 'v', [t, rho, v3, ap], v);
        });
        it('solves for propeller area', function () {
            testAircraftFormula(44, 'ap', [t, rho, v3, v], ap);
        });
    });
    describe('Formula 45: Prop velocity', function () {
        beforeEach(function () {
            vp = aircraftFormulas[45].vp(v3, v);
        });
        it('solves for freestream velocity', function () {
            testAircraftFormula(45, 'v', [vp, v3], v);
        });
    });
    describe('Formula 46: Slipstream velocity', function () {
        beforeEach(function () {
            vp = aircraftFormulas[45].vp(v3, v);
        });
        it('solves for a reworking of #45', function () {
            testAircraftFormula(46, 'v3', [vp, v], v3);
        });
    });
    describe('Formula 47: Available propeller thrust', function () {
        var t;
        beforeEach(function () {
            t = aircraftFormulas[47].t(rho, ap, vp, v);
        });
        it('solves for pressure density', function () {
            testAircraftFormula(47, 'rho', [t, ap, vp, v], rho);
        });
        it('solves for propeller area', function () {
            testAircraftFormula(47, 'ap', [t, rho, vp, v], ap);
        });
        it('solves for propeller velocity', function () {
            testAircraftFormula(47, 'vp', [t, rho, ap, v], vp);
        });
        it('solves for freestream velocity', function () {
            testAircraftFormula(47, 'v', [t, rho, ap, vp], v);
        });
    });
    // TODO: Formula 48 will be a check that's done later on
    describe('Formula 49: Engine power at shaft', function () {
        var pshaft;
        beforeEach(function () {
            pshaft = aircraftFormulas[49].pshaft(rho, ap, vp, v);
        });
        it('solves for pressure density', function () {
            testAircraftFormula(49, 'rho', [pshaft, ap, vp, v], rho);
        });
        it('solves for propeller area', function () {
            testAircraftFormula(49, 'ap', [pshaft, rho, vp, v], ap);
        });
        it('solves for propeller velocity', function () {
            testAircraftFormula(49, 'vp', [pshaft, rho, ap, v], vp);
        });
        it('solves for freestream velocity', function () {
            testAircraftFormula(49, 'v', [pshaft, rho, ap, vp], v);
        });
    });
    describe('Formula 50: Engine power', function () {
        beforeEach(function () {
            bhp = aircraftFormulas[50].bhp(sigma, dp, v, eta);
        });
        it('solves for density ratio', function () {
            testAircraftFormula(50, 'sigma', [bhp, dp, v, eta], sigma);
        });
        it('solves for propeller diameter', function () {
            testAircraftFormula(50, 'dp', [bhp, sigma, v, eta], dp);
        });
        it('solves for velocity', function () {
            testAircraftFormula(50, 'v', [bhp, sigma, dp, eta], v);
        });
        // Solving for eta results are too inaccurate
    });
    describe('Formula 51: Propeller velocity', function () {
        var vprop;
        beforeEach(function () {
            bhp = aircraftFormulas[50].bhp(sigma, dp, v, eta);
            vprop = aircraftFormulas[51].vprop(bhp, sigma, dp);
        });
        it('solves for engine power', function () {
            testAircraftFormula(51, 'bhp', [vprop, sigma, dp], bhp);
        });
        it('solves for density ratio', function () {
            testAircraftFormula(51, 'sigma', [vprop, bhp, dp], sigma);
        });
        it('solves for propeller diameter', function () {
            testAircraftFormula(51, 'dp', [vprop, bhp, sigma], dp);
        });
    });
    describe('Formula 52: Dimensionless velocity', function () {
        var vhat;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
        });
        it('solves for propeller efficiency', function () {
            testAircraftFormula(52, 'eta', [vhat], eta);
        });
    });
    describe('Formula 53: Cubic equation for dimensionless velocity', function () {
        var vhat;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
        });
        it('shows that eta and vhat are solved as close to zero', function () {
            testAircraftFormula(53, 'zero', [eta, vhat], 0);
        });
    });
    describe('Formula 54: Solution to cubic equation for dimensionless velocity', function () {
        var vhat;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
        });
        it('solves for propeller efficiency', function () {
            testAircraftFormula(54, 'eta', [vhat], eta);
        });
    });
    describe('Formula 55: Nondimensional advance ratio (per second)', function () {
        var j;
        beforeEach(function () {
            j = aircraftFormulas[55].j(v, n, dp);
        });
        it('solves for velocity', function () {
            testAircraftFormula(55, 'v', [j, n, dp], v);
        });
        it('solves for propeller rotation', function () {
            testAircraftFormula(55, 'n', [j, v, dp], n);
        });
        it('solves for propeller diameter', function () {
            testAircraftFormula(55, 'dp', [j, v, n], dp);
        });
    });
    describe('Formula 56: Nondimensional advance ratio (per hour)', function () {
        var j;
        beforeEach(function () {
            j = aircraftFormulas[56].j(v, rpm, dp);
        });
        it('solves for velocity', function () {
            testAircraftFormula(56, 'v', [j, rpm, dp], v);
        });
        it('solves for revolutions per minute', function () {
            testAircraftFormula(56, 'rpm', [j, v, dp], rpm);
        });
        it('solves for propeller diameter', function () {
            testAircraftFormula(56, 'dp', [j, v, rpm], dp);
        });
    });
    describe('Formula 57: Dimensionless power coefficient as ft-lb/sec', function () {
        var p, cp;
        beforeEach(function () {
            p = aircraftFormulas[49].pshaft(rho, ap, vp, v);
            cp = aircraftFormulas[57].cp(p, rho, n, dp);
        });
        it('solves for engine shaft power', function () {
            testAircraftFormula(57, 'p', [cp, rho, n, dp], p);
        });
        it('solves for density ratio', function () {
            testAircraftFormula(57, 'rho', [cp, p, n, dp], rho);
        });
        it('solves for propeller revolutions', function () {
            testAircraftFormula(57, 'n', [cp, p, rho, dp], n);
        });
        it('solves for propeller diameter', function () {
            testAircraftFormula(57, 'dp', [cp, p, rho, n], dp);
        });
    });
    describe('Formula 58: Dimensionless power coefficient as rpm', function () {
        var cp;
        beforeEach(function () {
            cp = aircraftFormulas[58].cp(bhp, rpm, dp);
        });
        it('solves for BHP', function () {
            testAircraftFormula(58, 'bhp', [cp, rpm, dp], bhp);
        });
        it('solves for density ratio', function () {
            testAircraftFormula(58, 'rpm', [cp, bhp, dp], rpm);
        });
        it('solves for propeller revolutions', function () {
            testAircraftFormula(58, 'dp', [cp, bhp, rpm], dp);
        });
    });
    describe('Formula 58: Dimensionless power coefficient as rpm', function () {
        var cp;
        beforeEach(function () {
            cp = aircraftFormulas[58].cp(bhp, rpm, dp);
        });
        it('solves for BHP', function () {
            testAircraftFormula(58, 'bhp', [cp, rpm, dp], bhp);
        });
        it('solves for density ratio', function () {
            testAircraftFormula(58, 'rpm', [cp, bhp, dp], rpm);
        });
        it('solves for propeller revolutions', function () {
            testAircraftFormula(58, 'dp', [cp, bhp, rpm], dp);
        });
    });
    describe('Formula 59: Dimensionless velocity from advance ratio and power coefficient', function () {
        var j, cp, vhat;
        beforeEach(function () {
            j = aircraftFormulas[56].j(v, rpm, dp);
            cp = aircraftFormulas[58].cp(bhp, rpm, dp);
            vhat = aircraftFormulas[59].vhat(j, cp);
        });
        it('solves for nondimensional advance ratio', function () {
            testAircraftFormula(59, 'j', [vhat, cp], j);
        });
        it('solves for power coefficient', function () {
            testAircraftFormula(59, 'cp', [vhat, j], cp);
        });
    });
    describe('Formula 60: Approximation of static thrust as ft-lb/sec', function () {
        var p, ts;
        beforeEach(function () {
            p = aircraftFormulas[49].pshaft(rho, ap, vp, v);
            ts = aircraftFormulas[60].ts(rho, dp, p);
        });
        it('solves for air density', function () {
            testAircraftFormula(60, 'rho', [ts, dp, p], rho);
        });
        it('solves for propeller diameter', function () {
            testAircraftFormula(60, 'dp', [ts, rho, p], dp);
        });
        it('solves for propeller engine power', function () {
            testAircraftFormula(60, 'pshaft', [ts, rho, dp], p);
        });
    });
    describe('Formula 61: Approximation of static thrust as rpm', function () {
        var ts;
        beforeEach(function () {
            ts = aircraftFormulas[61].ts(rho, dp, bhp);
        });
        it('solves for pressure density', function () {
            testAircraftFormula(61, 'rho', [ts, dp, bhp], rho);
        });
        it('solves for propeller diameter', function () {
            testAircraftFormula(61, 'dp', [ts, rho, bhp], dp);
        });
        it('solves for BHP', function () {
            testAircraftFormula(61, 'bhp', [ts, rho, dp], bhp);
        });
    });
    describe('Formula 62: Ideal thrust from an engine-propeller combination', function () {
        var vhat, that;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
            that = aircraftFormulas[62].that(eta, vhat);
        });
        it('solves for propeller efficiency', function () {
            testAircraftFormula(62, 'eta', [that, vhat], eta);
        });
        it('solves for dimensionless speed', function () {
            testAircraftFormula(62, 'vhat', [that, eta], vhat);
        });
    });
    describe('Formula 63: Idealised thrust ratio from dimensionless velocity', function () {
        var vhat, that;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
            that = aircraftFormulas[62].that(eta, vhat);
        });
        it('solves for ideal thrust ratio', function () {
            testAircraftFormula(63, 'that', [vhat], that);
        });
    });
    describe('Formula 64: Propeller tip mach number', function () {
        var mp;
        beforeEach(function () {
            mp = aircraftFormulas[64].mp(rpm, dp);
        });
        it('solves for rpm', function () {
            testAircraftFormula(64, 'rpm', [mp, dp], rpm);
        });
        it('solves for propeller diameter', function () {
            testAircraftFormula(64, 'dp', [mp, rpm], dp);
        });
    });
    describe('Appendix', function () {
        describe('D', function () {
            function convertToRankine(f) {
                return f + 460;
            }
            describe('1: differential form for vertical momentum', function () {
                // dp/dh = -ρg
                var dh, g;
                beforeEach(function () {
                    dh = random(1, 100);
                    rho = 0.002377 + random(0, 0.002377 - 0.005);
                    g = 32.1740; // ft/sec^2
                    dp = -rho * g * dh;
                });
                it('solves for dp', function () {
                    expect(aircraftFormulas.d[1].dp(rho, dh)).toBeCloseTo(dp);
                });
                it('solves for dh', function () {
                    expect(aircraftFormulas.d[1].dh(dp, rho)).toBeCloseTo(dh);
                });
                it('solves for rho', function () {
                    expect(aircraftFormulas.d[1].rho(dp, dh)).toBeCloseTo(rho);
                });
            });
            describe('1: differential form for vertical momentum', function () {
                // dp/dh = -ρg
                var dh, g;
                beforeEach(function () {
                    dh = random(1, 100);
                    rho = 0.002377 + random(0, 0.002377 - 0.005);
                    g = 32.1740; // ft/sec^2
                    dp = -rho * g * dh;
                });
                it('solves for dp', function () {
                    expect(aircraftFormulas.d[1].dp(rho, dh)).toBeCloseTo(dp);
                });
            });
            describe('6: Pressure of constant density in Isothermal atmosphere', function () {
                var p0, h, t0, p;
                beforeEach(function () {
                    p0 = 1 - Math.random() / 10;
                    h = Math.random() * 1000;
                    t0 = Math.random() * 50 * 460; // rankine
                    p = aircraftFormulas.d[6].p(p0, h, t0);
                });
                it('solves for height', function () {
                    expect(aircraftFormulas.d[6].h(p, p0, t0, h)).toBeCloseTo(h);
                });
                it('solves for constant temperature', function () {
                    expect(aircraftFormulas.d[6].t0(p, p0, h, t0)).toBeCloseTo(t0);
                });
            });
            describe('7: Density ratio in Isothermal atmosphere', function () {
                var h, t0;
                beforeEach(function () {
                    h = Math.random() * 1000;
                    t0 = convertToRankine(Math.random() * 50);
                    sigma = aircraftFormulas.d[7].sigma(h, t0);
                });
                it('solves for height', function () {
                    expect(aircraftFormulas.d[7].h(sigma, t0)).toBeCloseTo(h);
                });
                it('solves for constant temperature', function () {
                    expect(aircraftFormulas.d[7].t0(sigma, h, t0)).toBeCloseTo(t0);
                });
            });
            describe('8: Density ratio in characteristic atmosphere', function () {
                var h, h0, t0;
                beforeEach(function () {
                    h = Math.random() * 1000;
                    t0 = 519; // average at sealevel
                    h0 = 27713; // characteristic altitude: R * t0 / G
                    sigma = aircraftFormulas.d[8].sigma(h, h0);
                });
                it('is equivalent to formulas D.7', function () {
                    expect(aircraftFormulas.d[7].sigma(h, t0)).toBeCloseTo(sigma);
                });
                it('it solves for height', function () {
                    expect(aircraftFormulas.d[8].h(sigma, h0)).toBeCloseTo(h);
                });
                it('it solves for characteristic altitude', function () {
                    expect(aircraftFormulas.d[8].h0(sigma, h)).toBeCloseTo(h0);
                });
            });
            describe('12: Variation of density ratio with altitude to 36240 ft', function () {
                var h, f;
                beforeEach(function () {
                    h = Math.random() * 36240;
                    f = random(32, 80);
                    sigma = aircraftFormulas.d[12].sigma(h, f);
                });
                it('is a ratio of 1 at sealevel', function () {
                    expect(aircraftFormulas.d[12].sigma(0, f)).toBe(1);
                });
                it('solves for height', function () {
                    expect(aircraftFormulas.d[12].h(sigma, f)).toBeCloseTo(h);
                });
                it('solves for temperature', function () {
                    expect(aircraftFormulas.d[12].f(sigma, h)).toBeCloseTo(f);
                });
                it('uses -70F for altitudes at 36240 ft and higher', function () {
                    expect(aircraftFormulas.d[12].sigma(36000, 80)).toBeGreaterThan(aircraftFormulas.d[12].sigma(36000, 0));
                    expect(aircraftFormulas.d[12].sigma(37000, 80)).toBe(aircraftFormulas.d[12].sigma(37000, 0));
                });
            });
        });
        describe('F: Airplane efficiency factor, e; ground effect', function () {
            var cdwing, kwing, cdfuse, sfuse, kfuse, angleOfAttack, cdcomp, scomp, planformCorrection;
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
            describe('1: Drag coefficient of the wing area', function () {
                var cds;
                beforeEach(function () {
                    cd0 = cdwing * s * (1 + kwing * cl * cl) + cdfuse * sfuse * (1 + kfuse * angleOfAttack * angleOfAttack) + cdcomp + scomp;
                    cds = aircraftFormulas.f[1].cds(cd0, cl, ear, s);
                });
                it('is the drag coefficient with induced drag, across the span of the wing', function () {
                    expect(aircraftFormulas[15].cd(cd0, cl, ear) * s).toBe(cds);
                });
                it('solves for coefficient of drag', function () {
                    expect(aircraftFormulas.f[1].cd0(cds, cl, ear, s)).toBeCloseTo(cd0);
                });
                it('solves for coefficient of lift', function () {
                    expect(aircraftFormulas.f[1].cl(cds, cd0, ear, s)).toBeCloseTo(cl);
                });
                it('solves for effective aspect ratio', function () {
                    expect(aircraftFormulas.f[1].ear(cds, cd0, cl, s)).toBeCloseTo(ear);
                });
                it('solves for wing span', function () {
                    expect(aircraftFormulas.f[1].s(cds, cd0, cl, ear)).toBeCloseTo(s);
                });
            });
            describe('2: Drag coefficient from separate components', function () {
                var cdi;
                beforeEach(function () {
                    cd0 = cdwing * s * (1 + kwing * cl * cl) + cdfuse * sfuse * (1 + kfuse * angleOfAttack * angleOfAttack) + cdcomp * scomp;
                });
                it('uses contributions from different drag components', function () {
                    cdi = cl * cl / (Math.PI * ar) * (1 + planformCorrection) * s;
                    expect(aircraftFormulas.f[2].cds(cdwing, s, kwing, cl, cdfuse, sfuse, kfuse, angleOfAttack, cdcomp, scomp, ar, planformCorrection)).toBeCloseTo(cd0 + cdi);
                });
            });
            describe('5: Drag area from separate components', function () {
                beforeEach(function () {
                    ad = aircraftFormulas.f[5].ad(cdwing, s, cdfuse, sfuse, cdcomp, scomp);
                });
                it('is the same as F.2 at zero lift conditions', function () {
                    cl = 0;
                    angleOfAttack = 0;
                    expect(ad).toBeCloseTo(aircraftFormulas.f[2].cds(cdwing, s, kwing, cl, cdfuse, sfuse, kfuse, angleOfAttack, cdcomp, scomp, ar, planformCorrection));
                });
            });
            describe('6: Lift slope', function () {
                var liftSlope;
                beforeEach(function () {
                    liftSlope = aircraftFormulas.f[6].liftSlope(ar);
                });
                it('solves for aspect ratio', function () {
                    expect(aircraftFormulas.f[6].ar(liftSlope)).toBeCloseTo(ar);
                });
            });
            describe('7: Linear approximation of coefficient of lift', function () {
                var liftSlope;
                beforeEach(function () {
                    liftSlope = aircraftFormulas.f[6].liftSlope(ar);
                    cl = aircraftFormulas.f[7].cl(liftSlope, angleOfAttack);
                });
                it('equals F.6 times angle of attack', function () {
                    expect(liftSlope * angleOfAttack).toBeCloseTo(cl);
                });
                it('solves for liftSlope', function () {
                    expect(aircraftFormulas.f[7].liftSlope(cl, angleOfAttack)).toBeCloseTo(liftSlope);
                });
                it('solves for angle of attack', function () {
                    expect(aircraftFormulas.f[7].angleOfAttack(cl, liftSlope)).toBeCloseTo(angleOfAttack);
                });
            });
            describe('8: Airplane efficiency factor', function () {
                var invew, invefuse, inve;
                beforeEach(function () {
                    invew = aircraftFormulas.f[8].solve({
                        planformCorrection: planformCorrection,
                        ar: ar,
                        cdwing: cdwing,
                        kwing: kwing
                    }).invew;
                    invefuse = aircraftFormulas.f[8].solve({ar: ar, cdfuse: cdfuse, kfuse: kfuse, sfuse: sfuse, s: s}).invefuse;
                    inve = aircraftFormulas.f[8].inve(invew, invefuse);
                });
                it('gets the efficiency from the wing efficiency factor and fuselage correction', function () {
                    expect(inve).toBe(invew + invefuse);
                });
                it('solves for planform correction', function () {
                    expect(aircraftFormulas.f[8].planformCorrection(invew, ar, cdwing, kwing)).toBeCloseTo(planformCorrection);
                });
                it('solves for aspect ratio from wing efficiency factor', function () {
                    expect(aircraftFormulas.f[8].solve({
                        invew: invew, planformCorrection: planformCorrection, cdwing: cdwing, kwing: kwing
                    }).ar).toBeCloseTo(ar);
                });
                it('solves for the wing coefficient of drag', function () {
                    expect(aircraftFormulas.f[8].cdwing(invew, planformCorrection, ar, kwing)).toBeCloseTo(cdwing);
                });
                it('solves for the change of wing parasite drag', function () {
                    expect(aircraftFormulas.f[8].kwing(invew, planformCorrection, ar, cdwing)).toBeCloseTo(kwing);
                });
                xit('solves for aspect ratio from fuselage correction', function () {
                });
                it('solves for fuselage coefficient of drag', function () {
                    expect(aircraftFormulas.f[8].cdfuse(invefuse, ar, kfuse, sfuse, s)).toBeCloseTo(cdfuse);
                });
                it('solves for change of fuselage parasite drag', function () {
                    expect(aircraftFormulas.f[8].kfuse(invefuse, ar, cdfuse, sfuse, s, kfuse)).toBeCloseTo(kfuse);
                });
                it('solves for fuselage area', function () {
                    expect(aircraftFormulas.f[8].sfuse(invefuse, ar, cdfuse, kfuse, s, sfuse)).toBeCloseTo(sfuse);
                });
                it('solves for wing area', function () {
                    expect(aircraftFormulas.f[8].s(invefuse, ar, cdfuse, kfuse, sfuse, s)).toBeCloseTo(s);
                });
                it('solves for wing efficiency from fuselage efficiency and overall efficiency', function () {
                    expect(aircraftFormulas.f[8].solve({inve: inve, invefuse: invefuse}).invew).toBeCloseTo(invew);
                });
                it('solves for fuselage efficiency from wing efficiency and overall efficiency', function () {
                    expect(aircraftFormulas.f[8].solve({inve: inve, invew: invew}).invefuse).toBeCloseTo(invefuse);
                });
            });
            describe('End of appendix formulas', function () {
                var fuselageCorrection, inve, invew, invefuse;
                beforeEach(function () {
                    fuselageCorrection = random(0, 1);
                    invew = random(1, 2);
                    invefuse = aircraftFormulas.f[9].solve({fuselageCorrection: fuselageCorrection, sfuse: sfuse, s: s}).invefuse;
                    inve = aircraftFormulas.f[9].solve({invew: invew, invefuse: invefuse}).inve;
                });
                it('solves for fuselageCorrection', function () {
                    expect(aircraftFormulas.f[9].fuselageCorrection(invefuse, sfuse, s)).toBeCloseTo(fuselageCorrection);
                });
                it('solves for fuselage area', function () {
                    expect(aircraftFormulas.f[9].sfuse(invefuse, fuselageCorrection, s)).toBeCloseTo(sfuse);
                });
                it('solves for area', function () {
                    expect(aircraftFormulas.f[9].s(invefuse, fuselageCorrection, sfuse, s)).toBeCloseTo(s);
                });
                it('can solve for invew', function () {
                    expect(aircraftFormulas.f[9].solve({inve: inve, invefuse: invefuse}).invew).toBeCloseTo(invew);
                });
                it('can invert an inverted efficiency', function () {
                    expect(aircraftFormulas.f[9].e(1 / e)).toBeCloseTo(e);
                });
                it('can invert the aircraft efficiency', function () {
                    expect(aircraftFormulas.f[9].solve({e: e}).inve).toBeCloseTo(1 / e);
                });
                describe('Ground effect', function () {
                    var i, values, value, h, ew, ewgd, kgd;
                    beforeEach(function () {
                        ew = random(1, 2);
                        h = random(0, 1000);
                        kgd = h / b;
                    });
                    it('can deal with ground effect', function () {
                        values = [
                            {x: 0.05, y: 2.9962},
                            {x: 0.07, y: 2.3991},
                            {x: 0.1, y: 1.9235},
                            {x: 0.2, y: 1.3631},
                            {x: 0.3, y: 1.2002},
                            {x: 0.4, y: 1.1369},
                            {x: 0.5, y: 1.1096}
                        ];
                        for (i = 0; i < values.length; i += 1) {
                            value = values[i];
                            expect(aircraftFormulas.f[9].ewgd(1, value.x, 1)).toBeCloseTo(value.y);
                        }
                    });
                    it('works out ground effect on wing efficiency', function () {
                        kgd = aircraftFormulas.f[9].ewgd(1, h, b);
                        ewgd = aircraftFormulas.f[9].ewgd(ew, h, b);
                        expect(ewgd).toBeCloseTo(ew * kgd);
                    });
                });
            });
        });
        describe('G: Drag analysis', function () {
            describe('1: Drag area', function () {
                var cdf, af, cdw, sw;
                beforeEach(function () {
                    cdf = random(0.01, 0.10);
                    af = random(1, 5);
                    cdw = random(0.001, 0.010);
                    sw = random(10, 50);
                    ad = aircraftFormulas.g[1].ad(cdf, af, cdw, sw);
                });
                it('solves for pressure drag coefficient', function () {
                    expect(aircraftFormulas.g[1].cdf(ad, af, cdw, sw)).toBeCloseTo(cdf);
                });
                it('solves for frontal area', function () {
                    expect(aircraftFormulas.g[1].af(ad, cdf, cdw, sw)).toBeCloseTo(af);
                });
                it('solves for skin drag coefficient', function () {
                    expect(aircraftFormulas.g[1].cdw(ad, cdf, af, sw)).toBeCloseTo(cdw);
                });
                it('solves for wetted area', function () {
                    expect(aircraftFormulas.g[1].sw(ad, cdf, af, cdw)).toBeCloseTo(sw);
                });
            });
        });
        describe('J: Equation of state', function () {
            var r, p;
            beforeEach(function () {
                rho = random(0.002377, 0.0005);
                r = random(390, 518);
                p = aircraftFormulas.j[1].p(rho, r);
            });
            it('solves for rho', function () {
                expect(aircraftFormulas.j[1].solve({p: p, r: r}).rho).toBeCloseTo(rho);
            });
            it('solves for rankine', function () {
                expect(aircraftFormulas.j[1].r(p, rho)).toBeCloseTo(r);
            });
            describe('Density ratio', function () {
                beforeEach(function () {
                    sigma = aircraftFormulas.j[1].sigma(rho);
                });
                it('solves for rho', function () {
                    expect(aircraftFormulas.j[1].solve({sigma: sigma}).rho).toBeCloseTo(rho);
                });
            });
        });
    });
}());
