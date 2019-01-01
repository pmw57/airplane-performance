/*jslint browser:true */
/*global chart */

function aircraftFormulas(consts, solvePoly) {
    "use strict";

    function areaFromRadius(radius) {
        return 0.5 * Math.TAU * radius * radius;
    }
    function radiusFromArea(area) {
        return Math.sqrt(area * 2 / Math.TAU);
    }
    var formulas = [];
    formulas[0] = [
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
            var hpMPH = consts.BPH_PER_MIN * consts.FPS_TO_MPH / 60;
            return 0.5 * consts.SEALEVEL_DENSITY * ad *
                Math.pow(vmax, 3) / hpMPH * Math.pow(consts.MPH_TO_FPS, 2);
        },
        function adFromThpaVmax(thpa, vmax) {
            var hpMPH = consts.BPH_PER_MIN * consts.FPS_TO_MPH / 60;
            return 1 / (0.5 * consts.SEALEVEL_DENSITY) *
                thpa / Math.pow(vmax, 3) * hpMPH *
                Math.pow(consts.FPS_TO_MPH, 2);
        },
        function vmaxFromThpaAd(thpa, ad) {
            var hpMPH = consts.BPH_PER_MIN * consts.FPS_TO_MPH / 60;
            return Math.pow(1 / (0.5 * consts.SEALEVEL_DENSITY) *
                thpa / ad * hpMPH * Math.pow(consts.FPS_TO_MPH, 2), 1 / 3);
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
            return 0.5 * consts.SEALEVEL_DENSITY * ad * Math.pow(v, 2) *
                Math.pow(consts.MPH_TO_FPS, 2);
        },
        function adFromDV(d, v) {
            return d / (0.5 * consts.SEALEVEL_DENSITY * Math.pow(v, 2) *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function vFromDAD(d, ad) {
            return Math.sqrt(d / (0.5 * consts.SEALEVEL_DENSITY * ad *
                Math.pow(consts.MPH_TO_FPS, 2)));
        },
        // ad/cd0/s handled by Formula 19
        function dFromCd0SV(cd0, s, v) {
            return 0.5 * consts.SEALEVEL_DENSITY * cd0 * s *
                Math.pow(v, 2) * Math.pow(consts.MPH_TO_FPS, 2);
        },
        function cd0FromDSV(d, s, v) {
            return d / (0.5 * consts.SEALEVEL_DENSITY * s * Math.pow(v, 2) *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function sFromDCd0V(d, cd0, v) {
            return d / (0.5 * consts.SEALEVEL_DENSITY * cd0 *
                Math.pow(v, 2) * Math.pow(consts.MPH_TO_FPS, 2));
        },
        function vFromDCd0S(d, cd0, s) {
            return Math.sqrt(d / (0.5 * consts.SEALEVEL_DENSITY * cd0 * s *
                Math.pow(consts.MPH_TO_FPS, 2)));
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
            return rs * w / consts.BPH_PER_MIN;
        },
        function rsFromThpW(thp, w) {
            return consts.BPH_PER_MIN * thp / w;
        },
        function wFromThpRs(thp, rs) {
            return consts.BPH_PER_MIN * thp / rs;
        },
        function rsminFromThpminW(thpmin, w) {
            return consts.BPH_PER_MIN * thpmin / w;
        },
        function thpminFromRsminW(rsmin, w) {
            return rsmin * w / consts.BPH_PER_MIN;
        },
        function wFromRsminThpmin(rsmin, thpmin) {
            return consts.BPH_PER_MIN * thpmin / rsmin;
        },
        // the following are similar to Formula 38
        function thpaFromWRcRs(rc, rs, w) {
            return w / consts.BPH_PER_MIN * (rc + rs);
        },
        function wFromThpaRcRs(thpa, rc, rs) {
            return consts.BPH_PER_MIN * thpa / (rc + rs);
        },
        function rcFromThpaWRs(thpa, w, rs) {
            return consts.BPH_PER_MIN * thpa / w - rs;
        },
        function rsFromThpaWR(thpa, w, rc) {
            return consts.BPH_PER_MIN * thpa / w - rc;
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
            return rcmax * w / consts.BPH_PER_MIN;
        },
        function rcmaxFromBhpW(bhp, w) {
            return bhp * consts.BPH_PER_MIN / w;
        },
        function wFromBhpRcmax(bhp, rcmax) {
            return bhp * consts.BPH_PER_MIN / rcmax;
        }
        // Relation 12: Ts, BHP, Vprop, Dp
        // Static Thrust, Engine Brake Horsepower, Reference Propeller
        // Airspeed for 74% Efficiency, Propeller Diameter
        // ts and vprop handled by Formulas 61 and 51
    ];
    formulas[1] = [
        function dFromWThetag(w, thetag) {
            return w * Math.sin(thetag * consts.RADIANS_TO_DEGREES);
        },
        function wFromDThetag(d, thetag) {
            return d / Math.sin(thetag * consts.RADIANS_TO_DEGREES);
        },
        function thetagFromDW(d, w) {
            return Math.asin(d / w) * consts.DEGREES_TO_RADIANS;
        },
        function dFromSigmaCdSV(sigma, cd, s, v) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY * cd * s *
                Math.pow(v, 2) * Math.pow(consts.MPH_TO_FPS, 2);
        },
        function sigmaFromDCdSV(d, cd, s, v) {
            return d / (0.5 * consts.SEALEVEL_DENSITY * cd * s *
                Math.pow(v, 2) * Math.pow(consts.MPH_TO_FPS, 2));
        },
        function cdFromSigmaCdSV(d, sigma, s, v) {
            return d / (sigma * 0.5 * consts.SEALEVEL_DENSITY * s *
                Math.pow(v, 2) * Math.pow(consts.MPH_TO_FPS, 2));
        },
        function sFromSigmaCdSV(d, sigma, cd, v) {
            return d / (sigma * 0.5 * consts.SEALEVEL_DENSITY * cd *
                Math.pow(v, 2) * Math.pow(consts.MPH_TO_FPS, 2));
        },
        function vFromSigmaCdSV(d, sigma, cd, s) {
            return Math.sqrt(d / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                cd * s * Math.pow(consts.MPH_TO_FPS, 2)));
        }
    ];
    formulas[2] = [
        function lFromWThetag(w, thetag) {
            return w * Math.cos(thetag * consts.RADIANS_TO_DEGREES);
        },
        function wFromLThetag(l, thetag) {
            return l / Math.cos(thetag * consts.RADIANS_TO_DEGREES);
        },
        function thetagFromLW(l, w) {
            return Math.acos(l / w) * consts.DEGREES_TO_RADIANS;
        }
    ];
    formulas[3] = [
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
            return vfs * consts.FPS_TO_MPH;
        },
        function vfsFromV(v) {
            return v * consts.MPH_TO_FPS;
        }
    ];
    formulas[4] = [
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
    ];
    formulas[5] = [
        function dFromSigmaCdSV(sigma, cd, s, v) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY * cd * s * v * v *
                Math.pow(consts.MPH_TO_FPS, 2);
        },
        function sigmaFromdCdSV(d, cd, s, v) {
            return d / (0.5 * consts.SEALEVEL_DENSITY * cd * s * v * v *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function cdFromDSigmaSV(d, sigma, s, v) {
            return d / (sigma * 0.5 * consts.SEALEVEL_DENSITY * s * v * v *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function sFromDSigmaCdV(d, sigma, cd, v) {
            return d / (sigma * 0.5 * consts.SEALEVEL_DENSITY * cd * v * v *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function vFromDSigmaCdS(d, sigma, cd, s) {
            return Math.sqrt(d / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                cd * s * Math.pow(consts.MPH_TO_FPS, 2)));
        }
    ];
    formulas[6] = [
        function lFromSigmaClSV(sigma, cl, s, v) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY * cl * s * v * v *
                Math.pow(consts.MPH_TO_FPS, 2);
        },
        function sigmaFromLClSV(l, cl, s, v) {
            return l / (0.5 * consts.SEALEVEL_DENSITY * cl * s * v * v *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function clFromLSigmaSV(l, sigma, s, v) {
            return l / (sigma * 0.5 * consts.SEALEVEL_DENSITY * s * v * v *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function sFromLSigmaClV(l, sigma, cl, v) {
            return l / (sigma * 0.5 * consts.SEALEVEL_DENSITY * cl * v * v *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function vFromLSigmaClS(l, sigma, cl, s) {
            return Math.sqrt(l / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                cl * s * Math.pow(consts.MPH_TO_FPS, 2)));
        }
    ];
    formulas[7] = [
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
            return sigma * cl * v * v * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2);
        },
        function sigmaFromWsClV(ws, cl, v) {
            return ws / (cl * v * v * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function clFromWsSigmaV(ws, sigma, v) {
            return ws / (sigma * v * v * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function vFromWsSigmaCl(ws, sigma, cl) {
            return Math.sqrt(ws / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                cl * Math.pow(consts.MPH_TO_FPS, 2)));
        },
        // Relation 1 clmax
        function wsFromSigmaClmaxVs0(sigma, clmax, vs0) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY *
                clmax * vs0 * vs0 * Math.pow(consts.MPH_TO_FPS, 2);
        },
        function sigmaFromWsClmaxVs0(ws, clmax, vs0) {
            return ws / (0.5 * consts.SEALEVEL_DENSITY *
                clmax * vs0 * vs0 * Math.pow(consts.MPH_TO_FPS, 2));
        },
        function clmaxFromWsSigmaVs0(ws, sigma, vs0) {
            return ws / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                vs0 * vs0 * Math.pow(consts.MPH_TO_FPS, 2));
        },
        function vs0FromWsSigmaCl(ws, sigma, clmax) {
            return Math.sqrt(ws / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                clmax * Math.pow(consts.MPH_TO_FPS, 2)));
        },
        // Relation 11 crosschecks
        function clminsFromWsVmins(ws, vmins) {
            return ws / (0.5 * consts.SEALEVEL_DENSITY * vmins * vmins *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function wsFromClminsVmins(clmins, vmins) {
            return 0.5 * consts.SEALEVEL_DENSITY * clmins * vmins * vmins *
                Math.pow(consts.MPH_TO_FPS, 2);
        },
        function vminsFromClminsWs(clmins, ws) {
            return Math.sqrt(ws / (0.5 * consts.SEALEVEL_DENSITY * clmins *
                Math.pow(consts.MPH_TO_FPS, 2)));
        }
    ];
    formulas[8] = [
        function thetagFromSigmaCdSV(sigma, cd, s, v) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY * cd * s * v * v *
                Math.pow(consts.MPH_TO_FPS, 2) * consts.DEGREES_TO_RADIANS;
        },
        function sigmaFromThetagCdSV(thetag, cd, s, v) {
            return thetag /
                (0.5 * consts.SEALEVEL_DENSITY * cd * s * v * v *
                Math.pow(consts.MPH_TO_FPS, 2)) * consts.RADIANS_TO_DEGREES;
        },
        function cdFromThetagSigmaSV(thetag, sigma, s, v) {
            return consts.RADIANS_TO_DEGREES * thetag /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY * s * v * v *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function sFromThetagSigmaCdV(thetag, sigma, cd, v) {
            return consts.RADIANS_TO_DEGREES * thetag /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY * cd * v * v *
                Math.pow(consts.MPH_TO_FPS, 2));
        },
        function vFromThetagSigmaCdS(thetag, sigma, cd, s) {
            var v = Math.sqrt(consts.RADIANS_TO_DEGREES * thetag /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2) * cd * s));
            return v;
        }
    ];
    formulas[9] = [
        function thetagFromCdCl(cd, cl) {
            return consts.DEGREES_TO_RADIANS * cd / cl;
        },
        function cdFromThetagCl(thetag, cl) {
            return consts.RADIANS_TO_DEGREES * thetag * cl;
        },
        function clFromThetagCd(thetag, cd) {
            return consts.DEGREES_TO_RADIANS * cd / thetag;
        }
    ];
    formulas[10] = [
        function rsFromSigmaCdSVW(sigma, cd, s, v, w) {
            return v * 5280 / 60 * sigma * 0.5 * consts.SEALEVEL_DENSITY *
                cd * s * Math.pow(v * consts.MPH_TO_FPS, 2) / w;
        },
        function sigmaFromRsCdSVW(rs, cd, s, v, w) {
            return rs * w / (0.5 * consts.SEALEVEL_DENSITY * cd * s *
                Math.pow(v * consts.MPH_TO_FPS, 2)) / v * 60 / 5280;
        },
        function cdFromRsSigmaSVW(rs, sigma, s, v, w) {
            return rs * w / (sigma * 0.5 * consts.SEALEVEL_DENSITY * s *
                Math.pow(v * consts.MPH_TO_FPS, 2)) / v * 60 / 5280;
        },
        function sFromRsSigmaCdVW(rs, sigma, cd, v, w) {
            return rs * w / (sigma * 0.5 * consts.SEALEVEL_DENSITY * cd *
                Math.pow(v * consts.MPH_TO_FPS, 2)) / v * 60 / 5280;
        },
        function vFromRsSigmaCdSW(rs, sigma, cd, s, w) {
            return Math.pow(rs * w /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY * cd * s *
                Math.pow(consts.MPH_TO_FPS, 2)) * 60 / 5280, 1 / 3);
        },
        function wFromRsSigmaCdSV(rs, sigma, cd, s, v) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY * cd * s *
                Math.pow(v * consts.MPH_TO_FPS, 2) / rs * 5280 / 60 * v;
        }
    ];
    formulas[11] = [
        function rsFromSigmaWSCdCl(sigma, w, s, cd, cl) {
            return 1 / Math.sqrt(sigma * 0.5 * consts.SEALEVEL_DENSITY *
                s / w * Math.pow(consts.MPH_TO_FPS, 2)) *
                cd / Math.pow(cl, 3 / 2) * 5280 / 60;
        },
        function sigmaFromRsWSCdCl(rs, w, s, cd, cl) {
            return 1 / (0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2)) * w / s *
                Math.pow(cd / rs * 5280 / 60, 2) / Math.pow(cl, 3);
        },
        function wFromRsSigmaSCdCl(rs, sigma, s, cd, cl) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY * Math.pow(rs, 2) *
                Math.pow(consts.MPH_TO_FPS, 2) * Math.pow(60 / 5280, 2) *
                s * Math.pow(Math.pow(cl, 3 / 2) / cd, 2);
        },
        function sFromRsSigmaWCdCl(rs, sigma, w, cd, cl) {
            return 1 / (sigma * 0.5 * consts.SEALEVEL_DENSITY) *
                w * Math.pow(cd, 2) / (Math.pow(rs, 2) * Math.pow(cl, 3)) *
                Math.pow(5280 / 60, 2) / Math.pow(consts.MPH_TO_FPS, 2);
        },
        function cdFromRsSigmaWSCl(rs, sigma, w, s, cl) {
            return Math.sqrt(sigma * 0.5 * consts.SEALEVEL_DENSITY *
                s * Math.pow(cl, 3) / w) * rs *
                consts.MPH_TO_FPS * 60 / 5280;
        },
        function clFromRsSigmaWSCd(rs, sigma, w, s, cd) {
            return Math.pow(1 / (sigma * 0.5 * consts.SEALEVEL_DENSITY) *
                w / s * Math.pow(cd / (rs * consts.MPH_TO_FPS) *
                    5280 / 60, 2), 1 / 3);
        }
    ];
    formulas[12] = [
        function cdFromCd0Cd1(cd0, cdi) {
            return cd0 + cdi;
        },
        function cd0FromCdCdi(cd, cdi) {
            return cd - cdi;
        },
        function cdiFromCdCd0(cd, cd0) {
            return cd - cd0;
        }
    ];
    formulas[13] = [
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
    ];
    formulas[14] = [
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
    ];
    formulas[15] = [
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
    ];
    formulas[16] = [];
    formulas[17] = [];
    formulas[18] = [
        function clminsFromEarCd0(ear, cd0) {
            return Math.sqrt(3 * Math.PI * ear * cd0);
        },
        function earFromClminsCd0(clmins, cd0) {
            return 1 / (3 * Math.PI) * Math.pow(clmins, 2) / cd0;
        },
        function cd0FromClminsEar(clmins, ear) {
            return Math.pow(clmins, 2) / (3 * Math.PI * ear);
        }
    ];
    formulas[19] = [
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
    ];
    formulas[20] = [
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
            return Math.sqrt(1 / 0.5 * consts.SEALEVEL_DENSITY) *
                4 / Math.sqrt(Math.sqrt(Math.pow(3 * Math.PI, 3)) *
                    w / sigma) * Math.pow(ad, 1 / 4) / Math.pow(be, 3 / 2) *
                consts.MPH_TO_FPS * 5280 / 60;
        },
        function wFromRsminSigmaAdBe(rsmin, sigma, ad, be) {
            var w = sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(Math.sqrt(3 * Math.PI) * be, 3) /
                (Math.pow(4, 2) * Math.sqrt(ad)) * Math.pow(rsmin *
                    consts.MPH_TO_FPS * 60 / 5280, 2);
            return w;
        },
        function sigmaFromRsminWAdBe(rsmin, w, ad, be) {
            return 1 / (0.5 * consts.SEALEVEL_DENSITY) *
                Math.pow(4, 2) / Math.sqrt(Math.pow(3 * Math.PI, 3)) *
                w * Math.sqrt(ad) / (Math.pow(rsmin, 2) * Math.pow(be, 3)) *
                Math.pow(5280 / 60, 2) / Math.pow(consts.MPH_TO_FPS, 2);
        },
        function adFromRsminWSigmaBe(rsmin, w, sigma, be) {
            return Math.pow(3 * Math.PI, 3) / Math.pow(4, 4) *
                Math.pow(Math.sqrt(0.5 * consts.SEALEVEL_DENSITY) *
                rsmin * Math.sqrt(sigma / w) * Math.sqrt(Math.pow(be, 3)) *
                60 / 5280 * consts.MPH_TO_FPS, 4);
        },
        function beFromRsminWSigmaAd(rsmin, w, sigma, ad) {
            return Math.pow(4 / Math.pow(3 * Math.PI, 3 / 4) *
                Math.sqrt(w / (sigma * 0.5 * consts.SEALEVEL_DENSITY)) *
                Math.pow(ad, 1 / 4) / rsmin *
                5280 / 60 / consts.MPH_TO_FPS, 2 / 3);
        }
    ];
    formulas[21] = [
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
            return Math.sqrt(wbe) / (Math.pow(3 * Math.PI, 1 / 4) *
                Math.sqrt(sigma * 0.5 * consts.SEALEVEL_DENSITY) *
                Math.pow(ad, 1 / 4) * consts.MPH_TO_FPS);
        },
        function wbeFromVminsSigmaAd(vmins, sigma, ad) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.sqrt(3 * Math.PI * ad) *
                Math.pow(vmins * consts.MPH_TO_FPS, 2);
        },
        function sigmaFromvMinsWBeAd(vmins, wbe, ad) {
            return wbe / (0.5 * consts.SEALEVEL_DENSITY *
                Math.sqrt(3 * Math.PI * ad) *
                Math.pow(vmins * consts.MPH_TO_FPS, 2));
        },
        function adFromVminsWBeSigma(vmins, wbe, sigma) {
            return 1 / (3 * Math.PI) * Math.pow(wbe /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY), 2) /
                Math.pow(vmins * consts.MPH_TO_FPS, 4);
        }
    ];
    formulas[22] = [
        function rsFromSigmaAdVWBe(sigma, ad, v, w, be) {
            var dragArea = sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2) * ad * Math.pow(v, 3) / w;
            var effectiveSpan = w / (Math.PI * sigma * 0.5 *
                consts.SEALEVEL_DENSITY * Math.pow(consts.MPH_TO_FPS, 2) *
                v * Math.pow(be, 2));
            return (dragArea + effectiveSpan) * 5280 / 60;
        },
        function sigmaFromRsAdVWBe(rs, ad, v, w, be) {
            var a = ad * Math.pow(v, 3) * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2) * 5280 / 60 / w;
            var b = -rs;
            var c = 5280 / 60 * w / (0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2) * Math.PI * v * be * be);
            return solvePoly([a, b, c])[1];
        },
        function adFromRsSigmaVWBe(rs, sigma, v, w, be) {
            return (rs / 5280 * 60 - w / (0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2) * Math.PI * sigma * v *
                Math.pow(be, 2))) / sigma / Math.pow(v, 3) / (0.5 *
                consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2)) * w;
        },
        function vFromRsSigmaAdWBe(rs, sigma, ad, w, be) {
            var coeffs = [
                sigma * ad * 0.5 * consts.SEALEVEL_DENSITY *
                    Math.pow(consts.MPH_TO_FPS, 2) / w,
                0,
                0,
                -60 / 5280 * rs,
                w / (0.5 * consts.SEALEVEL_DENSITY * Math.PI * sigma *
                    be * be * Math.pow(consts.MPH_TO_FPS, 2))
            ];
            return solvePoly(coeffs)[1];
        },
        function wFromRsSigmaAdVBe(rs, sigma, ad, v, be) {
            var coeffs = [
                1 / (0.5 * consts.SEALEVEL_DENSITY * Math.PI * sigma * v *
                    be * be * Math.pow(consts.MPH_TO_FPS, 2)),
                -60 / 5280 * rs,
                sigma * 0.5 * consts.SEALEVEL_DENSITY *
                    ad * Math.pow(v, 3) * Math.pow(consts.MPH_TO_FPS, 2)
            ];
            return solvePoly(coeffs)[0];
        },
        function beFromRsSigmaAdVW(rs, sigma, ad, v, w) {
            return Math.sqrt(1 / (0.5 * consts.SEALEVEL_DENSITY * Math.PI *
                Math.pow(consts.MPH_TO_FPS, 2) * v * sigma / w * (rs - 0.5 *
                consts.SEALEVEL_DENSITY * sigma * ad * Math.pow(v, 3) *
                Math.pow(consts.MPH_TO_FPS, 2) * 60 / 5280 / w)));
        }
    ];
    formulas[23] = [
        function sigmasdvFromSigmaAdVWBe(sigma, ad, v, w, be) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY *
                3 * ad * Math.pow(v, 2) / w - w / (Math.PI *
                sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(be * consts.MPH_TO_FPS, 2)) * 5280 / 60;
        },
        function sigmaFromSigmasdvAdVWBe(sigmas_dv, ad, v, w, be) {
            return sigmas_dv / (0.5 * consts.SEALEVEL_DENSITY * 3 * ad *
                Math.pow(v, 2) / w * Math.pow(consts.MPH_TO_FPS, 2) *
                5280 / 60 - w / (0.5 * consts.SEALEVEL_DENSITY * Math.PI *
                Math.pow(v * be * consts.MPH_TO_FPS, 2)));
        },
        function adFromSigmasdvSigmaVWBe(sigmas_dv, sigma, v, w, be) {
            return w / (sigma * 0.5 * consts.SEALEVEL_DENSITY * 3 *
                Math.pow(v * consts.MPH_TO_FPS, 2)) * (sigmas_dv +
                w / (sigma * 0.5 * consts.SEALEVEL_DENSITY * Math.PI *
                Math.pow(v * be * consts.MPH_TO_FPS, 2))) * 60 / 5280;
        },
        function wFromSigmasdvSigmaAdVBe(sigmas_dv, sigma, ad, v, be) {
            var coeffs = [
                1 / (sigma * 0.5 * consts.SEALEVEL_DENSITY * Math.PI *
                    Math.pow(v * be * consts.MPH_TO_FPS, 2)),
                sigmas_dv,
                -(sigma * 0.5 * consts.SEALEVEL_DENSITY * 3 * ad *
                    Math.pow(v * consts.MPH_TO_FPS, 2) * 5280 / 60)
            ];
            return solvePoly(coeffs)[0];
        },
        function beFromSigmasdvSigmaAdVW(sigmas_dv, sigma, ad, v, w) {
            return Math.sqrt(1 / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                3 * ad * Math.pow(v * consts.MPH_TO_FPS, 2) / w *
                5280 / 60 - sigmas_dv) * w /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.PI * Math.pow(v * consts.MPH_TO_FPS, 2)));
        }
    ];
    formulas[24] = [
        function vminsFromSigmaWbeAd(sigma, wbe, ad) {
            return 1 / Math.sqrt(sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2)) /
                Math.pow(3 * Math.PI, 1 / 4) *
                Math.sqrt(wbe) / (Math.pow(ad, 1 / 4));
        },
        function wbeFromVminsSigmaAd(vmins, sigma, ad) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.sqrt(3 * Math.PI * ad) *
                Math.pow(vmins * consts.MPH_TO_FPS, 2);
        },
        function sigmaFromVminsWbeAd(vmins, wbe, ad) {
            return wbe / (0.5 * consts.SEALEVEL_DENSITY *
                Math.sqrt(3 * Math.PI * ad) *
                Math.pow(vmins * consts.MPH_TO_FPS, 2));
        },
        function adFromVminsSigmaWBe(vmins, sigma, wbe) {
            return 1 / (3 * Math.PI) * Math.pow(1 / vmins, 4) *
                Math.pow(wbe / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(consts.MPH_TO_FPS, 2)), 2);
        }
    ];
    formulas[25] = [
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
    ];
    formulas[26] = [
        function dg_dclFromClCd0Ear(cl, cd0, ear) {
            var dg_dcl = consts.DEGREES_TO_RADIANS *
                (cd0 / (cl * cl) + 1 / (Math.PI * ear));
            return dg_dcl;
        },
        function clFromDgdclCd0Ear(dg_dcl, cd0, ear) {
            return Math.sqrt(cd0 / (dg_dcl * consts.RADIANS_TO_DEGREES -
                1 / (Math.PI * ear)));
        },
        function cd0FromDgdclClEar(dg_dcl, cl, ear) {
            return (dg_dcl * consts.RADIANS_TO_DEGREES -
                1 / (Math.PI * ear)) * Math.pow(cl, 2);
        },
        function earFromDgdclClCd0(dg_dcl, cl, cd0) {
            return 1 / (Math.PI * (dg_dcl * consts.RADIANS_TO_DEGREES -
                cd0 / Math.pow(cl, 2)));
        }
    ];
    formulas[27] = [
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
    ];
    formulas[28] = [
        function ldmaxFromEarCd0(ear, cd0) {
            return Math.sqrt(Math.PI) / 2 * Math.sqrt(ear / cd0);
        },
        function earFromLdmaxCd0(ldmax, cd0) {
            return Math.pow(2 / Math.sqrt(Math.PI) * ldmax, 2) * cd0;
        },
        function cd0FromLdmaxEar(ldmax, ear) {
            return Math.pow(2 * ldmax, -2) * Math.PI * ear;
        }
    ];
    formulas[29] = [
        function ldmaxFromBeAd(be, ad) {
            return Math.sqrt(Math.PI) / 2 * be / Math.sqrt(ad);
        },
        function beFromLdmaxAd(ldmax, ad) {
            return 2 / Math.sqrt(Math.PI) * ldmax * Math.sqrt(ad);
        },
        function adFromLdmaxBe(ldmax, be) {
            return Math.PI / 4 * Math.pow(be / ldmax, 2);
        }
    ];
    formulas[30] = [
        function dminFromAdWbe(ad, wbe) {
            return 2 / Math.sqrt(Math.PI) * Math.sqrt(ad) * wbe;
        },
        function adFromDminWbe(dmin, wbe) {
            return Math.pow(dmin * Math.sqrt(Math.PI) / (2 * wbe), 2);
        },
        function wbeFromDminAd(dmin, ad) {
            return Math.sqrt(Math.PI) * dmin / (2 * Math.sqrt(ad));
        }
    ];
    formulas[31] = [
        function thpalFromSigmaAdVWBe(sigma, ad, v, wbe) {
            return (sigma * 0.5 * consts.SEALEVEL_DENSITY * ad *
                Math.pow(v, 3) * Math.pow(consts.MPH_TO_FPS, 2) +
                Math.pow(wbe, 2) / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.PI * v * Math.pow(consts.MPH_TO_FPS, 2))) *
                5280 / 60 * 1 / consts.BPH_PER_MIN;
        },
        function adFromThpalSigmaVWBe(thpal, sigma, v, wbe) {
            var ad = 1 / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(v, 3) * Math.pow(consts.MPH_TO_FPS, 2)) *
                (thpal * consts.BPH_PER_MIN * 60 / 5280 - Math.pow(wbe, 2) /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY * Math.PI *
                v * Math.pow(consts.MPH_TO_FPS, 2)));
            return ad;
        },
        function vFromThpalSigmaAdWBe(thpal, sigma, ad, wbe) {
            var coeffs = [
                sigma * 0.5 * consts.SEALEVEL_DENSITY * ad *
                    Math.pow(consts.MPH_TO_FPS, 2),
                0,
                0,
                consts.BPH_PER_MIN / (5280 / 60) * thpal,
                Math.pow(wbe, 2) / (0.5 * consts.SEALEVEL_DENSITY *
                    Math.PI * Math.pow(consts.MPH_TO_FPS, 2))
            ];
            return -solvePoly(coeffs)[1];
        },
        function wbeFromThpalSigmaAdV(thpal, sigma, ad, v) {
            return Math.sqrt((thpal / 5280 * 60 * consts.BPH_PER_MIN -
                sigma * 0.5 * consts.SEALEVEL_DENSITY * ad *
                Math.pow(v, 3) * Math.pow(consts.MPH_TO_FPS, 2)) *
                sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.PI * v * Math.pow(consts.MPH_TO_FPS, 2));
        },
        // Density ratio version of Relation 5
        function thpaFromSigmaAdVmax(sigma, ad, vmax) {
            return sigma * 0.5 * consts.SEALEVEL_DENSITY * ad *
                Math.pow(vmax, 3) * Math.pow(consts.MPH_TO_FPS, 2) *
                5280 / 60 / consts.BPH_PER_MIN;
        },
        function sigmaFromThpaAdVmax(thpa, ad, vmax) {
            return thpa / (0.5 * consts.SEALEVEL_DENSITY * ad *
                Math.pow(vmax, 3) * Math.pow(consts.MPH_TO_FPS, 2) *
                5280 / 60 / consts.BPH_PER_MIN);
        },
        function adFromThpaSigmaVmax(thpa, sigma, vmax) {
            return thpa / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(vmax, 3) * Math.pow(consts.MPH_TO_FPS, 2)) *
                consts.BPH_PER_MIN * 60 / 5280;
        },
        function vmaxFromThpaSigmaAd(thpa, sigma, ad) {
            return Math.pow(thpa / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                ad * Math.pow(consts.MPH_TO_FPS, 2)) *
                consts.BPH_PER_MIN * 60 / 5280, 1 / 3);
        }
    ];
    formulas[32] = [
        function thpalFromRsW(rs, w) {
            return rs * w / consts.BPH_PER_MIN;
        },
        function rsFromThpalW(thpal, w) {
            return consts.BPH_PER_MIN * thpal / w;
        },
        function wFromThpalRs(thpal, rs) {
            return consts.BPH_PER_MIN * thpal / rs;
        }
    ];
    formulas[33] = [
        function thpminFromAdSigmaWbe(ad, sigma, wbe) {
            return 4 * Math.pow(ad, 1 / 4) * Math.pow(wbe, 3 / 2) /
                Math.sqrt(sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(3 * Math.PI, 3 / 2)) / consts.MPH_TO_FPS *
                5280 / 60 / consts.BPH_PER_MIN;
        },
        function adFromThpminSigmaWbe(thpmin, sigma, wbe) {
            return Math.pow(sigma * 0.5 * consts.SEALEVEL_DENSITY, 2) *
                Math.pow(3 * Math.PI, 3) * Math.pow(thpmin / 4, 4) /
                Math.pow(wbe, 6) * Math.pow(consts.MPH_TO_FPS *
                consts.BPH_PER_MIN * 60 / 5280, 4);
        },
        function sigmaFromThpminAdWbe(thpmin, ad, wbe) {
            return Math.pow(4, 2) / (0.5 * consts.SEALEVEL_DENSITY) *
                Math.sqrt(ad) / Math.sqrt(Math.pow(3 * Math.PI, 3)) *
                Math.pow(wbe, 3) / Math.pow(consts.MPH_TO_FPS, 2) *
                Math.pow(5280 / 60, 2) / Math.pow(consts.BPH_PER_MIN, 2) /
                Math.pow(thpmin, 2);
        },
        function wbeFromThpminAdSigma(thpmin, ad, sigma) {
            return Math.pow(sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.sqrt(Math.pow(3 * Math.PI, 3) / ad) *
                Math.pow(thpmin / 4, 2) * Math.pow(consts.MPH_TO_FPS, 2) *
                Math.pow(60 / 5280 * consts.BPH_PER_MIN, 2), 1 / 3);
        }
    ];
    formulas[34] = [
        function tFromDWThetac(d, w, thetac) {
            return d + w * Math.sin(thetac * consts.RADIANS_TO_DEGREES);
        },
        function dFromTWThetac(t, w, thetac) {
            return t - w * Math.sin(thetac * consts.RADIANS_TO_DEGREES);
        },
        function wFromTDThetac(t, d, thetac) {
            return (t - d) / Math.sin(thetac * consts.RADIANS_TO_DEGREES);
        },
        function thetacFromTDW(t, d, w) {
            return consts.DEGREES_TO_RADIANS * Math.asin((t - d) / w);
        }
    ];
    formulas[35] = [
        function lFromWThetac(w, thetac) {
            return w * Math.cos(thetac * consts.RADIANS_TO_DEGREES);
        },
        function wFromLThetaC(l, thetac) {
            return l / Math.cos(thetac * consts.RADIANS_TO_DEGREES);
        },
        function thetacFromLW(l, w) {
            return consts.DEGREES_TO_RADIANS * Math.acos(l / w);
        }
    ];
    formulas[36] = [
        function tFromThetacSigmaAdVWbe(w, thetac, sigma, ad, v, wbe) {
            return w * Math.sin(thetac * consts.RADIANS_TO_DEGREES) +
                sigma * 0.5 * consts.SEALEVEL_DENSITY * ad *
                Math.pow(v * consts.MPH_TO_FPS, 2) +
                1 / (sigma * 0.5 * consts.SEALEVEL_DENSITY * v * v) *
                Math.pow(wbe / consts.MPH_TO_FPS, 2);
        },
        function wFromTThetacSigmaAdVWbe(t, thetac, sigma, ad, v, wbe) {
            return (t - sigma * 0.5 * consts.SEALEVEL_DENSITY * ad *
                Math.pow(v * consts.MPH_TO_FPS, 2) - Math.pow(wbe, 2) /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(v * consts.MPH_TO_FPS, 2))) /
                Math.sin(thetac * consts.RADIANS_TO_DEGREES);
        },
        function thetacFromTSigmaAdVWbe(t, w, sigma, ad, v, wbe) {
            return Math.asin((t - sigma * 0.5 * consts.SEALEVEL_DENSITY *
                ad * Math.pow(v * consts.MPH_TO_FPS, 2) - Math.pow(wbe, 2) /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(v * consts.MPH_TO_FPS, 2))) / w) *
                consts.DEGREES_TO_RADIANS;
        },
        function sigmaFromTThetacAdVWBeSigma(t, w, thetac, ad, v, wbe) {
            var coeffs = [
                0.5 * consts.SEALEVEL_DENSITY *
                    ad * Math.pow(v * consts.MPH_TO_FPS, 2),
                (w * Math.sin(thetac * consts.RADIANS_TO_DEGREES) - t),
                Math.pow(wbe / v / consts.MPH_TO_FPS, 2) /
                    (0.5 * consts.SEALEVEL_DENSITY)
            ];
            return solvePoly(coeffs)[0];
        },
        function adFromTThetacSigmaVWBe(t, w, thetac, sigma, v, wbe) {
            return (t - w * Math.sin(thetac * consts.RADIANS_TO_DEGREES) -
                Math.pow(wbe / v, 2) / (sigma * 0.5 *
                consts.SEALEVEL_DENSITY * Math.pow(consts.MPH_TO_FPS, 2))) /
                (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                Math.pow(v * consts.MPH_TO_FPS, 2));
        },
        function wFromTThetaCSigmaAdVBe(t, thetac, sigma, ad, v, be) {
            var coeffs = [
                1 / (sigma * 0.5 * consts.SEALEVEL_DENSITY *
                    Math.pow(v * be * consts.MPH_TO_FPS, 2)),
                Math.sin(thetac * consts.RADIANS_TO_DEGREES),
                sigma * 0.5 * consts.SEALEVEL_DENSITY * ad *
                    Math.pow(v * consts.MPH_TO_FPS, 2) - t
            ];
            return solvePoly(coeffs)[0];
        }
    ];
    formulas[37] = [ // theoretical, allowing us to obtain rate of climb
        function thpaFromWRcThpal(w, rc, thpal) {
            return w * rc / consts.BPH_PER_MIN + thpal;
        }
    ];
    formulas[38] = [
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
            return (consts.BPH_PER_MIN * bhp / w) * eta - rs;
        },
        function bhpFromRcWEtaRs(rc, w, eta, rs) {
            return w / consts.BPH_PER_MIN * (rc + rs) / eta;
        },
        function wFromRcBhpEtaRs(rc, bhp, eta, rs) {
            return consts.BPH_PER_MIN * eta * bhp / (rc + rs);
        },
        function etaFromRcBhpWRs(rc, bhp, w, rs) {
            return (rc + rs) / (consts.BPH_PER_MIN * bhp / w);
        },
        function rsFromRcBhpWEta(rc, bhp, w, eta) {
            return (consts.BPH_PER_MIN * bhp / w) * eta - rc;
        }
    ];
    formulas[39] = [
        function apFromDp(dp) {
            return Math.TAU * (dp / 2);
        },
        function dpFromAp(ap) {
            return ap * 2 / Math.TAU;
        },
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
    ];
    formulas[40] = [ // change in momentum vs pressure jump
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
    ];
    formulas[41] = [ // Upstream propeller pressure increase
        function pdiFromPinfRhoV(pinf, rho, v) {
            return pinf + 0.5 * rho * v * v;
        },
        function pinfFromPdiRhoV(pdi, rho, v) {
            return pdi - 0.5 * rho * v * v;
        },
        function rhoFromPdiPinfV(pdi, pinf, v) {
            return (pdi - pinf) / (0.5 * v * v);
        },
        function vFromPdiPinfRho(pdi, pinf, rho) {
            return Math.sqrt((pdi - pinf) / (0.5 * rho));
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
    ];
    formulas[42] = [ // Downstream propeller pressure
        function p2FromPinfRhoVpV3(pinf, rho, vp, v3) {
            return pinf + 0.5 * rho * v3 * v3 - 0.5 * rho * vp * vp;
        },
        function pinfFromP2RhoVpV3(p2, rho, vp, v3) {
            return p2 + 0.5 * rho * vp * vp - 0.5 * rho * v3 * v3;
        },
        function rhoFromP2PinfVpV3(p2, pinf, vp, v3) {
            return (p2 - pinf) / (0.5 * v3 * v3 - 0.5 * vp * vp);
        },
        function vpFromP2PinfRhoV3(p2, pinf, rho, v3) {
            var vp = Math.sqrt(
                (0.5 * rho * v3 * v3 - (p2 - pinf)) / (0.5 * rho)
            );
            return vp;
        },
        function v3FromP2PinfRhoVp(p2, pinf, rho, vp) {
            var v3 = Math.sqrt(
                ((p2 - pinf) + 0.5 * rho * vp * vp) / (0.5 * rho)
            );
            return v3;
        }
    ];
    formulas[43] = [ // Propeller pressure jump
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
    ];
    formulas[44] = [ // Thrust force
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
    ];
    formulas[45] = [ // Prop velocity
        function vpFromV3V(v3, v) {
            return 0.5 * (v3 + v);
        },
        function vFromVpV3(vp, v3) {
            return 2 * vp - v3;
        }
    ];
    formulas[46] = [ // Slipstream velocity
        function v3FromVpV(vp, v) {
            return 2 * vp - v;
        }
    ];
    formulas[47] = [ // Available propeller thrust
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
    ];
    formulas[48] = [ // Engine power at shaft
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
        },
        function etaFromTVVp(t, v, vp) {
            return t * v / (t * vp);
        },
        function vFromEtaTVp(eta, t, vp) {
            return eta * t * vp / t;
        },
        function vpFromEtaTV(eta, t, v) {
            return t * v / (t * eta);
        },
        function etaFromVVp(v, vp) {
            return v / vp;
        },
        function vFromEtaVp(eta, vp) {
            return eta * vp;
        },
        function vpFromEtaV(eta, v) {
            return v / eta;
        }
    ];
    formulas[49] = [ // Propeller efficiency
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
    ];
    formulas[50] = [ // Propeller velocity
        function bhpFromSigmaDpVEta(sigma, dp, v, eta) {
            return sigma * consts.SEALEVEL_DENSITY * Math.PI / 2 *
                (1 - eta) * Math.pow(v, 3) / Math.pow(eta, 3) *
                Math.pow(dp / 60, 2) *
                Math.pow(5280 / 60, 3) / consts.BPH_PER_MIN;
        },
        function sigmaFromBhpDpVEta(bhp, dp, v, eta) {
            return 2 / (consts.SEALEVEL_DENSITY * Math.PI * (1 - eta)) *
            Math.pow(60 / dp, 2) * Math.pow(eta / v, 3) *
            consts.BPH_PER_MIN * bhp * Math.pow(60 / 5280, 3);
        },
        function dpFromBhpSigmaVEta(bhp, sigma, v, eta) {
            return Math.sqrt(2 / (sigma * consts.SEALEVEL_DENSITY) /
                Math.PI * Math.pow(eta, 3) / (1 - eta) /
                (Math.pow(v, 3)) / Math.pow(5280 / 60, 3) *
                consts.BPH_PER_MIN * bhp * Math.pow(60, 2));
        },
        function vFromBhpSigmaDpEta(bhp, sigma, dp, eta) {
            return Math.pow(2 / (sigma * consts.SEALEVEL_DENSITY) /
                Math.PI * Math.pow(60 / dp, 2) * bhp * consts.BPH_PER_MIN /
                (1 - eta), 1 / 3) * eta * 60 / 5280;
        }
    ];
    formulas[51] = [ // Propeller velocity
        function vpropFromBhpSigmaDp(bhp, sigma, dp) {
            return Math.pow(1 / (sigma * consts.SEALEVEL_DENSITY) *
                Math.pow(60 / dp, 2) * Math.pow(60 / 5280, 3) *
                bhp * consts.BPH_PER_MIN, 1 / 3);
        },
        function bhpFromVpropSigmaDp(vprop, sigma, dp) {
            var bhp = consts.SEALEVEL_DENSITY / consts.BPH_PER_MIN *
                Math.pow(5280 / 60, 3) / Math.pow(60, 2) *
                sigma * dp * dp * Math.pow(vprop, 3);
            return bhp;
        },
        function sigmaFromVpropBhpDp(vprop, bhp, dp) {
            var sigma = consts.BPH_PER_MIN / consts.SEALEVEL_DENSITY *
                Math.pow(60, 2) / Math.pow(5280 / 60 * vprop, 3) *
                bhp / Math.pow(dp, 2);
            return sigma;
        },
        function dpFromVpropBhpSigma(vprop, bhp, sigma) {
            var dp = Math.sqrt(
                consts.BPH_PER_MIN / consts.SEALEVEL_DENSITY *
                Math.pow(60, 2) / Math.pow(5280 / 60, 3) *
                bhp / (Math.pow(vprop, 3) * sigma)
            );
            return dp;
        }
    ];
    formulas[52] = [ // Cubic equation for dimensionless velocity
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
    ];
    formulas[53] = [ // Solution to cubic equation for dimensionless velocity
        function zeroFromEtaVtilde(eta, vtilde) {
            var zero = Math.pow(eta, 3) + Math.PI / 2 *
                Math.pow(vtilde, 3) * eta - Math.PI / 2 *
                Math.pow(vtilde, 3);
            return zero;
        }
    ];
    formulas[54] = [ // Solution to cubic equation for dimensionless velocity
        function etaFromVtilde(vtilde) {
            var eta = solvePoly([
                1,
                0,
                Math.pow(vtilde, 3) * Math.PI / 2,
                -Math.pow(vtilde, 3) * Math.PI / 2
            ])[0];
            return eta;
        }
    ];
    formulas[55] = [ // Nondimensional advance ratio (per second)
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
    ];
    formulas[56] = [ // Nondimensional advance ratio (per hour)
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
    ];
    formulas[57] = [ // Dimensionless power coefficient as ft-lb/sec
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
    ];
    formulas[58] = [ // Dimensionless power coefficient as rpm
        function cpFromBhpRpmDp(bhp, rpm, dp) {
            return 550 * bhp * Math.pow(60, 3) / (consts.SEALEVEL_DENSITY *
                Math.pow(rpm, 3) * Math.pow(dp, 5));
        },
        function bhpFromCpRpmDp(cp, rpm, dp) {
            return cp * (consts.SEALEVEL_DENSITY * Math.pow(rpm, 3) *
                Math.pow(dp, 5)) / (550 * Math.pow(60, 3));
        },
        function rpmFromCpBhpDp(cp, bhp, dp) {
            return Math.pow(550 * Math.pow(60, 3) * bhp /
                (cp * consts.SEALEVEL_DENSITY * Math.pow(dp, 5)), 1 / 3);
        },
        function dpFromCpBhpRpm(cp, bhp, rpm) {
            return Math.pow(550 * Math.pow(60, 3) * bhp /
                (consts.SEALEVEL_DENSITY * cp * Math.pow(rpm, 3)), 1 / 5);
        }
    ];
    formulas[59] = [ // Formula 59: Dimensionless velocity from
                     //             advance ratio and power coefficient
        function vtildeFromJCp(j, cp) {
            return j / Math.pow(cp, 3);
        },
        function jFromVtildeCp(vtilde, cp) {
            return vtilde * Math.pow(cp, 3);
        },
        function cpFromVtildeJ(vtilde, j) {
            return Math.pow(j / vtilde, 1 / 3);
        }
    ];
    formulas[60] = [ // Approximation of static thrust as ft-lb/sec
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
    ];
    formulas[61] = [ // Approximation of static thrust as rpm
        function tsFromSigmaDpBhp(sigma, dp, bhp) {
            return Math.pow(2 * sigma * consts.SEALEVEL_DENSITY *
                areaFromRadius(dp / 2) *
                Math.pow(bhp * consts.BPH_PER_MIN / 60, 2), 1 / 3);
        },
        function sigmaFromTsDpBhp(ts, dp, bhp) {
            var sigma = Math.pow(ts, 3) /
                (2 * consts.SEALEVEL_DENSITY * areaFromRadius(dp / 2) *
                Math.pow(bhp * consts.BPH_PER_MIN / 60, 2));
            return sigma;
        },
        function dpFromTsSigmaBhp(ts, sigma, bhp) {
            var dp = radiusFromArea(Math.pow(ts, 3) /
                (2 * sigma * consts.SEALEVEL_DENSITY *
                Math.pow(bhp * consts.BPH_PER_MIN / 60, 2))) * 2;
            return dp;
        },
        function bhpFromTsSigmaDp(ts, sigma, dp) {
            return Math.sqrt(Math.pow(ts, 3) / (2 * sigma *
                consts.SEALEVEL_DENSITY * areaFromRadius(dp / 2) *
                Math.pow(consts.BPH_PER_MIN / 60, 2)));
        }
    ];
    formulas[62] = [ // Ideal thrust from an engine-propeller combination
        function thatFromEtaVtilde(eta, vtilde) {
            return Math.pow(2 / Math.PI, 1 / 3) * eta / vtilde;
        },
        function etaFromThatVtilde(that, vtilde) {
            return that * vtilde / Math.pow(2 / Math.PI, 1 / 3);
        },
        function vtildeFromThatEta(that, eta) {
            return Math.pow(2 / Math.PI, 1 / 3) * eta / that;
        }
    ];
    formulas[63] = [ // Idealised thrust ratio from dimensionless velocity
        function thatFromVtilde(vtilde) {
            return 1 / Math.pow(2, 1 / 3) *
                (Math.pow(1 + Math.sqrt(
                    1 + 2 * Math.PI / 27 * Math.pow(vtilde, 3)
                ), 1  / 3) - Math.pow(-1 + Math.sqrt(
                    1 + 2 * Math.PI / 27 * Math.pow(vtilde, 3)
                ), 1  / 3));
        }
    ];
    formulas[64] = [ // Propeller tip mach number
        function mpFromRpmDp(rpm, dp) {
            return Math.PI / (60 * consts.SPEED_OF_SOUND) * rpm * dp;
        },
        function rpmFromMpDp(mp, dp) {
            return 60 * consts.SPEED_OF_SOUND / Math.PI * mp / dp;
        },
        function dpFromMpRpm(mp, rpm) {
            return 60 * consts.SPEED_OF_SOUND / Math.PI * mp / rpm;
        }
    ];
    var appendicies = {};
    appendicies.d = [
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ]
    ];
    appendicies.d[1] = [ // D.1: Differential of vertical momentum equation
        function dpFromRhoDh(rho, dh) {
            return -rho * consts.G * dh;
        },
        function dhFromDpRho(dp, rho) {
            return dp / (-rho * consts.G);
        },
        function rhoFromDpDh(dp, dh) {
            return -dp / (consts.G * dh);
        }
    ];
    appendicies.d[2] = [ // D.2: Hydrostatic variation for water
        function pFromP0H(p0, h) {
            return p0 - Math.pow(p0, consts.G * h);
        }
    ];
    appendicies.d[3] = [ // D.3: Equation of state
        function pFromRhoF(rho, f) {
            var rankine = f + consts.FAHRENHEIT_TO_RANKINE;
            return rho * consts.R * rankine;
        },
        function rFromF(f) {
            return f + consts.FAHRENHEIT_TO_RANKINE;
        },
        function fFromR(r) {
            return r - consts.FAHRENHEIT_TO_RANKINE;
        }
    ];
    appendicies.d[4] = [ // D.4: Substituting into D.1
    ];
    appendicies.d[5] = []; // D.5: Integrate for isothermal atmosphere
    appendicies.d[6] = [   // D.6: Expressed as a solution for p
        function pFromP0HT0(p0, h, t0) {
            var p = p0 * Math.exp(
                -consts.G * h / (consts.R * t0)
            );
            return p;
        },
        function hFromPP0T0(p, p0, t0) {
            return Math.log(p / p0) * consts.R * t0 / -consts.G;
        },
        function t0FromPP0H(p, p0, h) {
            var t0 = -consts.G * h / (
                Math.log(p / p0) * consts.R
            );
            return t0;
        }
    ];
    appendicies.d[7] = [   // D.7: Substituting in to D.3 for density ratio
        function sigmaFromHT0(h, t0) {
            return Math.exp(-consts.G * h / (consts.R * t0));
        },
        function hFromSigmaT0(sigma, t0) {
            return Math.log(sigma) * (consts.R * t0) / -consts.G;
        },
        function t0FromSigmaH(sigma, h) {
            return -consts.G * h / (Math.log(sigma) * consts.R);
        }
    ];
    appendicies.d[8] = [   // D.8: Defined with characteristic altitude
        function sigmaFromHH0(h, h0) {
            return Math.exp(-h / h0);
        },
        function hFromSigmaH0(sigma, h0) {
            return Math.log(sigma) * -h0;
        },
        function h0FromSigmaH(sigma, h) {
            return -h / Math.log(sigma);
        }
    ];
    appendicies.d[9] = []; // D.9: Reformulate D.4 to adjust for altitude
    appendicies.d[10] = []; // D.10: Take the integral of the D.9 formula
    appendicies.d[11] = []; // D.11: Remove log terms from D20 formula
    appendicies.d[12] = [   // D.12: Variation of density ratio with altitude
        //       (by substituting into D.3)
        function sigmaFromHF(h, f) {
            var densityRatioRankine;
            var sigma;
            var rankine;
            densityRatioRankine = function (h, tsl_r) {
                var temperatureDecreaseRatio = consts.BETA / tsl_r;
                return Math.pow(1 - temperatureDecreaseRatio * h,
                    consts.G / (consts.R * consts.BETA) - 1);
            };
            rankine = f + consts.FAHRENHEIT_TO_RANKINE;
            if (h >= 36240) {
                rankine = -70 + consts.FAHRENHEIT_TO_RANKINE;
            }
            sigma = densityRatioRankine(h, rankine);
            return sigma;
        },
        function hFromSigmaF(sigma, f) {
            var h;
            function ratioHeight() {
                var tsl = f + consts.FAHRENHEIT_TO_RANKINE;
                var temperatureDecreaseRatio = consts.BETA / tsl;
                var height = (1 - Math.pow(sigma, 1 / (consts.G /
                    (consts.R * consts.BETA) - 1))) /
                    temperatureDecreaseRatio;
                return height;
            }
            h = ratioHeight(sigma, f);
            return h;
        },
        function fFromSigmaH(sigma, h) {
            var temperatureDecreaseRatio = (1 - Math.pow(sigma, 1 /
                (consts.G / (consts.R * consts.BETA) - 1)
            )) / h;
            var tsl = consts.BETA / temperatureDecreaseRatio;
            return tsl - consts.FAHRENHEIT_TO_RANKINE;
        }
    ];
    appendicies.d[13] = []; // D.13: estimated values for variation of density
    appendicies.d[14] = []; // D.14: estimated values for variation of density
       //       from 36240 ft to 82000 ft
    appendicies.f = [ // Airplane efficiency factor e, and ground effect
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ]
    ];
    appendicies.f[1] = [
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
    ];
    appendicies.f[2] = [
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
    ];
    appendicies.f[3] = [ // no F.3 in appendix
    ];
    appendicies.f[4] = [ // no F.4 in appendix
    ];
    appendicies.f[5] = [ // Appendix F.5
        function adFromCdwindSCdfuseSfuseCdcompScomp(cdwing, s,
            cdfuse, sfuse, cdcomp, scomp) {
            return cdwing * s + cdfuse * sfuse + cdcomp * scomp;
        }
    ];
    appendicies.f[6] = [ // Appendix F.6
        function liftSlopeFromAr(ar) {
            var radiansToDegrees = consts.RADIANS_TO_DEGREES;
            var liftSlopePerDegree = Math.PI  / 0.5 * radiansToDegrees;
            return liftSlopePerDegree * ar / (ar + 3);
        },
        function arFromLiftslope(liftSlope) {
            var radiansToDegrees = consts.RADIANS_TO_DEGREES;
            var liftSlopePerDegree = Math.PI / 0.5 * radiansToDegrees;
            return 3 * liftSlope / (liftSlopePerDegree - liftSlope);
        }
    ];
    appendicies.f[7] = [ // Appendix F.7
        function clFromLiftslopeAlpha(liftSlope, alpha) {
            return liftSlope * alpha;
        },
        function liftSlopeFromClAlpha(cl, alpha) {
            return cl / alpha;
        },
        function alphaFromClLiftslope(cl, liftSlope) {
            return cl / liftSlope;
        }
    ];
    appendicies.f[8] = [ // Appendix F.8
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
                consts.RADIANS_TO_DEGREES;
            var cdfuse = deltafuse * ar / (Math.PI * kfuse * Math.pow(
                (ar + 3) / liftSlopePerDegree, 2)
            ) / (sfuse / s);
            return cdfuse;
        },
        function kfuseFromDeltafuseArCdfuseSfuseS(deltafuse, ar,
            cdfuse, sfuse, s) {
            var liftSlopePerDegree = Math.PI  / 0.5 *
                consts.RADIANS_TO_DEGREES;
            var kfuse = deltafuse * ar / (Math.PI * cdfuse * Math.pow(
                (ar + 3) / liftSlopePerDegree, 2
            ) * sfuse / s);
            return kfuse;
        },
        function sfuseFromDeltafuseArCdfuseKfuseS(deltafuse, ar,
            cdfuse, kfuse, s) {
            var liftSlopePerDegree = Math.PI  / 0.5 *
                consts.RADIANS_TO_DEGREES;
            var sfuse = deltafuse / (Math.PI * cdfuse * kfuse *
                Math.pow((ar + 3) / liftSlopePerDegree, 2) / ar
            ) * s;
            return sfuse;
        },
        function sFromDeltafuseArCdfuseKfuseSfuse(deltafuse, ar,
            cdfuse, kfuse, sfuse) {
            var liftSlopePerDegree = Math.PI  / 0.5 *
                consts.RADIANS_TO_DEGREES;
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
    ];
    appendicies.f[9] = [ // Appendix F charts
        function ewFromArWingshape(ar, wing_shape) {
            var ewing = {
                rectangular: (ar >= 1 && ar <= 20) &&
                        -0.0001299978216 * Math.pow(ar, 4) +
                        0.004834347856 * Math.pow(ar, 3) -
                        0.06620280841 * Math.pow(ar, 2) +
                        0.3637235757 * ar + 0.1852971495,
                tapered: (ar >= 1 && ar <= 20) &&
                        -0.00003880517128 * Math.pow(ar, 4) +
                        0.00196650416 * Math.pow(ar, 3) -
                        0.03706755805 * Math.pow(ar, 2) +
                        0.2647194811 * ar + 0.2944072497,
                delta: (ar >= 0 && ar <= 6) &&
                        0.0005303030303 * Math.pow(ar, 4) -
                        0.01136363636 * Math.pow(ar, 3) +
                        0.09189393939 * Math.pow(ar, 2) -
                        0.3853896104 * ar + 1.000822511,
                elliptical: 1
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
    ];
    appendicies.g = [ // Drag analysis
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ]
    ];
    appendicies.g[1] = [ // Appendix G.1
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
    ];
    appendicies.g[2] = [ // Appendix G.2
        function cdwFromRel(rel) {
            // default behaviour is for laminar airflow
            return consts.BLASIUS / Math.sqrt(rel);
        }
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
        ]
    ];
    appendicies.i[1] = [
        function muFromF(f) {
            // μ = 2.270 * (T^(3/2) / T + 198.6) * 10^-8
            var rankine = f + consts.FAHRENHEIT_TO_RANKINE;
            return 2.270 * Math.pow(rankine, 3 / 2) /
                    (rankine + 198.6) * 1e-8;
        },
        function relFromRhoVMuC(rho, v, mu, c) {
            var vfs = v * consts.MPH_TO_FPS;
            var inertia = rho * vfs * vfs;
            var viscous = mu * vfs / c;
            return inertia / viscous;
        }
    ];
    appendicies.j = [
        [
            function dummyFunc(dummy) {
                return dummy;
            }
        ]
    ];
    appendicies.j[1] = [
        function pFromRhoR(rho, r) {
            return rho * consts.R * r;
        },
        function rhoFromPR(p, r) {
            return p / (consts.R * r);
        },
        function rFromPRho(p, rho) {
            return p / (rho * consts.R);
        },
        function sigmaFromRho(rho) {
            return rho / consts.SEALEVEL_DENSITY;
        },
        function rhoFromSigma(sigma) {
            return sigma * consts.SEALEVEL_DENSITY;
        }
    ];
    return {
        formulas: formulas,
        appendicies: appendicies
    };
}
