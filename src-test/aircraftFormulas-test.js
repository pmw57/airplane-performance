/*jslint browser:true */
/*globals aircraftFormulas, describe, describe, beforeEach, it, xit, expect */
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
        g = random(1, 15),
        s = random(10, 30) * random(3, 7),
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
        bhp = 150;
    describe('Formulas are provided as an aircraftFormulas object', function () {
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
        it('has a formula object to contain other solutions, called all', function () {
            expect(aircraftFormulas[1].all[0]).toBeDefined();
        });
        it('has an overall formulas object to contain all solutions', function () {
            expect(aircraftFormulas.all).toBeDefined();
        });
    });
    describe('Formula 1: A force balanced along the flight path', function () {
        var d;
        beforeEach(function () {
            d = aircraftFormulas[1].d(w, g);
        });
        it('solves for weight', function () {
            expect(aircraftFormulas[1].w(d, g)).toBeCloseTo(w);
        });
        it('solves for glide angle', function () {
            expect(aircraftFormulas[1].g(d, w)).toBeCloseTo(g);
        });
    });
    describe('Formula 2: Lift is a similar normal to the flight path', function () {
        var l;
        beforeEach(function () {
            l = aircraftFormulas[2].l(w, g);
        });
        it('is equivalent to drag times cos/sin of the glide angle', function () {
            var angle = g * Math.TAU / 360,
                actual = aircraftFormulas[1].d(w, g) * Math.cos(angle) / Math.sin(angle);
            expect(aircraftFormulas[2].l(w, g)).toBeCloseTo(actual);
        });
        it('solves for weight', function () {
            expect(aircraftFormulas[2].w(l, g)).toBe(w);
        });
        it('solves for glide angle', function () {
            expect(aircraftFormulas[2].g(l, w)).toBeCloseTo(g);
        });
    });
    describe('Formula 3: Coefficient of lift from dynamic pressure and wing area', function () {
        var dynamicPressure, l, cl;
        beforeEach(function () {
            dynamicPressure = 0.5 * rho * vfs * vfs;
            l = aircraftFormulas[2].l(w, g);
            cl = aircraftFormulas[3].cl(l, rho, vfs, s);
        });
        it('is lift over dynamic pressure and wing area', function () {
            expect(cl).toBe(l / (dynamicPressure * s));
        });
        it('solves for air density', function () {
            expect(aircraftFormulas[3].rho(cl, l, vfs, s)).toBeCloseTo(rho);
        });
        it('solves for lift', function () {
            expect(aircraftFormulas[3].l(cl, rho, vfs, s)).toBeCloseTo(l);
        });
        it('solves for velocity (ft/sec)', function () {
            expect(aircraftFormulas[3].vfs(cl, l, rho, s)).toBeCloseTo(vfs);
        });
        it('solves for wing area', function () {
            expect(aircraftFormulas[3].s(cl, l, rho, vfs)).toBeCloseTo(s);
        });
    });
    describe('Formula 4: Coefficient of drag is from dynamic pressure and wing area', function () {
        var d, l, cl, cd;
        beforeEach(function () {
            d = aircraftFormulas[1].d(w, g);
            l = aircraftFormulas[2].l(w, g);
            cl = aircraftFormulas[3].cl(l, rho, vfs, s);
            cd = aircraftFormulas[4].cd(d, rho, vfs, s);
        });
        it('has the same ratio between lift and drag, as for their coefficients', function () {
            expect(cl / cd).toBeCloseTo(l / d);
        });
        it('solves for air density', function () {
            expect(aircraftFormulas[4].rho(cd, d, vfs, s)).toBeCloseTo(rho);
        });
        it('solves for drag', function () {
            expect(aircraftFormulas[4].d(cd, rho, vfs, s)).toBeCloseTo(d);
        });
        it('solves for velocity (ft/sec)', function () {
            expect(aircraftFormulas[4].vfs(cd, d, rho, s)).toBeCloseTo(vfs);
        });
        it('solves for wing area', function () {
            expect(aircraftFormulas[4].s(cd, d, rho, vfs)).toBeCloseTo(s);
        });
    });
    describe('Formula 5: Drag from velocity as mph using density ratio', function () {
        var d, cd;
        beforeEach(function () {
            d = aircraftFormulas[1].d(w, g);
            cd = aircraftFormulas[4].cd(d, rho, vfs, s);
            d = aircraftFormulas[4].d(rho, cd, vfs, s);
        });
        it('is equivalent to Formula 4', function () {
            expect(aircraftFormulas[5].d(sigma, cd, s, v)).toBeCloseTo(w * Math.sin(g / 360 * Math.TAU));
        });
        it('solves for density ratio', function () {
            expect(aircraftFormulas[5].sigma(d, cd, s, v)).toBeCloseTo(sigma);
        });
        it('solves for coefficient of drag', function () {
            expect(aircraftFormulas[5].cd(d, sigma, s, v)).toBeCloseTo(cd);
        });
        it('solves for wing area', function () {
            expect(aircraftFormulas[5].s(d, sigma, cd, v)).toBeCloseTo(s);
        });
        it('solves for velocity (mph)', function () {
            expect(aircraftFormulas[5].v(d, sigma, cd, s)).toBeCloseTo(v);
        });
    });
    describe('Formula 6: Lift from velocity as mph using density ratio', function () {
        var l, cl;
        beforeEach(function () {
            l = aircraftFormulas[2].l(w, g);
            cl = aircraftFormulas[3].cl(l, rho, vfs, s);
            l = aircraftFormulas[3].l(rho, cl, vfs, s);
        });
        it('is equivalent to Formula 5', function () {
            expect(aircraftFormulas[6].l(sigma, cl, s, v)).toBeCloseTo(w * Math.cos(g / 360 * Math.TAU));
        });
        it('solves for density ratio', function () {
            expect(aircraftFormulas[6].sigma(l, cl, s, v)).toBeCloseTo(sigma);
        });
        it('solves for coefficient of drag', function () {
            expect(aircraftFormulas[6].cl(l, sigma, s, v)).toBeCloseTo(cl);
        });
        it('solves for wing area', function () {
            expect(aircraftFormulas[6].s(l, sigma, cl, v)).toBeCloseTo(s);
        });
        it('solves for velocity (mph)', function () {
            expect(aircraftFormulas[6].v(l, sigma, cl, s)).toBeCloseTo(v);
        });
    });
    describe('Formula 7: Using the small angle approximation to get wing loading', function () {
        var l, cl, ws;
        beforeEach(function () {
            g = 1; // using a small angle
            l = aircraftFormulas[2].l(w, g);
            cl = aircraftFormulas[3].cl(l, rho, vfs, s);
            l = aircraftFormulas[6].l(sigma, cl, s, v);
            ws = aircraftFormulas[7].ws(sigma, cl, v);
        });
        it('should be close to formula 6 about lift from velocity as mph', function () {
            expect(w / s).toBeCloseTo(l / s);
        });
        it('solves for density ratio', function () {
            expect(aircraftFormulas[7].sigma(ws, cl, v)).toBeCloseTo(sigma);
        });
        it('solves for coefficient of lift', function () {
            expect(aircraftFormulas[7].cl(ws, sigma, v)).toBeCloseTo(cl);
        });
        it('solves for velocity', function () {
            expect(aircraftFormulas[7].v(ws, sigma, cl)).toBeCloseTo(v);
        });
    });
    describe('Formula 40: change in momentum vs pressure jump', function () {
        var t;
        beforeEach(function () {
            t = aircraftFormulas[40].t(m, v3, v);
        });
        it('solves for thrust from velocity', function () {
            expect(aircraftFormulas[40].t(m, v3, v)).toBe(t);
        });
        it('solves for mass flow rate', function () {
            expect(aircraftFormulas[40].m(t, v3, v)).toBeCloseTo(m);
        });
        it('solves for slipstream velocity', function () {
            expect(aircraftFormulas[40].v3(t, m, v)).toBe(v3);
        });
        it('solves for freestream velocity', function () {
            expect(aircraftFormulas[40].v(t, m, v3)).toBe(v);
        });
    });
    describe('Formula 41: Upstream propeller pressure increase', function () {
        var pdi, p1i;
        beforeEach(function () {
            pdi = aircraftFormulas[41].pdi(pd, rho, v);
            p1i = aircraftFormulas[41].p1i(p1, rho, vp);
        });
        it('solves for pressure differential', function () {
            expect(aircraftFormulas[41].pd(pdi, rho, v)).toBeCloseTo(pd);
        });
        it('solves for pressure density from differential increase', function () {
            expect(aircraftFormulas[41].rho(pdi, pd, v)).toBeCloseTo(rho);
        });
        it('solves for velocity from differential increase', function () {
            expect(aircraftFormulas[41].v(pdi, pd, rho)).toBeCloseTo(v);
        });
        it('solves for pressure before propeller', function () {
            expect(aircraftFormulas[41].p1(p1i, rho, vp)).toBeCloseTo(p1);
        });
        it('solves for pressure density from differential increase', function () {
            expect(aircraftFormulas[41].rho(p1i, p1, vp)).toBeCloseTo(rho);
        });
        it('solves for velocity from differential increase', function () {
            expect(aircraftFormulas[41].v(p1i, p1, rho)).toBeCloseTo(vp);
        });
    });
    describe('Formula 42: Downstream propeller pressure', function () {
        beforeEach(function () {
            p2 = aircraftFormulas[42].p2(pd, rho, vp, v3);
        });
        it('solves for pressure differential', function () {
            expect(aircraftFormulas[42].pd(p2, rho, vp, v3)).toBeCloseTo(pd);
        });
        it('solves for pressure density', function () {
            expect(aircraftFormulas[42].rho(p2, pd, vp, v3, rho)).toBeCloseTo(rho);
        });
        it('solves for propeller velocity', function () {
            expect(aircraftFormulas[42].vp(p2, pd, rho, v3)).toBeCloseTo(vp);
        });
        it('solves for slipstream velocity', function () {
            expect(aircraftFormulas[42].v3(p2, pd, rho, vp)).toBeCloseTo(v3);
        });
    });
    describe('Formula 43: Propeller pressure jump', function () {
        beforeEach(function () {
            p2 = aircraftFormulas[43].p2(p1, rho, v3, v);
        });
        it('solves for upstream pressure', function () {
            expect(aircraftFormulas[43].p1(p2, rho, v3, v)).toBeCloseTo(p1);
        });
        it('solves for pressure density', function () {
            expect(aircraftFormulas[43].rho(p1, p2, v3, v)).toBeCloseTo(rho);
        });
        it('solves for slipstream velocity', function () {
            expect(aircraftFormulas[43].v3(p1, p2, rho, v)).toBeCloseTo(v3);
        });
        it('solves for freestream velocity', function () {
            expect(aircraftFormulas[43].v(p1, p2, rho, v3)).toBeCloseTo(v);
        });
    });
    describe('Formula 44: Thrust force', function () {
        var t;
        beforeEach(function () {
            t = aircraftFormulas[44].t(rho, v3, v, ap);
        });
        it('solves for pressure density', function () {
            expect(aircraftFormulas[44].rho(t, v3, v, ap)).toBeCloseTo(rho);
        });
        it('solves for slipstream velocity', function () {
            expect(aircraftFormulas[44].v3(t, rho, v, ap)).toBeCloseTo(v3);
        });
        it('solves for freestream velocity', function () {
            expect(aircraftFormulas[44].v(t, rho, v3, ap)).toBeCloseTo(v);
        });
        it('solves for propeller area', function () {
            expect(aircraftFormulas[44].ap(t, rho, v3, v)).toBeCloseTo(ap);
        });
    });
    describe('Formula 45: Prop velocity', function () {
        beforeEach(function () {
            vp = aircraftFormulas[45].vp(v3, v);
        });
        it('solves for freestream velocity', function () {
            expect(aircraftFormulas[45].v(vp, v3)).toBeCloseTo(v);
        });
    });
    describe('Formula 46: Slipstream velocity', function () {
        beforeEach(function () {
            vp = aircraftFormulas[45].vp(v3, v);
        });
        it('solves for a reworking of #45', function () {
            expect(aircraftFormulas[46].v3(vp, v)).toBeCloseTo(v3);
        });
    });
    describe('Formula 47: Available propeller thrust', function () {
        var t;
        beforeEach(function () {
            t = aircraftFormulas[47].t(rho, ap, vp, v);
        });
        it('solves for pressure density', function () {
            expect(aircraftFormulas[47].rho(t, ap, vp, v)).toBeCloseTo(rho);
        });
        it('solves for propeller area', function () {
            expect(aircraftFormulas[47].ap(t, rho, vp, v)).toBeCloseTo(ap);
        });
        it('solves for propeller velocity', function () {
            expect(aircraftFormulas[47].vp(t, rho, ap, v)).toBeCloseTo(vp);
        });
        it('solves for freestream velocity', function () {
            expect(aircraftFormulas[47].v(t, rho, ap, vp)).toBeCloseTo(v);
        });
    });
    // TODO: Formula 48 will be a check that's done later on
    describe('Formula 49: Engine power at shaft', function () {
        var pshaft;
        beforeEach(function () {
            pshaft = aircraftFormulas[49].pshaft(rho, ap, vp, v);
        });
        it('solves for pressure density', function () {
            expect(aircraftFormulas[49].rho(pshaft, ap, vp, v)).toBeCloseTo(rho);
        });
        it('solves for propeller area', function () {
            expect(aircraftFormulas[49].ap(pshaft, rho, vp, v)).toBeCloseTo(ap);
        });
        it('solves for propeller velocity', function () {
            expect(aircraftFormulas[49].vp(pshaft, rho, ap, v)).toBeCloseTo(vp);
        });
        it('solves for freestream velocity', function () {
            expect(aircraftFormulas[49].v(pshaft, rho, ap, vp)).toBeCloseTo(v);
        });
    });
    describe('Formula 50: Engine power', function () {
        beforeEach(function () {
            bhp = aircraftFormulas[50].bhp(sigma, dp, v, eta);
        });
        it('solves for density ratio', function () {
            expect(aircraftFormulas[50].sigma(bhp, dp, v, eta)).toBeCloseTo(sigma);
        });
        it('solves for propeller diameter', function () {
            expect(aircraftFormulas[50].dp(bhp, sigma, v, eta)).toBeCloseTo(dp);
        });
        it('solves for velocity', function () {
            expect(aircraftFormulas[50].v(bhp, sigma, dp, eta)).toBeCloseTo(v);
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
            expect(aircraftFormulas[51].bhp(vprop, sigma, dp)).toBeCloseTo(bhp);
        });
        it('solves for density ratio', function () {
            expect(aircraftFormulas[51].sigma(vprop, bhp, dp)).toBeCloseTo(sigma);
        });
        it('solves for propeller diameter', function () {
            expect(aircraftFormulas[51].dp(vprop, bhp, sigma)).toBeCloseTo(dp);
        });
    });
    describe('Formula 52: Dimensionless velocity', function () {
        var vhat;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
        });
        it('solves for propeller efficiency', function () {
            expect(aircraftFormulas[52].eta(vhat)).toBeCloseTo(eta);
        });
    });
    describe('Formula 53: Cubic equation for dimensionless velocity', function () {
        var vhat;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
        });
        it('shows that eta and vhat are solved as close to zero', function () {
            expect(aircraftFormulas[53].zero(eta, vhat)).toBeCloseTo(0);
        });
    });
    describe('Formula 54: Solution to cubic equation for dimensionless velocity', function () {
        var vhat;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
        });
        it('solves for propeller efficiency', function () {
            expect(aircraftFormulas[54].eta(vhat)).toBeCloseTo(eta);
        });
    });
    describe('Formula 55: Nondimensional advance ratio (per second)', function () {
        var j;
        beforeEach(function () {
            j = aircraftFormulas[55].j(v, n, dp);
        });
        it('solves for velocity', function () {
            expect(aircraftFormulas[55].v(j, n, dp)).toBeCloseTo(v);
        });
        it('solves for propeller rotation', function () {
            expect(aircraftFormulas[55].n(j, v, dp)).toBeCloseTo(n);
        });
        it('solves for propeller diameter', function () {
            expect(aircraftFormulas[55].dp(j, v, n)).toBeCloseTo(dp);
        });
    });
    describe('Formula 56: Nondimensional advance ratio (per hour)', function () {
        var j;
        beforeEach(function () {
            j = aircraftFormulas[56].j(v, rpm, dp);
        });
        it('solves for velocity', function () {
            expect(aircraftFormulas[56].v(j, rpm, dp)).toBeCloseTo(v);
        });
        it('solves for revolutions per minute', function () {
            expect(aircraftFormulas[56].rpm(j, v, dp)).toBeCloseTo(rpm);
        });
        it('solves for propeller diameter', function () {
            expect(aircraftFormulas[56].dp(j, v, rpm)).toBeCloseTo(dp);
        });
    });
    describe('Formula 57: Dimensionless power coefficient as ft-lb/sec', function () {
        var p, cp;
        beforeEach(function () {
            p = aircraftFormulas[49].pshaft(rho, ap, vp, v);
            cp = aircraftFormulas[57].cp(p, rho, n, dp);
        });
        it('solves for engine shaft power', function () {
            expect(aircraftFormulas[57].p(cp, rho, n, dp)).toBeCloseTo(p);
        });
        it('solves for density ratio', function () {
            expect(aircraftFormulas[57].rho(cp, p, n, dp)).toBeCloseTo(rho);
        });
        it('solves for propeller revolutions', function () {
            expect(aircraftFormulas[57].n(cp, p, rho, dp)).toBeCloseTo(n);
        });
        it('solves for propeller diameter', function () {
            expect(aircraftFormulas[57].dp(cp, p, rho, n)).toBeCloseTo(dp);
        });
    });
    describe('Formula 58: Dimensionless power coefficient as rpm', function () {
        var cp;
        beforeEach(function () {
            cp = aircraftFormulas[58].cp(bhp, rpm, dp);
        });
        it('solves for BHP', function () {
            expect(aircraftFormulas[58].bhp(cp, rpm, dp)).toBeCloseTo(bhp);
        });
        it('solves for density ratio', function () {
            expect(aircraftFormulas[58].rpm(cp, bhp, dp)).toBeCloseTo(rpm);
        });
        it('solves for propeller revolutions', function () {
            expect(aircraftFormulas[58].dp(cp, bhp, rpm)).toBeCloseTo(dp);
        });
    });
    describe('Formula 58: Dimensionless power coefficient as rpm', function () {
        var cp;
        beforeEach(function () {
            cp = aircraftFormulas[58].cp(bhp, rpm, dp);
        });
        it('solves for BHP', function () {
            expect(aircraftFormulas[58].bhp(cp, rpm, dp)).toBeCloseTo(bhp);
        });
        it('solves for density ratio', function () {
            expect(aircraftFormulas[58].rpm(cp, bhp, dp)).toBeCloseTo(rpm);
        });
        it('solves for propeller revolutions', function () {
            expect(aircraftFormulas[58].dp(cp, bhp, rpm)).toBeCloseTo(dp);
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
            expect(aircraftFormulas[59].j(vhat, cp)).toBeCloseTo(j);
        });
        it('solves for power coefficient', function () {
            expect(aircraftFormulas[59].cp(vhat, j)).toBeCloseTo(cp);
        });
    });
    describe('Formula 60: Approximation of static thrust as ft-lb/sec', function () {
        var p, ts;
        beforeEach(function () {
            p = aircraftFormulas[49].pshaft(rho, ap, vp, v);
            ts = aircraftFormulas[60].ts(rho, dp, p);
        });
        it('solves for air density', function () {
            expect(aircraftFormulas[60].rho(ts, dp, p)).toBeCloseTo(rho);
        });
        it('solves for propeller diameter', function () {
            expect(aircraftFormulas[60].dp(ts, rho, p)).toBeCloseTo(dp);
        });
        it('solves for propeller engine power', function () {
            expect(aircraftFormulas[60].pshaft(ts, rho, dp)).toBeCloseTo(p);
        });
    });
    describe('Formula 61: Approximation of static thrust as rpm', function () {
        var ts;
        beforeEach(function () {
            ts = aircraftFormulas[61].ts(rho, dp, bhp);
        });
        it('solves for pressure density', function () {
            expect(aircraftFormulas[61].rho(ts, dp, bhp)).toBeCloseTo(rho);
        });
        it('solves for propeller diameter', function () {
            expect(aircraftFormulas[61].dp(ts, rho, bhp)).toBeCloseTo(dp);
        });
        it('solves for BHP', function () {
            expect(aircraftFormulas[61].bhp(ts, rho, dp)).toBeCloseTo(bhp);
        });
    });
    describe('Formula 62: Ideal thrust from an engine-propeller combination', function () {
        var vhat, that;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
            that = aircraftFormulas[62].that(eta, vhat);
        });
        it('solves for propeller efficiency', function () {
            expect(aircraftFormulas[62].eta(that, vhat)).toBeCloseTo(eta);
        });
        it('solves for dimensionless speed', function () {
            expect(aircraftFormulas[62].vhat(that, eta)).toBeCloseTo(vhat);
        });
    });
    describe('Formula 63: Idealised thrust ratio from dimensionless velocity', function () {
        var vhat, that;
        beforeEach(function () {
            vhat = aircraftFormulas[52].vhat(eta);
            that = aircraftFormulas[62].that(eta, vhat);
        });
        it('solves for ideal thrust ratio', function () {
            expect(aircraftFormulas[63].that(vhat)).toBeCloseTo(that);
        });
    });
    describe('Formula 64: Propeller tip mach number', function () {
        var mp;
        beforeEach(function () {
            mp = aircraftFormulas[64].mp(rpm, dp);
        });
        it('solves for rpm', function () {
            expect(aircraftFormulas[64].rpm(mp, dp)).toBeCloseTo(rpm);
        });
        it('solves for propeller diameter', function () {
            expect(aircraftFormulas[64].dp(mp, rpm)).toBeCloseTo(dp);
        });
    });
    describe('Appendix', function () {
        describe('D', function () {
            function convertToRankine(f) {
                return f + 460;
            }
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
                    h0 = window.R * t0 / window.G;
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
                var h;
                beforeEach(function () {
                    h = Math.random() * 36240;
                        sigma = aircraftFormulas.d[12].sigma(h);
                });
                it('is a ratio of 1 at sealevel', function () {
                    expect(aircraftFormulas.d[12].sigma(0)).toBe(1);
                });
                it('is accurate to a height of 36240', function () {
                    expect(aircraftFormulas.d[12].sigma(36240)).toBeCloseTo(Math.pow(1 - 36240 / 145800, 4.265));
                });
                it('solves for height', function () {
                    expect(aircraftFormulas.d[12].h(sigma)).toBeCloseTo(h);
                });
            });
            describe('14: Variation of density ratio with altitude from 32640 ft to 82000 ft', function () {
                var h;
                beforeEach(function () {
                    h = Math.random() * (82000 - 36240) + 36240;
                    sigma = aircraftFormulas.d[14].sigma(h);
                });
            });
        });
    });
}());
