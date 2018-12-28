/*jslint browser:true */
/*global chart */

function aircraftFormulas(constants, solvePoly) {
    "use strict";

    Math.TAU = Math.PI * 2;
    var TAU = Math.TAU;
    function areaFromRadius(radius) {
        return 0.5 * TAU * radius * radius;
    }
    function radiusFromArea(area) {
        return Math.sqrt(area * 2 / TAU);
    }
    var sea_level_density = 0.0023769;
    // todo: consider using a dynamic pressure function for the velocity instead
    // currently, airDensity provides an understanding of where 1/391 comes from.
    var airDensity = 0.5 * sea_level_density * Math.pow(5280 / 3600, 2);
    var bhpPerMin = 33000;
    var bhpPerHour = bhpPerMin * 60;
    var bhpPerSec = bhpPerMin / 60; // 550
    var hpMPH = bhpPerHour / 5280;
    var speedOfSound = 1100; // ft/sec
    var formulas = [
            [
            // todo: remove the need for "custom" objects from test file
            // todo: Should formulas with density ratio result in removing
            // simplified formulas without density ratio?

            // Relation 1: CL, V, W/S
            // Lift Coefficient, Airspeed, Wing Loading
            function weFromWWu(w, wu) {
                return w - wu;
            },
            function wFromWeWu(we, wu) {
                return we + wu;
            },
            function wuFromWeW(we, w) {
                return w - we;
            },

            // ws handled by Formula 7
            // Crosschecks for relation 11 use Formula 7 too

            // Relation 2: S, W/S, W
            // Wing Area, Wing Loading, Gross Weight
            function sFromWsW(ws, w) {
                return w / ws;
            },
            function wsFromWS(w, s) {
                return w / s;
            },
            function wFromWsS(ws, s) {
                return ws * s;
            },
            // Relation 3: S, be, eAR, ce
            // Wing Area, Effective Span, Effetive Aspect Ratio, Effective Chord
            // ar function defined in Formula 14
            // ear function defined in Formula 15
            function cFromSB(s, b) {
                return s / b;
            },
            function bFromSC(s, c) {
                return s / c;
            },
            function sFromBC(b, c) {
                return b * c;
            },
            // Relation 4: be, W/be, W
            // Effective Span, Effective Span Loading, Gross Weight
            // wbe function defined in Formula 21

            // Relation 5: AD, Vmax, THPa
            // Drag area, maximum level speed, available thrust horsepower
            function thpaFromAdVmax(ad, vmax) {
                return ad * Math.pow(vmax, 3) * airDensity / hpMPH;
            },
            function adFromThpaVmax(thpa, vmax) {
                return thpa / Math.pow(vmax, 3) * hpMPH / airDensity;
            },
            function vmaxFromThpaAd(thpa, ad) {
                return Math.pow(thpa / ad * hpMPH / airDensity, 1 / 3);
            },
            function thpaFromBhpEta(bhp, eta) {
                return bhp * eta;
            },
            function bhpFromThpaEta(thpa, eta) {
                return thpa / eta;
            },
            function etaFromThpaBhp(thpa, bhp) {
                return thpa / bhp;
            },
            // Relation 6: CD0, AD, S
            // Zero-lift drag, drag area, and wing area
            function dFromAdV(ad, v) {
                return ad * Math.pow(v, 2) * airDensity;
            },
            function adFromDV(d, v) {
                return d / (Math.pow(v, 2) * airDensity);
            },
            function vFromDAD(d, ad) {
                return Math.sqrt(d / (ad * airDensity));
            },
            // ad/cd0/s handled by Formula 19
            function dFromCd0SV(cd0, s, v) {
                return cd0 * s * Math.pow(v, 2) * airDensity;
            },
            function cd0FromDSV(d, s, v) {
                return d / (s * Math.pow(v, 2) * airDensity);
            },
            function sFromDCd0V(d, cd0, v) {
                return d / (cd0 * Math.pow(v, 2) * airDensity);
            },
            function vFromDCd0S(d, cd0, s) {
                return Math.sqrt(d / (cd0 * s * airDensity));
            },
            // Relation 7: AD, VminS, W/be, THPmin, Dmin
            // Drag Area, Airspeed for Minimum Sink, Effective Span Loading,
            // Minimum power required for Level Flight, Minimum Drag

            // vmins handled by Formula 24
            // thpmin handled by Formula 33
            // dmin handled by Formula 30

            // Relation 8: RSmin, THPmin, W
            // Minimum Sink Rate, Minimum Power Required
            // for Level Flight, weight
            function thpFromRsW(rs, w) {
                return rs * w / 33000;
            },
            function rsFromThpW(thp, w) {
                return 33000 * thp / w;
            },
            function wFromThpRs(thp, rs) {
                return 33000 * thp / rs;
            },
            function rsminFromThpminW(thpmin, w) {
                return 33000 * thpmin / w;
            },
            function thpminFromRsminW(rsmin, w) {
                return rsmin * w / 33000;
            },
            function wFromRsminThpmin(rsmin, thpmin) {
                return 33000 * thpmin / rsmin;
            },
            // the following are similar to Formula 38
            function thpaFromWRcRs(rc, rs, w) {
                return w / 33000 * (rc + rs);
            },
            function wFromThpaRcRs(thpa, rc, rs) {
                return 33000 * thpa / (rc + rs);
            },
            function rcFromThpaWRs(thpa, w, rs) {
                return 33000 * thpa / w - rs;
            },
            function rsFromThpaWR(thpa, w, rc) {
                return 33000 * thpa / w - rc;
            },
            // Relation 9: AD, be, (L/D)max
            // Drag Area, Effective Span, Maximum Lift-to-Drag Ratio
            // handled in Formula 29

            // Relation 10: CLminS, ad, ce
            // Drag Area, Effective Span, Maximum Lift-to-Drag Ratio
            // clmins handled in Formula 19
            // clmaxld handled in Formula 27

            // Relation 11: W, BHP, RCmax
            // Weight, Engine Brake Horsepower, Ideal Maximum Rate of Climb
            function bhpFromRcmaxW(rcmax, w) {
                return rcmax * w / 33000;
            },
            function rcmaxFromBhpW(bhp, w) {
                return bhp * 33000 / w;
            },
            function wFromBhpRcmax(bhp, rcmax) {
                return bhp * 33000 / rcmax;
            }
            // Relation 12: Ts, BHP, Vprop, Dp
            // Static Thrust, Engine Brake Horsepower, Reference Propeller
            // Airspeed for 74% Efficiency, Propeller Diameter
            // ts and vprop handled by Formulas 61 and 51
        ],
        [ // formula 1
            function dFromWThetag(w, thetag) {
                return w * Math.sin(thetag * Math.TAU / 360);
            },
            function wFromDThetag(d, thetag) {
                return d / Math.sin(thetag * Math.TAU / 360);
            },
            function thetagFromDW(d, w) {
                return Math.asin(d / w) * 360 / Math.TAU;
            },
            function dFromSigmaCdSV(sigma, cd, s, v) {
                return sigma * airDensity * cd * s * Math.pow(v, 2);
            },
            function sigmaFromDCdSV(d, cd, s, v) {
                return d / (airDensity * cd * s * Math.pow(v, 2));
            },
            function cdFromSigmaCdSV(d, sigma, s, v) {
                return d / (sigma * airDensity * s * Math.pow(v, 2));
            },
            function sFromSigmaCdSV(d, sigma, cd, v) {
                return d / (sigma * airDensity * cd * Math.pow(v, 2));
            },
            function vFromSigmaCdSV(d, sigma, cd, s) {
                return Math.sqrt(d / (sigma * airDensity * cd * s));
            }
            // todo: lift, airspeed, and weight
        ],
        [ // Formula 2
            function lFromWThetag(w, thetag) {
                return w * Math.cos(thetag * Math.TAU / 360);
            },
            function wFromLThetag(l, thetag) {
                return l / Math.cos(thetag * Math.TAU / 360);
            },
            function thetagFromLW(l, w) {
                return Math.acos(l / w) / Math.TAU * 360;
            }
        ],
        [ // Formula 3
            function clFromLRhoVfsS(l, rho, vfs, s) {
                return l / (0.5 * rho * vfs * vfs * s);
            },
            function lFromCLRhoVfsS(cl, rho, vfs, s) {
                return 0.5 * cl * rho * vfs * vfs * s;
            },
            function rhoFromClLVfsS(cl, l, vfs, s) {
                return 2 * l / (cl * vfs * vfs * s);
            },
            function vfsFromClLRhoS(cl, l, rho, s) {
                return Math.sqrt(2 * l / (cl * rho * s));
            },
            function sFromClLRhoVfs(cl, l, rho, vfs) {
                return 2 * l / (cl * rho * vfs * vfs);
            },
            function vFromVfs(vfs) {
                return vfs * window.CONSTANTS.MPH_TO_FPS;
            },
            function vfsFromV(v) {
                return v * window.CONSTANTS.FPS_TO_MPH;
            }
        ],
        [ // Formula 4
            function cdFromDRhoVfsS(d, rho, vfs, s) {
                return d / (0.5 * rho * vfs * vfs * s);
            },
            function dFromCdRhoVfsS(cd, rho, vfs, s) {
                return 0.5 * rho * cd * vfs * vfs * s;
            },
            function rhoFromCdDVfsS(cd, d, vfs, s) {
                return d / (0.5 * cd * vfs * vfs * s);
            },
            function vfsFromCdDRhoS(cd, d, rho, s) {
                return Math.sqrt(d / (0.5 * rho * cd * s));
            },
            function sFromCdDRhoVfs(cd, d, rho, vfs) {
                return d / (0.5 * rho * cd * vfs * vfs);
            }
        ],
        [ // Formula 5
            function dFromSigmaCdSV(sigma, cd, s, v) {
                return sigma * cd * s * v * v * airDensity;
            },
            function sigmaFromdCdSV(d, cd, s, v) {
                return d / (cd * s * v * v * airDensity);
            },
            function cdFromDSigmaSV(d, sigma, s, v) {
                return d / (sigma * s * v * v * airDensity);
            },
            function sFromDSigmaCdV(d, sigma, cd, v) {
                return d / (sigma * cd * v * v * airDensity);
            },
            function vFromDSigmaCdS(d, sigma, cd, s) {
                return Math.sqrt(d / (sigma * cd * s * airDensity));
            }
        ],
        [ // Formula 6
            function lFromSigmaClSV(sigma, cl, s, v) {
                return sigma * cl * s * v * v * airDensity;
            },
            function sigmaFromLClSV(l, cl, s, v) {
                return l / (cl * s * v * v * airDensity);
            },
            function clFromLSigmaSV(l, sigma, s, v) {
                return l / (sigma * s * v * v * airDensity);
            },
            function sFromLSigmaClV(l, sigma, cl, v) {
                return l / (sigma * cl * v * v * airDensity);
            },
            function vFromLSigmaClS(l, sigma, cl, s) {
                return Math.sqrt(l / (sigma * cl * s * airDensity));
            }
        ],
        [ // Formula 7
            function wsFromWS(w, s) {
                return w / s;
            },
            function wFromWsS(ws, s) {
                return ws * s;
            },
            function sFromWsW(ws, w) {
                return w / ws;
            },
            function wsFromSigmaClV(sigma, cl, v) {
                return sigma * cl * v * v * airDensity;
            },
            function sigmaFromWsClV(ws, cl, v) {
                return ws / (cl * v * v * airDensity);
            },
            function clFromWsSigmaV(ws, sigma, v) {
                return ws / (sigma * v * v * airDensity);
            },
            function vFromWsSigmaCl(ws, sigma, cl) {
                return Math.sqrt(ws / (sigma * cl * airDensity));
            },
            // Relation 1 clmax
            function wsFromSigmaClmaxVs0(sigma, clmax, vs0) {
                return sigma * clmax * vs0 * vs0 * airDensity;
            },
            function sigmaFromWsClmaxVs0(ws, clmax, vs0) {
                return ws / (clmax * vs0 * vs0 * airDensity);
            },
            function clmaxFromWsSigmaVs0(ws, sigma, vs0) {
                return ws / (sigma * vs0 * vs0 * airDensity);
            },
            function vs0FromWsSigmaCl(ws, sigma, clmax) {
                return Math.sqrt(ws / (sigma * clmax * airDensity));
            },
            // Relation 11 crosschecks
            function clminsFromWsVmins(ws, vmins) {
                return ws / (vmins * vmins * airDensity);
            },
            function wsFromClminsVmins(clmins, vmins) {
                return clmins * vmins * vmins * airDensity;
            },
            function vminsFromClminsWs(clmins, ws) {
                return Math.sqrt(ws / (clmins * airDensity));
            }
        ],
        [ // Formula 8
            function thetagFromSigmaCdSV(sigma, cd, s, v) {
                var densityRatio = sigma * airDensity;
                return 360 / Math.TAU * densityRatio * cd * s * v * v;
            },
            function sigmaFromThetagCdSV(thetag, cd, s, v) {
                var sigma = Math.TAU / 360 *
                    thetag / (airDensity * cd * s * v * v);
                return sigma;
            },
            function cdFromThetagSigmaSV(thetag, sigma, s, v) {
                var densityRatio = sigma * airDensity;
                return Math.TAU / 360 * thetag / (densityRatio * s * v * v);
            },
            function sFromThetagSigmaCdV(thetag, sigma, cd, v) {
                var densityRatio = sigma * airDensity;
                return Math.TAU / 360 * thetag / (densityRatio * cd * v * v);
            },
            function vFromThetagSigmaCdS(thetag, sigma, cd, s) {
                var densityRatio = sigma * airDensity;
                var v = Math.sqrt(Math.TAU / 360 *
                    thetag / (densityRatio * cd * s));
                return v;
            }
        ],
        [ // Formula 9
            function thetagFromCdCl(cd, cl) {
                return 360 / Math.TAU * cd / cl;
            },
            function cdFromThetagCl(thetag, cl) {
                return Math.TAU / 360 * thetag * cl;
            },
            function clFromThetagCd(thetag, cd) {
                return 360 / Math.TAU * cd / thetag;
            }
        ],
        [ // Formula 10
            function rsFromSigmaCdSVW(sigma, cd, s, v, w) {
                var densityRatio = sigma * airDensity;
                return 5280 / 60 * v * densityRatio * cd * s * v * v / w;
            },
            function sigmaFromRsCdSVW(rs, cd, s, v, w) {
                var sigma = 60 / 5280 * rs *
                    w / (v * airDensity * cd * s * v * v);
                return sigma;
            },
            function cdFromRsSigmaSVW(rs, sigma, s, v, w) {
                var densityRatio = sigma * airDensity;
                return 60 / 5280 * rs * w / (v * densityRatio * s * v * v);
            },
            function sFromRsSigmaCdVW(rs, sigma, cd, v, w) {
                var densityRatio = sigma * airDensity;
                return 60 / 5280 * rs * w / (v * densityRatio * cd * v * v);
            },
            function vFromRsSigmaCdSW(rs, sigma, cd, s, w) {
                var densityRatio = sigma * airDensity;
                var v = Math.pow(60 / 5280 * rs *
                    w / (densityRatio * cd * s), 1 / 3);
                return v;
            },
            function wFromRsSigmaCdSV(rs, sigma, cd, s, v) {
                var densityRatio = sigma * airDensity;
                return 5280 / 60 * v * densityRatio * cd * s * v * v / rs;
            }
        ],
        [ // Formula 11
            function rsFromSigmaWSCdCl(sigma, w, s, cd, cl) {
                var densityRatio = sigma * airDensity;
                var rs = 5280 / 60 * Math.sqrt(1 / densityRatio * w / s) *
                    cd / Math.pow(cl, 3 / 2);
                return rs;
            },
            function sigmaFromRsWSCdCl(rs, w, s, cd, cl) {
                var sigma = Math.pow(5280 / 60 * Math.sqrt(1 / airDensity *
                    w / s) / rs * cd / Math.pow(cl, 3 / 2), 2);
                return sigma;
            },
            function wFromRsSigmaSCdCl(rs, sigma, s, cd, cl) {
                var densityRatio = sigma * airDensity;
                var w = Math.pow(60 / 5280 * rs * Math.sqrt(densityRatio), 2) *
                    s * Math.pow(Math.pow(cl, 3 / 2) / cd, 2);
                return w;
            },
            function sFromRsSigmaWCdCl(rs, sigma, w, cd, cl) {
                var densityRatio = sigma * airDensity;
                var s = Math.pow(5280 / 60, 2) / densityRatio *
                    w / Math.pow(rs, 2) * Math.pow(cd / Math.pow(cl, 3 / 2), 2);
                return s;
            },
            function cdFromRsSigmaWSCl(rs, sigma, w, s, cl) {
                var densityRatio = sigma * airDensity;
                var cd = 60 / 5280 * Math.sqrt(densityRatio) *
                    Math.sqrt(s / w) * rs * Math.pow(cl, 3 / 2);
                return cd;
            },
            function clFromRsSigmaWSCd(rs, sigma, w, s, cd) {
                var densityRatio = sigma * airDensity;
                var cl = Math.pow(5280 / 60 / Math.sqrt(densityRatio) *
                    Math.sqrt(w / s) / rs * cd, 2 / 3);
                return cl;
            }
        ],
        [ // Formula 12
            function cdFromCd0Cd1(cd0, cdi) {
                return cd0 + cdi;
            },
            function cd0FromCdCdi(cd, cdi) {
                return cd - cdi;
            },
            function cdiFromCdCd0(cd, cd0) {
                return cd - cd0;
            }
        ],
        [ // Formula 13
            function cdiFromClEAr(cl, e, ar) {
                return cl * cl / (Math.PI * e * ar);
            },
            function clFromCdiEAr(cdi, e, ar) {
                return Math.sqrt(cdi * (Math.PI * e * ar));
            },
            function eFromCdiClAr(cdi, cl, ar) {
                return cl * cl / (Math.PI * cdi * ar);
            },
            function arFromCdiClE(cdi, cl, e) {
                return cl * cl / (cdi * Math.PI * e);
            },
            function cdiFromClEar(cl, ear) {
                return cl * cl / (Math.PI * ear);
            },
            function clFromCdiEar(cdi, ear) {
                return Math.sqrt(cdi * (Math.PI * ear));
            },
            function earFromCdiCl(cdi, cl) {
                return cl * cl / (cdi * Math.PI);
            }
        ],
        [ // Formula 14
            function arFromBC(b, c) {
                return b / c;
            },
            function bFromArC(ar, c) {
                return ar * c;
            },
            function cFromArB(ar, b) {
                return b / ar;
            },
            function arFromBS(b, s) {
                return b * b / s;
            },
            function bFromArS(ar, s) {
                return Math.sqrt(ar * s);
            },
            function sFromArB(ar, b) {
                return b * b / ar;
            }
        ],
        [ // Formula 15
            function earFromEAr(e, ar) {
                return e * ar;
            },
            function eFromEarAr(ear, ar) {
                return ear / ar;
            },
            function arFromEarE(ear, e) {
                return ear / e;
            },
            function cdFromCd0ClEar(cd0, cl, ear) {
                return cd0 + cl * cl / (Math.PI * ear);
            },
            function cd0FromCdClEar(cd, cl, ear) {
                return cd - cl * cl / (Math.PI * ear);
            },
            function clFromCdCd0Ear(cd, cd0, ear) {
                return Math.sqrt((cd - cd0) * Math.PI * ear);
            },
            function earFromCdCd0Cl(cd, cd0, cl) {
                return cl * cl / (Math.PI * (cd - cd0));
            }
        ],
        [], // todo Formula 16 - working towards Formula 18
        [], // todo Formula 17 - working towards Formula 18
        [ // Formula 18
            function clminsFromEarCd0(ear, cd0) {
                return Math.sqrt(3 * Math.PI * ear * cd0);
            },
            function earFromClminsCd0(clmins, cd0) {
                return 1 / (3 * Math.PI) * Math.pow(clmins, 2) / cd0;
            },
            function cd0FromClminsEar(clmins, ear) {
                return Math.pow(clmins, 2) / (3 * Math.PI * ear);
            }
        ],
        [ // Formula 19
            function sFromAdCd0(ad, cd0) {
                return ad / cd0;
            },
            function adFromCd0S(cd0, s) {
                return cd0 * s;
            },
            function cd0FromAdS(ad, s) {
                return ad / s;
            },
            function ceFromCE(c, e) {
                return c / Math.sqrt(e);
            },
            function cFromCeE(ce, e) {
                return ce * Math.sqrt(e);
            },
            function eFromCeC(ce, c) {
                return Math.pow(c / ce, 2);
            },
            function clminsFromAdCe(ad, ce) {
                return Math.sqrt(3 * Math.PI) * Math.sqrt(ad) / ce;
            },
            function adFromClminsCe(clmins, ce) {
                return Math.pow(clmins * ce / Math.sqrt(3 * Math.PI), 2);
            },
            function ceFromClminsAd(clmins, ad) {
                return Math.sqrt(3 * Math.PI) / clmins * Math.sqrt(ad);
            }
        ],
        [ // Formula 20
            function beFromBE(b, e) {
                return b * Math.sqrt(e);
            },
            function bFromBeE(be, e) {
                return be / Math.sqrt(e);
            },
            function eFromBeB(be, b) {
                return Math.pow(be / b, 2);
            },
            function rsminFromWSigmaAdBe(w, sigma, ad, be) {
                var rsmin = 5280 / 60 * Math.sqrt(1 / airDensity) *
                    4 / Math.pow(3 * Math.PI, 3 / 4) * Math.sqrt(w / sigma) *
                    Math.pow(ad, 1 / 4) / Math.pow(be, 3 / 2);
                return rsmin;
            },
            function wFromRsminSigmaAdBe(rsmin, sigma, ad, be) {
                var w = Math.pow(rsmin * 60 / 5280 * Math.sqrt(airDensity) *
                    Math.pow(3 * Math.PI, 3 / 4) / (4 * Math.pow(ad, 1 / 4)) *
                    Math.pow(be, 3 / 2), 2) * sigma;
                return w;
            },
            function sigmaFromRsminWAdBe(rsmin, w, ad, be) {
                var sigma = Math.pow(
                    5280 / 60 * 4 / (Math.pow(
                        3 * Math.PI, 3 / 4) * Math.sqrt(airDensity) * rsmin
                    ) * Math.pow(ad, 1 / 4) / Math.pow(be, 3 / 2), 2) * w;
                return sigma;
            },
            function adFromRsminWSigmaBe(rsmin, w, sigma, be) {
                var ad = Math.pow(60 / 5280 * Math.pow(3 * Math.PI, 3 / 4) / 4 *
                    Math.sqrt(airDensity) * rsmin * Math.sqrt(sigma / w) *
                    Math.pow(be, 3 / 2), 4);
                return ad;
            },
            function beFromRsminWSigmaAd(rsmin, w, sigma, ad) {
                var be = Math.pow(5280 / 60 * 4 / Math.pow(3 * Math.PI, 3 / 4) /
                    (Math.sqrt(airDensity) * rsmin) * Math.sqrt(w / sigma) *
                    Math.pow(ad, 1 / 4), 2 / 3);
                return be;
            }
        ],
        [ // Formula 21
            function wbeFromWBe(w, be) {
                return w / be;
            },
            function wFromWbeBe(wbe, be) {
                return wbe * be;
            },
            function beFromWbeW(wbe, w) {
                return w / wbe;
            },
            function vminsFromWbeSigmaAd(wbe, sigma, ad) {
                var vmins = Math.sqrt(1 / airDensity) /
                    Math.pow(3 * Math.PI, 1 / 4) *
                    Math.sqrt(wbe) / Math.sqrt(sigma) /
                    Math.pow(ad, 1 / 4);
                return vmins;
            },
            function wbeFromVminsSigmaAd(vmins, sigma, ad) {
                var wbe = Math.pow(Math.pow(3 * Math.PI, 1 / 4) *
                    Math.sqrt(airDensity) * vmins *
                    Math.sqrt(sigma) * Math.pow(ad, 1 / 4), 2);
                return wbe;
            },
            function sigmaFromvMinsWBeAd(vmins, wbe, ad) {
                var sigma = wbe / (airDensity * Math.sqrt(3 * Math.PI) *
                    Math.pow(vmins, 2) * Math.sqrt(ad));
                return sigma;
            },
            function adFromVminsWBeSigma(vmins, wbe, sigma) {
                var ad = Math.pow(1 / (airDensity * sigma *
                    Math.sqrt(3 * Math.PI) * Math.pow(vmins, 2)) * wbe, 2);
                return ad;
            }
        ],
        [ // Formula 22
            function rsFromSigmaAdVWBe(sigma, ad, v, w, be) {
                var dragArea = sigma * airDensity * ad * Math.pow(v, 3) / w;
                var effectiveSpan = w / (Math.PI * sigma * airDensity *
                    v * Math.pow(be, 2));
                return (dragArea + effectiveSpan) * 5280 / 60;
            },
            function sigmaFromRsAdVWBe(rs, ad, v, w, be) {
                var a = 5280 / 60 * ad * Math.pow(v, 3) * airDensity / w;
                var b = -rs;
                var c = 5280 / 60 * w / (airDensity * Math.PI * v * be * be);
                return solvePoly([a, b, c])[1];
            },
            function adFromRsSigmaVWBe(rs, sigma, v, w, be) {
                var ad = (rs / 5280 * 60 -
                    w / airDensity / Math.PI / sigma / v / be / be) /
                    sigma / Math.pow(v, 3) / airDensity * w;
                return ad;
            },
            function vFromRsSigmaAdWBe(rs, sigma, ad, w, be) {
                var coeffs = [
                    sigma * ad * airDensity / w,
                    0,
                    0,
                    -60 / 5280 * rs,
                    w / (airDensity * Math.PI * sigma * be * be)
                ];
                return solvePoly(coeffs)[1];
            },
            function wFromRsSigmaAdVBe(rs, sigma, ad, v, be) {
                var coeffs = [
                    1 / (airDensity * Math.PI * sigma * v * be * be),
                    -60 / 5280 * rs,
                    sigma * ad * Math.pow(v, 3) * airDensity
                ];
                return solvePoly(coeffs)[0];
            },
            function beFromRsSigmaAdVW(rs, sigma, ad, v, w) {
                var be = Math.sqrt(
                    1 / (Math.PI * airDensity * v * sigma / w *
                        (60 / 5280 * rs -
                        airDensity * sigma * ad * Math.pow(v, 3) / w)
                    )
                );
                return be;
            }
        ],
        [ // Formula 23
            function sigmasdvFromSigmaAdVWBe(sigma, ad, v, w, be) {
                var densityRatio = sigma * airDensity;
                var sigmasdv = 5280 / 60 * 3 * densityRatio * ad * v * v / w -
                    w / (Math.PI * densityRatio * v * v * be * be);
                return sigmasdv;
            },
            function sigmaFromSigmasdvAdVWBe(sigmas_dv, ad, v, w, be) {
                var sigma = sigmas_dv /
                    (5280 / 60 * 3 * ad * v * v * airDensity / w -
                        w / (airDensity * Math.PI * v * v * be * be));
                return sigma;
            },
            function adFromSigmasdvSigmaVWBe(sigmas_dv, sigma, v, w, be) {
                var ad = 60 / 5280 * w / (3 * sigma * v * v * airDensity) *
                    (sigmas_dv + w /
                        (airDensity * Math.PI * sigma * v * v * be * be));
                return ad;
            },
            function wFromSigmasdvSigmaAdVBe(sigmas_dv, sigma, ad, v, be) {
                var coeffs = [
                    1 / (airDensity * Math.PI * sigma * v * v * be * be),
                    sigmas_dv,
                    -5280 / 60 * 3 * sigma * ad * v * v * airDensity
                ];
                return solvePoly(coeffs)[0];
            },
            function beFromSigmasdvSigmaAdVW(sigmas_dv, sigma, ad, v, w) {
                var be = Math.sqrt(
                    1 / (5280 / 60 * 3 * sigma * ad * v * v * airDensity / w -
                        sigmas_dv) *
                    w / (airDensity * Math.PI * sigma * v * v)
                );
                return be;
            }
        ],
        [ // Formula 24
            function vminsFromSigmaWbeAd(sigma, wbe, ad) {
                var vmins = Math.sqrt(1 / airDensity) /
                    Math.pow(3 * Math.PI, 1 / 4) *
                    Math.sqrt(wbe) /
                    (Math.sqrt(sigma) * Math.pow(ad, 1 / 4));
                return vmins;
            },
            function wbeFromVminsSigmaAd(vmins, sigma, ad) {
                var wbe = Math.sqrt(3 * Math.PI) * airDensity *
                    sigma * Math.pow(vmins, 2) * Math.sqrt(ad);
                return wbe;
            },
            function sigmaFromVminsWbeAd(vmins, wbe, ad) {
                var sigma = wbe / (Math.sqrt(3 * Math.PI) * airDensity *
                    Math.pow(vmins, 2) * Math.sqrt(ad));
                return sigma;
            },
            function adFromVminsSigmaWBe(vmins, sigma, wbe) {
                var ad = 1 / (3 * Math.PI) * Math.pow(1 / vmins, 4) *
                Math.pow(wbe / (sigma * airDensity), 2);
                return ad;
            }
        ],
        [ // Formula 25
            function rshatFromVtilde(vtilde) {
                return (Math.pow(vtilde, 4) + 3) / (4 * vtilde);
            },
            function vtildeFromRshat(rshat) {
                var coeffs = [
                    1,
                    0,
                    0,
                    -rshat * 4,
                    3
                ];
                return solvePoly(coeffs)[1];
            }
        ],
        [ // Formula 26
            function dg_dclFromClCd0Ear(cl, cd0, ear) {
                var dg_dcl = 360 / Math.TAU *
                    (cd0 / (cl * cl) + 1 / (Math.PI * ear));
                return dg_dcl;
            },
            function clFromDgdclCd0Ear(dg_dcl, cd0, ear) {
                var cl = Math.sqrt(
                    cd0 / (dg_dcl / 360 * Math.TAU - 1 / (Math.PI * ear))
                );
                return cl;
            },
            function cd0FromDgdclClEar(dg_dcl, cl, ear) {
                var cd0 = (dg_dcl / 360 * Math.TAU - 1 / (Math.PI * ear)) *
                    Math.pow(cl, 2);
                return cd0;
            },
            function earFromDgdclClCd0(dg_dcl, cl, cd0) {
                var ear = 1 / (Math.PI * (
                    dg_dcl * Math.TAU / 360 - cd0 / Math.pow(cl, 2)
                ));
                return ear;
            }
        ],
        [ // Formula 27
            function clmaxldFromEarCd0(ear, cd0) {
                return Math.sqrt(Math.PI * ear * cd0);
            },
            function earFromClmaxldCd0(clmaxld, cd0) {
                return Math.pow(clmaxld, 2) / (Math.PI * cd0);
            },
            function cd0FromClmaxldEar(clmaxld, ear) {
                return Math.pow(clmaxld, 2) / (Math.PI * ear);
            },
            function clmaxldFromClmins(clmins) {
                return clmins / Math.sqrt(3);
            },
            function clminsFromClmaxld(clmaxld) {
                return clmaxld * Math.sqrt(3);
            }
        ],
        [ // Formula 28
            function ldmaxFromEarCd0(ear, cd0) {
                return Math.sqrt(Math.PI) / 2 * Math.sqrt(ear / cd0);
            },
            function earFromLdmaxCd0(ldmax, cd0) {
                return Math.pow(2 / Math.sqrt(Math.PI) * ldmax, 2) * cd0;
            },
            function cd0FromLdmaxEar(ldmax, ear) {
                return Math.pow(2 * ldmax, -2) * Math.PI * ear;
            }
        ],
        [ // Formula 29
            function ldmaxFromBeAd(be, ad) {
                return Math.sqrt(Math.PI) / 2 * be / Math.sqrt(ad);
            },
            function beFromLdmaxAd(ldmax, ad) {
                return 2 / Math.sqrt(Math.PI) * ldmax * Math.sqrt(ad);
            },
            function adFromLdmaxBe(ldmax, be) {
                return Math.PI / 4 * Math.pow(be / ldmax, 2);
            }
        ],
        [ // Formula 30
            function dminFromAdWbe(ad, wbe) {
                return 2 / Math.sqrt(Math.PI) * Math.sqrt(ad) * wbe;
            },
            function adFromDminWbe(dmin, wbe) {
                return Math.pow(dmin * Math.sqrt(Math.PI) / (2 * wbe), 2);
            },
            function wbeFromDminAd(dmin, ad) {
                return Math.sqrt(Math.PI) * dmin / (2 * Math.sqrt(ad));
            }
        ],
        [ // Formula 31
            function thpalFromSigmaAdVWBe(sigma, ad, v, wbe) {
                var thpal = (5280 / 60) / 33000 *
                    (sigma * ad * Math.pow(v, 3) * airDensity +
                    1 / airDensity *
                    Math.pow(wbe, 2) / (Math.PI * sigma * v));
                return thpal;
            },
            function adFromThpalSigmaVWBe(thpal, sigma, v, wbe) {
                var ad = 1 / (Math.pow(v, 3) * airDensity * sigma) * (
                    33000 * 60 / 5280 * thpal -
                    1 / airDensity *
                    Math.pow(wbe, 2) / (Math.PI * sigma * v)
                );
                return ad;
            },
            function vFromThpalSigmaAdWBe(thpal, sigma, ad, wbe) {
                var coeffs = [
                    ad * airDensity * sigma,
                    0,
                    0,
                    33000 / (5280 / 60) * thpal,
                    Math.pow(wbe, 2) / (airDensity * Math.PI)
                ];
                return -solvePoly(coeffs)[1];
            },
            function wbeFromThpalSigmaAdV(thpal, sigma, ad, v) {
                var wbe = Math.sqrt(
                    (thpal / 5280 * 60 * 33000 -
                        sigma * ad * Math.pow(v, 3) * airDensity) *
                    Math.PI * sigma * v * airDensity
                );
                return wbe;
            },
            // Density ratio version of Relation 5
            function thpaFromSigmaAdVmax(sigma, ad, vmax) {
                var thpa = 88 / 33000 * airDensity *
                    sigma * ad * Math.pow(vmax, 3);
                return thpa;
            },
            function sigmaFromThpaAdVmax(thpa, ad, vmax) {
                var sigma = thpa / (88 / 33000 * airDensity *
                    ad * Math.pow(vmax, 3));
                return sigma;
            },
            function adFromThpaSigmaVmax(thpa, sigma, vmax) {
                var ad = 33000 / 88 / airDensity *
                    sigma * thpa / Math.pow(vmax, 3);
                return ad;
            },
            function vmaxFromThpaSigmaAd(thpa, sigma, ad) {
                var vmax = Math.pow(
                    33000 / 88 / airDensity * sigma * thpa / ad, 1 / 3
                );
                return vmax;
            }
        ],
        [ // Formula 32
            function thpalFromRsW(rs, w) {
                return rs * w / 33000;
            },
            function rsFromThpalW(thpal, w) {
                return 33000 * thpal / w;
            },
            function wFromThpalRs(thpal, rs) {
                return 33000 * thpal / rs;
            }
        ],
        [ // Formula 33
            function thpminFromAdSigmaWbe(ad, sigma, wbe) {
                var thpmin = 5280 / 60 * 4 / 33000 *
                1 / (Math.sqrt(sigma * airDensity) *
                Math.pow(3 * Math.PI, 3 / 4)) *
                Math.pow(ad, 1 / 4) * Math.pow(wbe, 3 / 2);
                return thpmin;
            },
            function adFromThpminSigmaWbe(thpmin, sigma, wbe) {
                var ad = Math.pow(33000 / 4 * 60 / 5280 *
                    Math.sqrt(airDensity) * Math.pow(3 * Math.PI, 3 / 4) *
                    thpmin * Math.sqrt(sigma) / Math.pow(wbe, 3 / 2), 4);
                return ad;
            },
            function sigmaFromThpminAdWbe(thpmin, ad, wbe) {
                var sigma = Math.pow(
                    5280 / 60 * 4 *
                    Math.sqrt(1 / airDensity) * Math.pow(ad, 1 / 4) *
                    Math.pow(wbe, 3 / 2) / (
                        33000 * Math.pow(3 * Math.PI, 3 / 4) * thpmin
                    ), 2
                );
                return sigma;
            },
            function wbeFromThpminAdSigma(thpmin, ad, sigma) {
                var wbe = Math.pow(
                    Math.pow(60 / 5280 * 33000 / 4 * thpmin, 2) *
                    sigma * airDensity *
                    Math.pow(Math.pow(3 * Math.PI, 3) / ad, 1 / 2)
                , 1 / 3);
                return wbe;
            }
        ],
        [ // Formula 34
            function tFromDWThetac(d, w, thetac) {
                return d + w * Math.sin(thetac / 360 * Math.TAU);
            },
            function dFromTWThetac(t, w, thetac) {
                return t - w * Math.sin(thetac / 360 * Math.TAU);
            },
            function wFromTDThetac(t, d, thetac) {
                return (t - d) / Math.sin(thetac / 360 * Math.TAU);
            },
            function thetacFromTDW(t, d, w) {
                return 360 / Math.TAU * Math.asin((t - d) / w);
            }
        ],
        [ // Formula 35
            function lFromWThetac(w, thetac) {
                return w * Math.cos(thetac / 360 * Math.TAU);
            },
            function wFromLThetaC(l, thetac) {
                return l / Math.cos(thetac / 360 * Math.TAU);
            },
            function thetacFromLW(l, w) {
                return 360 / Math.TAU * Math.acos(l / w);
            }
        ],
        [ // Formula 36
            function tFromThetacSigmaAdVWbe(w, thetac, sigma, ad, v, wbe) {
                var t = w * Math.sin(thetac / 360 * Math.TAU) +
                    sigma * ad * v * v * airDensity +
                    1 / airDensity * Math.pow(wbe, 2) / (sigma * v * v);
                return t;
            },
            function wFromTThetacSigmaAdVWbe(t, thetac, sigma, ad, v, wbe) {
                return (t - sigma * ad * v * v * airDensity -
                    1 / airDensity * Math.pow(wbe, 2) / (sigma * v * v)
                    ) / Math.sin(thetac / 360 * Math.TAU);
            },
            function thetacFromTSigmaAdVWbe(t, w, sigma, ad, v, wbe) {
                var thetac = Math.asin((
                    t - sigma * ad * v * v * airDensity -
                    1 / airDensity * Math.pow(wbe, 2) / (sigma * v * v)
                ) / w) / Math.TAU * 360;
                return thetac;
            },
            function sigmaFromTThetacAdVWBeSigma(t, w, thetac, ad, v, wbe) {
                var coeffs = [
                    ad * v * v * airDensity,
                    w * Math.sin(thetac / 360 * Math.TAU) - t,
                    1 / airDensity * Math.pow(w / be, 2) / (v * v)
                ];
                return solvePoly(coeffs)[1];
            },
            function adFromTThetacSigmaVWBe(t, w, thetac, sigma, v, wbe) {
                var ad = (
                    t - w * Math.sin(thetac / 360 * Math.TAU) -
                    1 / airDensity * Math.pow(wbe, 2) / (sigma * v * v)
                ) / (sigma * v * v * airDensity);
                return ad;
            },
            function wFromTThetaCSigmaAdVBe(t, thetac, sigma, ad, v, be) {
                var coeffs = [
                    1 / airDensity * Math.pow(1 / be, 2) / (sigma * v * v),
                    Math.sin(thetac / 360 * Math.TAU),
                    sigma * ad * v * v * airDensity - t
                ];
                return solvePoly(coeffs)[0];
            }
        ],
        [ // Formula 37 - theoretical, allowing us to obtain rate of climb
            // todo: Why is thpa different here compared to Relation 5?
            function thpaFromWRcThpal(w, rc, thpal) {
                return w * rc / 33000 + thpal;
            }
        ],
        [ // Formula 38
            function etaFromThpaBhp(thpa, bhp) {
                return thpa / bhp;
            },
            function thpaFromEtaBhp(eta, bhp) {
                return eta * bhp;
            },
            function bhpFromEtaThpa(eta, thpa) {
                return thpa / eta;
            },
            function rcFromBhpWEtaRs(bhp, w, eta, rs) {
                // eta is the efficiency: THPa / BHP
                return (33000 * bhp / w) * eta - rs;
            },
            function bhpFromRcWEtaRs(rc, w, eta, rs) {
                return w / 33000 * (rc + rs) / eta;
            },
            function wFromRcBhpEtaRs(rc, bhp, eta, rs) {
                return 33000 * eta * bhp / (rc + rs);
            },
            function etaFromRcBhpWRs(rc, bhp, w, rs) {
                return (rc + rs) / (33000 * bhp / w);
            },
            function rsFromRcBhpWEta(rc, bhp, w, eta) {
                return (33000 * bhp / w) * eta - rc;
            }
        ],
        [ // Formula 39
            function mdotFromRhoApVp(rho, ap, vp) {
                return rho * ap * vp;
            },
            function rhoFromMdotApVp(mdot, ap, vp) {
                return mdot / (ap * vp);
            },
            function apFromMdotRhoVp(mdot, rho, vp) {
                return mdot / (rho * vp);
            },
            function vpFromMdotRhoAp(mdot, rho, ap) {
                return mdot / (rho * ap);
            },
            function mdotFromRhoA3V3(rho, a3, v3) {
                return rho * a3 * v3;
            },
            function rhosFromMdotA3V3(mdot, a3, v3) {
                return mdot / (a3 * v3);
            },
            function a3FromMdotRhoV3(mdot, rho, v3) {
                return mdot / (rho * v3);
            },
            function v3FromMdotRhoA3(mdot, rho, a3) {
                return mdot / (rho * a3);
            }
        ],
        [ // Formula 40: change in momentum vs pressure jump
            function tFromMV3V(m, v3, v) {
                return m * (v3 - v);
            },
            function mFromTV3V(t, v3, v) {
                return t / (v3 - v);
            },
            function v3FromTMV(t, m, v) {
                return t / m + v;
            },
            function vFromTMV3(t, m, v3) {
                return v3 - t / m;
            }
        ],
        [ // Formula 41: Upstream propeller pressure increase
            function pdiFromPdRhoV(pd, rho, v) {
                return pd + 0.5 * rho * v * v;
            },
            function pdFromPdiRhoV(pdi, rho, v) {
                return pdi - 0.5 * rho * v * v;
            },
            function rhoFromPdiPdV(pdi, pd, v) {
                return (pdi - pd) / (0.5 * v * v);
            },
            function vFromPdiPdRho(pdi, pd, rho) {
                return Math.sqrt((pdi - pd) / (0.5 * rho));
            },
            function p1iFromP1RhoVp(p1, rho, vp) {
                return p1 + 0.5 * rho * vp * vp;
            },
            function p1FromRhoVp(p1i, rho, vp) {
                return p1i - 0.5 * rho * vp * vp;
            },
            function rhoFromP1iP1Vp(p1i, p1, vp) {
                return (p1i - p1) / (0.5 + vp * vp);
            },
            function vpFromP1iP1Rho(p1i, p1, rho) {
                return Math.sqrt((p1i - p1) / (0.5 * rho));
            }
        ],
        [ // Formula 42: Downstream propeller pressure
            function p2FromPdRhoVpV3(pd, rho, vp, v3) {
                return pd + 0.5 * rho * v3 * v3 - 0.5 * rho * vp * vp;
            },
            function pdFromP2RhoVpV3(p2, rho, vp, v3) {
                return p2 + 0.5 * rho * vp * vp - 0.5 * rho * v3 * v3;
            },
            function rhoFromP2PdVpV3(p2, pd, vp, v3) {
                return (p2 - pd) / (0.5 * v3 * v3 - 0.5 * vp * vp);
            },
            function vpFromP2PdRhoV3(p2, pd, rho, v3) {
                var vp = Math.sqrt(
                    (0.5 * rho * v3 * v3 - (p2 - pd)) / (0.5 * rho)
                );
                return vp;
            },
            function v3FromP2PdRhoVp(p2, pd, rho, vp) {
                var v3 = Math.sqrt(
                    ((p2 - pd) + 0.5 * rho * vp * vp) / (0.5 * rho)
                );
                return v3;
            }
        ],
        [ // Formula 43: Propeller pressure jump
            function p2FromP1RhoV3V(p1, rho, v3, v) {
                return p1 + 0.5 * rho * (Math.pow(v3, 2 / 3) - v * v);
            },
            function p1FromP2RhoV3V(p2, rho, v3, v) {
                return p2 - 0.5 * rho * (Math.pow(v3, 2 / 3) - v * v);
            },
            function rhoFromP1P2V3V(p1, p2, v3, v) {
                return (p2 - p1) / (0.5 * (Math.pow(v3, 2 / 3) - v * v));
            },
            function v3FromP1P2RhoV(p1, p2, rho, v) {
                return Math.pow((p2 - p1) / (0.5 * rho) + v * v, 3 / 2);
            },
            function vFromP1P2RhoV3(p1, p2, rho, v3) {
                var v = Math.sqrt(
                    Math.pow(v3, 2 / 3) - (p2 - p1) / (0.5 * rho)
                );
                return v;
            }
        ],
        [ // Formula 44: Thrust force
            function tFromRhoV3VAp(rho, v3, v, ap) {
                return 0.5 * rho * (v3 - v) * (v3 + v) * ap;
            },
            function rhoFromTV3VAp(t, v3, v, ap) {
                return t / (0.5 * (v3 - v) * (v3 + v) * ap);
            },
            function v3FromTRhoVAp(t, rho, v, ap) {
                return Math.sqrt(t / (0.5 * rho * ap) + v * v);
            },
            function vFromTRhoV3Ap(t, rho, v3, ap) {
                return Math.sqrt(v3 * v3 - t / (0.5 * rho * ap));
            },
            function apFromTRhoV3V(t, rho, v3, v) {
                return t / (0.5 * rho * (v3 - v) * (v3 + v));
            }
        ],
        [ // Formula 45: Prop velocity
            function vpFromV3V(v3, v) {
                return 0.5 * (v3 + v);
            },
            function vFromVpV3(vp, v3) {
                return 2 * vp - v3;
            }
        ],
        [ // Formula 46: Slipstream velocity
            function v3FromVpV(vp, v) {
                return 2 * vp - v;
            }
        ],
        [ // Formula 47: Available propeller thrust
            function tFromRhoApVpV(rho, ap, vp, v) {
                return 2 * rho * ap * vp * (vp - v);
            },
            function rhoFromTApVpV(t, ap, vp, v) {
                return t / (2 * ap * vp * (vp - v));
            },
            function apFromTRhoVpV(t, rho, vp, v) {
                return t / (2 * rho * vp * (vp - v));
            },
            function vpFromTRhoApV(t, rho, ap, v) {
                return solvePoly([2 * rho * ap, -2 * rho * ap * v, -t])[1];
            },
            function vFromTRhoApVp(t, rho, ap, vp) {
                return vp - t / (2 * rho * ap * vp);
            }
        ],
        [ // Formula 48: Engine power at shaft
            function pthrustFromTV(t, v) {
                return t * v;
            },
            function tFromPthrustV(pthrust, v) {
                return pthrust / v;
            },
            function vFromPthrustT(pthrust, t) {
                return pthrust / t;
            },
            function pshaftFromTVp(t, vp) {
                return t * vp;
            },
            function tFromPshaftVp(pshaft, vp) {
                return pshaft / vp;
            },
            function vpFromPshaftT(pshaft, t) {
                return pshaft / t;
            },
            function etaFromPthrustPshaft(pthrust, pshaft) {
                return pthrust / pshaft;
            },
            function pthrustFromEtaPshaft(eta, pshaft) {
                return eta * pshaft;
            },
            function pshaftFromEtaPthrust(eta, pthrust) {
                return pthrust / eta;
            }
        ],
        [ // Formula 49: Propeller efficiency
            function pshaftFromRhoApVpV(rho, ap, vp, v) {
                return 2 * rho * ap * vp * vp * (vp - v);
            },
            function rhoFromPshaftApVpV(pshaft, ap, vp, v) {
                return pshaft / (2 * ap * vp * vp * (vp - v));
            },
            function apFromPshaftRhoVpV(pshaft, rho, vp, v) {
                return pshaft / (2 * rho * vp * vp * (vp - v));
            },
            function vpFromPshaftRhoApV(pshaft, rho, ap, v) {
                var vp = solvePoly([
                    2 * rho * ap,
                    -2 * rho * ap * v,
                    0,
                    -pshaft
                ])[0];
                return vp;
            },
            function vFromPshaftRhoApVp(pshaft, rho, ap, vp) {
                return vp - pshaft / (2 * rho * ap * vp * vp);
            }
        ],
        [ // Formula 50: Propeller velocity
            function bhpFromSigmaDpVEta(sigma, dp, v, eta) {
                var bhp = Math.PI / 2 * sea_level_density / 33000 *
                    Math.pow(5280 / 60, 3) / Math.pow(60, 2) *
                    sigma * dp * dp * Math.pow(v, 3) *
                    (1 - eta) / Math.pow(eta, 3);
                return bhp;
            },
            function sigmaFromBhpDpVEta(bhp, dp, v, eta) {
                var sigma = 2 / Math.PI * 33000 / sea_level_density *
                    Math.pow(60, 2) / Math.pow(5280 / 60, 3) *
                    bhp / (dp * dp * Math.pow(v, 3)) *
                    Math.pow(eta, 3) / (1 - eta);
                return sigma;
            },
            function dpFromBhpSigmaVEta(bhp, sigma, v, eta) {
                var dp = Math.sqrt(2 / Math.PI * 33000 / sea_level_density *
                    Math.pow(60, 2) / Math.pow(5280 / 60, 3) *
                    bhp / (sigma * Math.pow(v, 3)) *
                    Math.pow(eta, 3) / (1 - eta));
                return dp;
            },
            function vFromBhpSigmaDpEta(bhp, sigma, dp, eta) {
                var v = Math.pow(2 / Math.PI * 33000 / sea_level_density *
                    Math.pow(60, 2) / Math.pow(5280 / 60, 3) *
                    bhp / (sigma * dp * dp) *
                    Math.pow(eta, 3) / (1 - eta), 1 / 3);
                return v;
            }
        ],
        [ // Formula 51: Propeller velocity
            function vpropFromBhpSigmaDp(bhp, sigma, dp) {
                var vprop = Math.pow(33000 / sea_level_density *
                    Math.pow(60, 2) * Math.pow(60 / 5280, 3) *
                    bhp / (sigma * dp * dp), 1 / 3);
                return vprop;
            },
            function bhpFromVpropSigmaDp(vprop, sigma, dp) {
                var bhp = sea_level_density / 33000 *
                    Math.pow(5280 / 60, 3) / Math.pow(60, 2) *
                    sigma * dp * dp * Math.pow(vprop, 3);
                return bhp;
            },
            function sigmaFromVpropBhpDp(vprop, bhp, dp) {
                var sigma = 33000 / sea_level_density *
                    Math.pow(60, 2) / Math.pow(5280 / 60 * vprop, 3) *
                    bhp / Math.pow(dp, 2);
                return sigma;
            },
            function dpFromVpropBhpSigma(vprop, bhp, sigma) {
                var dp = Math.sqrt(
                    33000 / sea_level_density *
                    Math.pow(60, 2) / Math.pow(5280 / 60, 3) *
                    bhp / (Math.pow(vprop, 3) * sigma)
                );
                return dp;
            }
        ],
        [ // Formula 52: Cubic equation for dimensionless velocity
            function vtildeFromEta(eta) {
                return Math.pow(2 / Math.PI, 1 / 3) *
                    eta / Math.pow(1 - eta, 1 / 3);
            },
            function etaFromVtilde(vtilde) {
                var eta = solvePoly([
                    1,
                    0,
                    Math.pow(vtilde, 3) * Math.PI / 2,
                    -Math.pow(vtilde, 3) * Math.PI / 2
                ])[0];
                return eta;
            }
        ],
        [ // Formula 53: Solution to cubic equation for dimensionless velocity
            function zeroFromEtaVtilde(eta, vtilde) {
                var zero = Math.pow(eta, 3) + Math.PI / 2 *
                    Math.pow(vtilde, 3) * eta - Math.PI / 2 *
                    Math.pow(vtilde, 3);
                return zero;
            }
        ],
        [ // Formula 54: Solution to cubic equation for dimensionless velocity
            function etaFromVtilde(vtilde) {
                var eta = solvePoly([
                    1,
                    0,
                    Math.pow(vtilde, 3) * Math.PI / 2,
                    -Math.pow(vtilde, 3) * Math.PI / 2
                ])[0];
                return eta;
            }
        ],
        [ // Formula 55: Nondimensional advance ratio (per second)
            function jFromVNDp(v, n, dp) {
                return v / (n * dp);
            },
            function vFromJNDp(j, n, dp) {
                return j * n * dp;
            },
            function nFromJVDp(j, v, dp) {
                return v / (j * dp);
            },
            function dpFromJVN(j, v, n) {
                return v / (n * j);
            }
        ],
        [ // Formula 56: Nondimensional advance ratio (per hour)
            function jFromVRpmDp(v, rpm, dp) {
                return 5280 / 60 * v / (rpm * dp);
            },
            function vFromJRpmDp(j, rpm, dp) {
                return 60 / 5280 * j * rpm * dp;
            },
            function rpmFromJVDp(j, v, dp) {
                return 5280 / 60 * v / (j * dp);
            },
            function dpFromJVRpm(j, v, rpm) {
                return 5280 / 60 * v / (rpm * j);
            }
        ],
        [ // Formula 57: Dimensionless power coefficient as ft-lb/sec
            function cpFromPRhoNDp(p, rho, n, dp) {
                return p / (rho * Math.pow(n, 3) * Math.pow(dp, 5));
            },
            function pFromCpRhoNDp(cp, rho, n, dp) {
                return cp * rho * Math.pow(n, 3) * Math.pow(dp, 5);
            },
            function rhoFromCpPNDp(cp, p, n, dp) {
                return p / (cp * Math.pow(n, 3) * Math.pow(dp, 5));
            },
            function nFromCpPRhoDp(cp, p, rho, dp) {
                return Math.pow(p / (rho * cp * Math.pow(dp, 5)), 1 / 3);
            },
            function dpFromCpPRhoN(cp, p, rho, n) {
                return Math.pow(p / (cp * rho * Math.pow(n, 3)), 1 / 5);
            }
        ],
        [ // Formula 58: Dimensionless power coefficient as rpm
            function cpFromBhpRpmDp(bhp, rpm, dp) {
                var cp = 550 * bhp *
                    Math.pow(60, 3) / (sea_level_density * Math.pow(rpm, 3) *
                    Math.pow(dp, 5));
                return cp;
            },
            function bhpFromCpRpmDp(cp, rpm, dp) {
                var bhp = cp * (
                    sea_level_density * Math.pow(rpm, 3) * Math.pow(dp, 5)
                ) / (550 * Math.pow(60, 3));
                return bhp;
            },
            function rpmFromCpBhpDp(cp, bhp, dp) {
                var rpm = Math.pow(550 * Math.pow(60, 3) *
                    bhp / (cp * sea_level_density * Math.pow(dp, 5)), 1 / 3);
                return rpm;
            },
            function dpFromCpBhpRpm(cp, bhp, rpm) {
                var dp = Math.pow(550 * Math.pow(60, 3) *
                    bhp / (sea_level_density * cp * Math.pow(rpm, 3)), 1 / 5);
                return dp;
            }
        ],
        // Formula 59: Dimensionless velocity from
        //             advance ratio and power coefficient
        [
            function vtildeFromJCp(j, cp) {
                return j / Math.pow(cp, 3);
            },
            function jFromVtildeCp(vtilde, cp) {
                return vtilde * Math.pow(cp, 3);
            },
            function cpFromVtildeJ(vtilde, j) {
                return Math.pow(j / vtilde, 1 / 3);
            }
        ],
        [ // Formula 60: Approximation of static thrust as ft-lb/sec
            function tsFromRhoDpPshaft(rho, dp, pshaft) {
                var ts = Math.pow(Math.PI / 2, 1 / 3) * Math.pow(rho, 1 / 3) *
                    Math.pow(dp, 2 / 3) * Math.pow(pshaft, 2 / 3);
                return ts;
            },
            function rhoFromTsDpPshaft(ts, dp, pshaft) {
                var rho = 2 / Math.PI *
                    Math.pow(ts, 3) / Math.pow(dp * pshaft, 2);
                return rho;
            },
            function dpFromTsRhoPshaft(ts, rho, pshaft) {
                var dp = Math.sqrt(
                    2 * Math.pow(ts, 3) / (Math.PI * rho)
                ) / pshaft;
                return dp;
            },
            function pshaftFromTsRhoDp(ts, rho, dp) {
                var pshaft = Math.pow(ts, 3 / 2) *
                    Math.sqrt(2 / (Math.PI * rho)) / dp;
                return pshaft;
            }
        ],
        [ // Formula 61: Approximation of static thrust as rpm
            function tsFromSigmaDpBhp(sigma, dp, bhp) {
                var ts = Math.pow(
                    2 * sigma * sea_level_density * areaFromRadius(dp / 2) *
                    Math.pow(bhp * bhpPerSec, 2), 1 / 3);
                return ts;
            },
            function sigmaFromTsDpBhp(ts, dp, bhp) {
                var sigma = Math.pow(ts, 3) /
                    (2 * sea_level_density * areaFromRadius(dp / 2) *
                    Math.pow(bhp * bhpPerSec, 2));
                return sigma;
            },
            function dpFromTsSigmaBhp(ts, sigma, bhp) {
                var dp = radiusFromArea(Math.pow(ts, 3) /
                    (2 * sigma * sea_level_density *
                    Math.pow(bhp * bhpPerSec, 2))) * 2;
                return dp;
            },
            function bhpFromTsSigmaDp(ts, sigma, dp) {
                var bhp = Math.sqrt(Math.pow(ts, 3) /
                    (2 * sigma * sea_level_density * areaFromRadius(dp / 2) *
                    Math.pow(bhpPerSec, 2)));
                return bhp;
            }
        ],
        [ // Formula 62: Ideal thrust from an engine-propeller combination
            function thatFromEtaVtilde(eta, vtilde) {
                return Math.pow(2 / Math.PI, 1 / 3) * eta / vtilde;
            },
            function etaFromThatVtilde(that, vtilde) {
                return that * vtilde / Math.pow(2 / Math.PI, 1 / 3);
            },
            function vtildeFromThatEta(that, eta) {
                return Math.pow(2 / Math.PI, 1 / 3) * eta / that;
            }
        ],
        [ // Formula 63: Idealised thrust ratio from dimensionless velocity
            function thatFromVtilde(vtilde) {
                return 1 / Math.pow(2, 1 / 3) *
                    (Math.pow(1 + Math.sqrt(
                        1 + 2 * Math.PI / 27 * Math.pow(vtilde, 3)
                    ), 1  / 3) - Math.pow(-1 + Math.sqrt(
                        1 + 2 * Math.PI / 27 * Math.pow(vtilde, 3)
                    ), 1  / 3));
            }
        ],
        [ // Formula 64: Propeller tip mach number
            function mpFromRpmDp(rpm, dp) {
                return Math.PI / (60 * speedOfSound) * rpm * dp;
            },
            function rpmFromMpDp(mp, dp) {
                return 60 * speedOfSound / Math.PI * mp / dp;
            },
            function dpFromMpRpm(mp, rpm) {
                return 60 * speedOfSound / Math.PI * mp / rpm;
            }
        ]
    ];
    var appendicies = {};
    appendicies.d = [
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ],
        [ // D.1: Differential of vertical momentum equation
            function dpFromRhoDh(rho, dh) {
                return -rho * constants.G * dh;
            },
            function dhFromDpRho(dp, rho) {
                return dp / (-rho * constants.G);
            },
            function rhoFromDpDh(dp, dh) {
                return -dp / (constants.G * dh);
            }
        ],
        [ // D.2: Hydrostatic variation for water
            function pFromP0H(p0, h) {
                return p0 - Math.pow(p0, constants.G * h);
            }
        ],
        [ // D.3: Equation of state
            function pFromRhoF(rho, f) {
                var rankine = f + constants.FAHRENHEIT_TO_RANKINE;
                return rho * constants.UNIVERSAL_GAS_CONSTANT * rankine;
            },
            function rFromF(f) {
                return f + constants.FAHRENHEIT_TO_RANKINE;
            },
            function fFromR(r) {
                return r - constants.FAHRENHEIT_TO_RANKINE;
            }
        ],
        [ // D.4: Substituting into D.1
        ],
        [], // D.5: Integrate for isothermal atmosphere
        [   // D.6: Expressed as a solution for p
            function pFromP0HT0(p0, h, t0) {
                var p = p0 * Math.exp(
                    -constants.G * h / (constants.R * t0)
                );
                return p;
            },
            function hFromPP0T0(p, p0, t0) {
                return Math.log(p / p0) * constants.R * t0 / -constants.G;
            },
            function t0FromPP0H(p, p0, h) {
                var t0 = -constants.G * h / (
                    Math.log(p / p0) * constants.R
                );
                return t0;
            }
        ],
        [   // D.7: Substituting in to D.3 for density ratio
            function sigmaFromHT0(h, t0) {
                return Math.exp(-constants.G * h / (constants.R * t0));
            },
            function hFromSigmaT0(sigma, t0) {
                return Math.log(sigma) * (constants.R * t0) / -constants.G;
            },
            function t0FromSigmaH(sigma, h) {
                return -constants.G * h / (Math.log(sigma) * constants.R);
            }
        ],
        [   // D.8: Defined with characteristic altitude
            function sigmaFromHH0(h, h0) {
                return Math.exp(-h / h0);
            },
            function hFromSigmaH0(sigma, h0) {
                return Math.log(sigma) * -h0;
            },
            function h0FromSigmaH(sigma, h) {
                return -h / Math.log(sigma);
            }
        ],
        [], // D.9: Reformulate D.4 to adjust for altitude
        [], // D.10: Take the integral of the D.9 formula
        [], // D.11: Remove log terms from D20 formula
        [   // D.12: Variation of density ratio with altitude
            //       (by substituting into D.3)
            function sigmaFromHF(h, f) {
                var densityRatioRankine;
                var sigma;
                var rankine;
                densityRatioRankine = function (h, tsl_r) {
                    var temperatureDecreaseRatio = constants.BETA / tsl_r;
                    return Math.pow(1 - temperatureDecreaseRatio * h,
                        constants.G / (constants.R * constants.BETA) - 1);
                };
                rankine = f + constants.FAHRENHEIT_TO_RANKINE;
                if (h >= 36240) {
                    rankine = -70 + constants.FAHRENHEIT_TO_RANKINE;
                }
                sigma = densityRatioRankine(h, rankine);
                return sigma;
            },
            function hFromSigmaF(sigma, f) {
                var h;
                function ratioHeight() {
                    var tsl = f + constants.FAHRENHEIT_TO_RANKINE;
                    var temperatureDecreaseRatio = constants.BETA / tsl;
                    var height = (1 - Math.pow(sigma, 1 / (constants.G /
                        (constants.R * constants.BETA) - 1))) /
                        temperatureDecreaseRatio;
                    return height;
                }
                h = ratioHeight(sigma, f);
                return h;
            },
            function fFromSigmaH(sigma, h) {
                var temperatureDecreaseRatio = (1 - Math.pow(sigma, 1 /
                    (constants.G / (constants.R * constants.BETA) - 1)
                )) / h;
                var tsl = constants.BETA / temperatureDecreaseRatio;
                return tsl - constants.FAHRENHEIT_TO_RANKINE;
            }
        ],
        [], // D.13: estimated values for variation of density
        [] // D.14: estimated values for variation of density
           //       from 36240 ft to 82000 ft
    ];
    appendicies.f = [ // Airplane efficiency factor e, and ground effect
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ],
        [
            function cdsFromCd0ClEarS(cd0, cl, ear, s) {
                return (cd0 + cl * cl / (Math.PI * ear)) * s;
            },
            function cd0FromCdsClEarS(cds, cl, ear, s) {
                return cds / s - cl * cl / (Math.PI * ear);
            },
            function clFromCdsCd0EarS(cds, cd0, ear, s) {
                return Math.sqrt((cds / s - cd0) * (Math.PI * ear));
            },
            function earFromCdsCd0ClS(cds, cd0, cl, s) {
                return (cl * cl) / (cds / s - cd0) / Math.PI;
            },
            function sFromCdsCd0ClEar(cds, cd0, cl, ear) {
                return cds / (cd0 + cl * cl / (Math.PI * ear));
            }
        ],
        [
            function cdsFromWingFuseCompCdi(cdwing, s, kwing, cl,
                cdfuse, sfuse, kfuse, alpha,
                cdcomp, scomp, ar, k) {
                var cd0 = {
                        wing: cdwing * s * (1 + kwing * cl * cl),
                        fuse: cdfuse * sfuse *
                            (1 + kfuse * alpha * alpha),
                        comp: cdcomp * scomp
                    };
                var cdi = cl * cl / (Math.PI * ar) *
                    (1 + k) * s;
                return cd0.wing + cd0.fuse + cd0.comp + cdi;
            }
        ],
        [ // no F.3 in appendix
        ],
        [ // no F.4 in appendix
        ],
        [ // Appendix F.5
            function adFromCdwindSCdfuseSfuseCdcompScomp(cdwing, s,
                cdfuse, sfuse, cdcomp, scomp) {
                return cdwing * s + cdfuse * sfuse + cdcomp * scomp;
            }
        ],
        [ // Appendix F.6
            function liftSlopeFromAr(ar) {
                var radiansToDegrees = constants.RADIANS_TO_DEGREES;
                // from lift equation at http://aancl.snu.ac.kr/aancl/lecture/up_file/_1305606276_11th%20week.pdf
                var liftSlopePerDegree = Math.PI  / 0.5 * radiansToDegrees;
                return liftSlopePerDegree * ar / (ar + 3);
            },
            function arFromLiftslope(liftSlope) {
                var radiansToDegrees = constants.RADIANS_TO_DEGREES;
                var liftSlopePerDegree = Math.PI / 0.5 * radiansToDegrees;
                return 3 * liftSlope / (liftSlopePerDegree - liftSlope);
            }
        ],
        [ // Appendix F.7
            function clFromLiftslopeAlpha(liftSlope, alpha) {
                return liftSlope * alpha;
            },
            function liftSlopeFromClAlpha(cl, alpha) {
                return cl / alpha;
            },
            function alphaFromClLiftslope(cl, liftSlope) {
                return cl / liftSlope;
            }
        ],
        [ // Appendix F.8
            // wing efficiency factor
            function invewFromKArCdwingKwing(k, ar, cdwing, kwing) {
                var invew = (1 + k) +
                    Math.PI * ar * cdwing * kwing;
                return invew;
            },
            function kFromInviewArCdwingKwing(invew, ar, cdwing, kwing) {
                var k = invew -
                    Math.PI * ar * cdwing * kwing - 1;
                return k;
            },
            function arFromInviewKCdwingKwing(invew, k, cdwing, kwing) {
                var ar = (invew - (1 + k)) /
                    (Math.PI * cdwing * kwing);
                return ar;
            },
            function cdwingFromInviewKArKwing(invew, k, ar, kwing) {
                var cdwing = (invew - (1 + k)) /
                    (Math.PI * ar * kwing);
                return cdwing;
            },
            function kwingFromInviewKACdwing(invew, k, ar, cdwing) {
                var kwing = (invew - (1 + k)) /
                    (Math.PI * ar * cdwing);
                return kwing;
            },
            // fuselage correction
            function cdfusekfuseFromArSfuseS(ar, sfuse, s) {
                var fuselageEffect = chart.efuse.rectangle(ar);
                var cdfusekfuse = fuselageEffect / Math.PI *
                    (0.12 * ar) / Math.pow(ar + 3, 2);
                return cdfusekfuse;
            },
            function deltafuseFromArCdfuseKfuseSfuseS(ar, cdfusekfuse,
                sfuse, s) {
                var deltafuse = Math.PI * cdfusekfuse * (
                        Math.pow(ar + 3, 2) / 0.12 * sfuse / s
                    );
                return deltafuse;
            },
            function cdfuseFromDeltafuseArJfuseSfuseS(deltafuse, ar,
                kfuse, sfuse, s) {
                var liftSlopePerDegree = Math.PI  / 0.5 *
                    constants.RADIANS_TO_DEGREES;
                var cdfuse = deltafuse * ar / (Math.PI * kfuse * Math.pow(
                    (ar + 3) / liftSlopePerDegree, 2)
                ) / (sfuse / s);
                return cdfuse;
            },
            function kfuseFromDeltafuseArCdfuseSfuseS(deltafuse, ar,
                cdfuse, sfuse, s) {
                var liftSlopePerDegree = Math.PI  / 0.5 *
                    constants.RADIANS_TO_DEGREES;
                var kfuse = deltafuse * ar / (Math.PI * cdfuse * Math.pow(
                    (ar + 3) / liftSlopePerDegree, 2
                ) * sfuse / s);
                return kfuse;
            },
            function sfuseFromDeltafuseArCdfuseKfuseS(deltafuse, ar,
                cdfuse, kfuse, s) {
                var liftSlopePerDegree = Math.PI  / 0.5 *
                    constants.RADIANS_TO_DEGREES;
                var sfuse = deltafuse / (Math.PI * cdfuse * kfuse *
                    Math.pow((ar + 3) / liftSlopePerDegree, 2) / ar
                ) * s;
                return sfuse;
            },
            function sFromDeltafuseArCdfuseKfuseSfuse(deltafuse, ar,
                cdfuse, kfuse, sfuse) {
                var liftSlopePerDegree = Math.PI  / 0.5 *
                    constants.RADIANS_TO_DEGREES;
                var s = Math.PI * cdfuse * kfuse * Math.pow(
                    (ar + 3) / liftSlopePerDegree, 2
                ) / (deltafuse * ar) * sfuse;
                return s;
            },
            function inveFromInvewDeltafuse(invew, deltafuse) {
                return invew + deltafuse;
            },
            function invewFromInveDeltafuse(inve, deltafuse) {
                return inve - deltafuse;
            },
            function deltafuseFromInveInvew(inve, invew) {
                return inve - invew;
            },
            function eFromArSfuseS(ar, sfuse, s) {
                var invew = 1 / chart.ew.rectangle(ar);
                var fuselageEffect = chart.efuse.rectangle(ar);
                var inve = invew + fuselageEffect * (sfuse / s);
                return 1 / inve;
            },
            function sfuseFromEArS(e, ar, s) {
                var invew = 1 / chart.ew.rectangle(ar);
                var fuselageEffect = chart.efuse.rectangle(ar);
                return (1 / e - invew) * s / fuselageEffect;
            },
            // function sfuseFromEArS(e, ar, s) {
            //     var invew = 1 / chart.ew.rectangle(ar);
            //     var fuselageEffect = chart.efuse.rectangle(ar);
            //     var inve = invew + fuselageEffect * (sfuse / s);
            //     return (1 / e - invew) * s / fuselageEffect;
            // },
            function sFromEArSfuse(e, ar, sfuse) {
                var invew = 1 / chart.ew.rectangle(ar);
                var fuselageEffect = chart.efuse.rectangle(ar);
                return fuselageEffect * sfuse / (1 / e - invew);
            }
        ],
        [ // Appendix F charts
            function ewFromArWingshape(ar, wing_shape) {
                var ewing = {
                    rectangular: (ar < 1 || ar > 20) ? undefined
                        : -0.0001299978216 * Math.pow(ar, 4) +
                            0.004834347856 * Math.pow(ar, 3) -
                            0.06620280841 * Math.pow(ar, 2) +
                            0.3637235757 * ar + 0.1852971495,
                    tapered: (ar < 1 || ar > 20) ? undefined
                        : -0.00003880517128 * Math.pow(ar, 4) +
                            0.00196650416 * Math.pow(ar, 3) -
                            0.03706755805 * Math.pow(ar, 2) +
                            0.2647194811 * ar + 0.2944072497,
                    delta: (ar < 0 || ar > 6) ? undefined
                        : 0.0005303030303 * Math.pow(ar, 4) -
                            0.01136363636 * Math.pow(ar, 3) +
                            0.09189393939 * Math.pow(ar, 2) -
                            0.3853896104 * ar + 1.000822511,
                    elliptical: (ar < 0) ? undefined
                        : 1
                };
                if (!wing_shape) {
                    return;
                }
                return ewing[wing_shape];
            },
            function fuselageEffectFromArFuselageSlope(ar, fuselage_shape) {
                // values from http://www.xuru.org/rt/PR.asp
                var fuselageEffect = {
                    rectangular: 0.0009810583609 * Math.pow(ar, 3) -
                        0.0152240777 * Math.pow(ar, 2) +
                        0.1597429943 * ar + 1.047025734,
                    round: 0.001669860442 * Math.pow(ar, 2) +
                        0.01325063838 * ar + 0.5558606027
                };
                if (fuselage_shape) {
                    fuselageEffect = fuselageEffect[fuselage_shape];
                }
                return fuselageEffect;
            },
            function deltafuseFromFcSfuseS(fuselageEffect, sfuse, s) {
                return fuselageEffect * (sfuse / s);
            },
            function fuselageEffectFromDeltafuseSfuseS(deltafuse, sfuse, s) {
                return deltafuse / (sfuse / s);
            },
            function sfuseFromDeltafuseFcS(deltafuse, fuselageEffect, s) {
                return deltafuse / fuselageEffect * s;
            },
            function sFromDeltafuseFcSfuse(
                deltafuse, fuselageEffect, sfuse) {
                return fuselageEffect / deltafuse * sfuse;
            },
            function inveFromInvewDeltafuse(invew, deltafuse) {
                return invew + deltafuse;
            },
            function invewFromInveDeltafuse(inve, deltafuse) {
                return inve - deltafuse;
            },
            function deltafuseFromInveInvew(inve, invew) {
                return inve - invew;
            },
            function eFromInve(inve) {
                return 1 / inve;
            },
            function inveFromE(e) {
                return 1 / e;
            },
            function ewingFromInvew(invew) {
                return 1 / invew;
            },
            function invewFromEwing(ewing) {
                return 1 / ewing;
            },
            function kgdFromEwHB(h, b) {
                // from a DataAnalysis app that
                // results in the following Logistics formula
                function logistics(a, b, k, x) {
                    return a / (1 + b * Math.pow(Math.E, -k * x));
                }
                var a = 1.0869;
                // var b = -0.9337;
                var k = 7.6391;
                return logistics(a, b, k, h / b);
            },
            function ewgdFromEwKgd(ew, kgd) {
                return ew * kgd;
            }
        ]
    ];
    appendicies.g = [ // Drag analysis
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ],
        [ // Appendix G.1
            function adFromCdfAfCdwSw(cdf, af, cdw, sw) {
                return cdf * af + cdw * sw;
            },
            function cdfFromAdAfCdwSw(ad, af, cdw, sw) {
                return (ad - cdw * sw) / af;
            },
            function afFromAdCdfCdwSw(ad, cdf, cdw, sw) {
                return (ad - cdw * sw) / cdf;
            },
            function cdwFromAdCdfAfSw(ad, cdf, af, sw) {
                return (ad - cdf * af) / sw;
            },
            function swFromAdCdfAfCdw(ad, cdf, af, cdw) {
                return (ad - cdf * af) / cdw;
            }
        ],
        [ // Appendix G.2
            function cdwFromRel(rel) {
                // default behaviour is for laminar airflow
                // alpha source: J.P.Boyd from http://hal.archives-ouvertes.fr/docs/00/26/92/82/PDF/BrighiFruchardSariHAL.pdf
                var alpha = 1.32822934486;
                return alpha / Math.sqrt(rel);
            }
        ]
    ];
    appendicies.h = [
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ]
    ];
    appendicies.i = [
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ],
        [
            function muFromF(f) {
                // μ = 2.270 * (T^(3/2) / T + 198.6) * 10^-8
                var rankine = f + constants.FAHRENHEIT_TO_RANKINE;
                var mu = 2.270 * Math.pow(rankine, 3 / 2) /
                    (rankine + 198.6) * 1e-8;
                return mu;
            },
            function relFromRhoVMuC(rho, v, mu, c) {
                var vfs = v * constants.MPH_TO_FPS;
                var inertia = rho * vfs * vfs;
                var viscous = mu * vfs / c;
                return inertia / viscous;
            }
        ]
    ];
    appendicies.j = [
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ],
        [
            function pFromRhoR(rho, r) {
                return rho * constants.UNIVERSAL_GAS_CONSTANT * r;
            },
            function rhoFromPR(p, r) {
                return p / (constants.UNIVERSAL_GAS_CONSTANT * r);
            },
            function rFromPRho(p, rho) {
                return p / (rho * constants.UNIVERSAL_GAS_CONSTANT);
            },
            function sigmaFromRho(rho) {
                return rho / constants.SEALEVEL_DENSITY;
            },
            function rhoFromSigma(sigma) {
                return sigma * constants.SEALEVEL_DENSITY;
            }

        ]
    ];
    return {
        formulas: formulas,
        appendicies: appendicies
    };
}
