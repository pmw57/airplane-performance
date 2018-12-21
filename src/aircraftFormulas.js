/*jslint browser:true */
/*globals */

function aircraftFormulas(constants, solvePoly) {
    "use strict";

    var sea_level_density = 0.0023769;
    var airDensity = 0.5 * sea_level_density * Math.pow(5280 / 3600, 2);
    var hpMPH = 33000 * 60 / 5280;
    var formulas = [
            [
            // Relation 1: CL, V, W/S
            // Lift Coefficient, Airspeed, Wing Loading
            function wsFromClV(cl, v) {
                var ws = cl * v * v * airDensity;
                return ws;
            },
            function clFromWsV(ws, v) {
                var cl = ws / (v * v * airDensity);
                return cl;
            },
            function vFromWsCl(ws, cl) {
                var v = Math.sqrt(ws / (cl * airDensity));
                return v;
            },
            // Relation 2: S, W/S, W
            // Wing Area, Wing Loading, Gross Weight
            function sFromWsW(ws, w) {
                var s = w / ws;
                return s;
            },
            function wsFromWS(w, s) {
                var ws = w / s;
                return ws;
            },
            function wFromWsS(ws, s) {
                var w = ws * s;
                return w;
            },
            // Relation 3: S, be, eAR, ce
            // Wing Area, Effective Span, Effetive Aspect Ratio, Effective Chord
            // ar function defined in formula 14
            function cFromSB(b, s) {
                var c = s / b;
                return c;
            },
            function bFromSC(s, c) {
                var b = s / c;
                return b;
            },
            function sFromBC(b, c) {
                var s = b * c;
                return s;
            },
            // Relation 5: AD, Vmax, THPa
            // Drag area, maximum level speed, available thrust horsepower
            function thpaFromAdVmax(ad, vmax) {
                var thpa = ad * Math.pow(vmax, 3) * airDensity / hpMPH;
                return thpa;
            },
            function adFromThpaVmax(thpa, vmax) {
                var ad = thpa / Math.pow(vmax, 3) * hpMPH / airDensity;
                return ad;
            },
            function vmaxFromThpaAd(thpa, ad) {
                var vmax = Math.pow(thpa / ad * hpMPH / airDensity, 1 / 3);
                return vmax;
            },
            // Relation 6: CD0, AD, S
            // Zero-lift drag, drag area, and wing area
            function dFromAdV(ad, v) {
                var d = ad * Math.pow(v, 2) * airDensity;
                return d;
            },
            function adFromDV(d, v) {
                var ad = d / (Math.pow(v, 2) * airDensity);
                return ad;
            },
            function vFromDAD(d, ad) {
                var v = Math.sqrt(d / (ad * airDensity));
                return v;
            },
            function sFromAdCd0(ad, cd0) {
                var s = ad / cd0;
                return s;
            },
            function adFromCd0S(cd0, s) {
                var ad = cd0 * s;
                return ad;
            },
            function cd0FromAdS(ad, s) {
                var cd0 = ad / s;
                return cd0;
            },
            function dFromCd0SV(cd0, s, v) {
                var d = cd0 * s * Math.pow(v, 2) * airDensity;
                return d;
            },
            function cd0FromDSV(d, s, v) {
                var cd0 = d / (s * Math.pow(v, 2) * airDensity);
                return cd0;
            },
            function sFromDCd0V(d, cd0, v) {
                var s = d / (cd0 * Math.pow(v, 2) * airDensity);
                return s;
            },
            function vFromDCd0S(d, cd0, s) {
                var v = Math.sqrt(d / (cd0 * s * airDensity));
                return v;
            },
            function dFromSigmaCdSV(sigma, cd, s, v) {
                var d = sigma * airDensity * cd * s * Math.pow(v, 2);
                return d;
            },
            function sigmaFromDCdSV(d, cd, s, v) {
                var sigma = d / (airDensity * cd * s * Math.pow(v, 2));
                return sigma;
            },
            function cdFromSigmaCdSV(d, sigma, s, v) {
                var cd = d / (sigma * airDensity * s * Math.pow(v, 2));
                return cd;
            },
            function sFromSigmaCdSV(d, sigma, cd, v) {
                var s = d / (sigma * airDensity * cd * Math.pow(v, 2));
                return s;
            },
            function vFromSigmaCdSV(d, sigma, cd, s) {
                var v = Math.sqrt(d / (sigma * airDensity * cd * s));
                return v;
            },
            // Relation 7: AD, VminS, W/be, THPmin, Dmin
            // Drag Area, Airspeed for Minimum Sink, Effective Span Loading,
            // Minimum power required for Level Flight, Minimum Drag
            function vminsFromAdWbe(ad, wbe) {
                var vmins = 1 / (Math.sqrt(airDensity) *
                    Math.pow(3 * Math.PI * ad, 1 / 4) / Math.sqrt(wbe));
                return vmins;
            },
            function wbeFromVminsAd(vmins, ad) {
                var wbe = airDensity * Math.pow(3 * Math.PI * ad, 1 / 2) *
                    Math.pow(vmins, 2);
                return wbe;
            },
            function adFromVminsWbe(vmins, wbe) {
                var ad = Math.pow(wbe, 2) / (Math.pow(airDensity, 2) *
                    3 * Math.PI * Math.pow(vmins, 4));
                return ad;
            },
            function thpminFromAdWbe(ad, wbe) {
                var thpmin = 5280 / 60 * 4 / 33000 *
                1 / Math.sqrt(airDensity) * 1 / Math.pow(3 * Math.PI, 3 / 4) *
                Math.pow(ad, 1 / 4) * Math.pow(wbe, 3 / 2);
                return thpmin;
            },
            function adFromThpminWbe(thpmin, wbe) {
                var ad = Math.pow(33000 / 4 * 60 / 5280 *
                    Math.sqrt(airDensity) * Math.pow(3 * Math.PI, 3 / 4) *
                    thpmin / Math.pow(wbe, 3 / 2), 4);
                return ad;
            },
            function wbeFromThpminAd(thpmin, ad) {
                var wbe = Math.pow(33000 / 4 * 60 / 5280 *
                    Math.pow(3 * Math.PI, 3 / 4) * Math.sqrt(airDensity) *
                    thpmin / Math.pow(ad, 1 / 4), 2 / 3);
                return wbe;
            },
            function dminFromAdWbe(ad, wbe) {
                var dmin = 2 / Math.sqrt(Math.PI) * Math.sqrt(ad) * wbe;
                return dmin;
            },
            function adFromDminWbe(dmin, wbe) {
                var ad = Math.pow(dmin * Math.sqrt(Math.PI) / (2 * wbe), 2);
                return ad;
            },
            function wbeFromDminAd(dmin, ad) {
                var wbe = Math.sqrt(Math.PI) * dmin / (2 * Math.sqrt(ad));
                return wbe;
            },
            // Relation 8: RSmin, THPmin, W
            // Minimum Sink Rate, Minimum Power Required
            // for Level Flight, weight
            function rsFromThpminW(thp, w) {
                var rs = 33000 * thp / w;
                return rs;
            },
            function thpFromRsW(rs, w) {
                var thp = rs * w / 33000;
                return thp;
            },
            function wFromRsThpmin(rs, thp) {
                var w = 33000 * thp / rs;
                return w;
            },
            function rsminFromThpminW(thpmin, w) {
                var rsmin = 33000 * thpmin / w;
                return rsmin;
            },
            function thpminFromRsminW(rsmin, w) {
                var thpmin = rsmin * w / 33000;
                return thpmin;
            },
            function wFromRsminThpmin(rsmin, thpmin) {
                var w = 33000 * thpmin / rsmin;
                return w;
            },
            function rsminFromThpminW(thp, w) {
                var rsmin = 33000 * thp / w;
                return rsmin;
            },
            function thpminFromRsminW(rsmin, w) {
                var thpmin = rsmin * w / 33000;
                return thpmin;
            },
            function wFromRsminThpmin(rsmin, thpmin) {
                var w = 33000 * thpmin / rsmin;
                return w;
            },
            function rcFromRsThpaW(rs, thpa, w) {
                var rcPlusRs = 33000 * thpa / w;
                var rc = rcPlusRs - rs;
                return rc;
            },
            function rsFromRcThpaW(rc, thpa, w) {
                var rcPlusRs = 33000 * thpa / w;
                var rs = rcPlusRs - rc;
                return rs;
            },
            function thpaFromRcRsW(rc, rs, w) {
                var thpa = (rc + rs) * w / 33000;
                return thpa;
            },
            function wFromRcRsThpa(rc, rs, thpa) {
                var w = 33000 * thpa / (rc + rs);
                return w;
            },
            // Relation 9: AD, be, (L/D)max
            // Drag Area, Effective Span, Maximum Lift-to-Drag Ratio
            function ldmaxFromEarCd0(ear, cd0) {
                var ldmax = Math.sqrt(Math.PI) / 2 * Math.sqrt(ear / cd0);
                return ldmax;
            },
            function earFromLdmaxCd0(ldmax, cd0) {
                var ear = Math.pow(2 / Math.sqrt(Math.PI) * ldmax, 2) * cd0;
                return ear;
            },
            function cd0FromLdmaxEar(ldmax, ear) {
                var cd0 = Math.pow(2 * ldmax, -2) * Math.PI * ear;
                return cd0;
            }
        ],
        [ // formula 1
            function dFromWThetag(w, thetag) {
                var d = w * Math.sin(thetag * Math.TAU / 360);
                return d;
            },
            function wFromDThetag(d, thetag) {
                var w = d / Math.sin(thetag * Math.TAU / 360);
                return w;
            },
            function thetagFromDW(d, w) {
                var thetag = Math.asin(d / w) * 360 / Math.TAU;
                return thetag;
            }
        ],
        [ // Formula 2
            function lFromWThetag(w, thetag) {
                var l = w * Math.cos(thetag * Math.TAU / 360);
                return l;
            },
            function wFromLThetag(l, thetag) {
                var w = l / Math.cos(thetag * Math.TAU / 360);
                return w;
            },
            function thetagFromLW(l, w) {
                var thetag = Math.acos(l / w) / Math.TAU * 360;
                return thetag;
            }
        ],
        [ // Formula 3
            function clFromLRhoVfsS(l, rho, vfs, s) {
                var cl = l / (0.5 * rho * vfs * vfs * s);
                return cl;
            },
            function lFromCLRhoVfsS(cl, rho, vfs, s) {
                var l = 0.5 * cl * rho * vfs * vfs * s;
                return l;
            },
            function rhoFromClLVfsS(cl, l, vfs, s) {
                var rho = 2 * l / (cl * vfs * vfs * s);
                return rho;
            },
            function vfsFromClLRhoS(cl, l, rho, s) {
                var vfs = Math.sqrt(2 * l / (cl * rho * s));
                return vfs;
            },
            function sFromClLRhoVfs(cl, l, rho, vfs) {
                var s = 2 * l / (cl * rho * vfs * vfs);
                return s;
            },
            function vFromVfs(vfs) {
                var v = vfs * window.CONSTANTS.MPH_TO_FPS;
                return v;
            },
            function vfsFromV(v) {
                var vfs = v * window.CONSTANTS.FPS_TO_MPH;
                return vfs;
            }
        ],
        [ // Formula 4
            function cdFromDRhoVfsS(d, rho, vfs, s) {
                var cd = d / (0.5 * rho * vfs * vfs * s);
                return cd;
            },
            function dFromCdRhoVfsS(cd, rho, vfs, s) {
                var d = 0.5 * rho * cd * vfs * vfs * s;
                return d;
            },
            function rhoFromCdDVfsS(cd, d, vfs, s) {
                var rho = d / (0.5 * cd * vfs * vfs * s);
                return rho;
            },
            function vfsFromCdDRhoS(cd, d, rho, s) {
                var vfs = Math.sqrt(d / (0.5 * rho * cd * s));
                return vfs;
            },
            function sFromCdDRhoVfs(cd, d, rho, vfs) {
                var s = d / (0.5 * rho * cd * vfs * vfs);
                return s;
            }
        ],
        [ // Formula 5
            function dFromSigmaCdSV(sigma, cd, s, v) {
                var d = sigma * cd * s * v * v * airDensity;
                return d;
            },
            function sigmaFromdCdSV(d, cd, s, v) {
                var sigma = d / (cd * s * v * v * airDensity);
                return sigma;
            },
            function cdFromDSigmaSV(d, sigma, s, v) {
                var cd = d / (sigma * s * v * v * airDensity);
                return cd;
            },
            function sFromDSigmaCdV(d, sigma, cd, v) {
                var s = d / (sigma * cd * v * v * airDensity);
                return s;
            },
            function vFromDSigmaCdS(d, sigma, cd, s) {
                var v = Math.sqrt(d / (sigma * cd * s * airDensity));
                return v;
            }
        ],
        [ // Formula 6
            function lFromSigmaClSV(sigma, cl, s, v) {
                var l = sigma * cl * s * v * v * airDensity;
                return l;
            },
            function sigmaFromLClSV(l, cl, s, v) {
                var sigma = l / (cl * s * v * v * airDensity);
                return sigma;
            },
            function clFromLSigmaSV(l, sigma, s, v) {
                var cl = l / (sigma * s * v * v * airDensity);
                return cl;
            },
            function sFromLSigmaClV(l, sigma, cl, v) {
                var s = l / (sigma * cl * v * v * airDensity);
                return s;
            },
            function vFromLSigmaClS(l, sigma, cl, s) {
                var v = Math.sqrt(l / (sigma * cl * s * airDensity));
                return v;
            }
        ],
        [ // Formula 7
            function wsFromWS(w, s) {
                var ws = w / s;
                return ws;
            },
            function wFromWsS(ws, s) {
                var w = ws * s;
                return w;
            },
            function sFromWsW(ws, w) {
                var s = w / ws;
                return s;
            },
            function wsFromSigmaClV(sigma, cl, v) {
                var ws = sigma * cl * v * v * airDensity;
                return ws;
            },
            function sigmaFromWsClV(ws, cl, v) {
                var sigma = ws / (cl * v * v * airDensity);
                return sigma;
            },
            function clFromWsSigmaV(ws, sigma, v) {
                var cl = ws / (sigma * v * v * airDensity);
                return cl;
            },
            function vFromWsSigmaCl(ws, sigma, cl) {
                var v = Math.sqrt(ws / (sigma * cl * airDensity));
                return v;
            },
            function wsFromSigmaClmaxVs1(sigma, clmax, vs1) {
                var ws = sigma * clmax * vs1 * vs1 * airDensity;
                return ws;
            },
            function sigmaFromWsClmaxVs1(ws, clmax, vs1) {
                var sigma = ws / (clmax * vs1 * vs1 * airDensity);
                return sigma;
            },
            function clmaxFromWsSigmaVs1(ws, sigma, vs1) {
                var clmax = ws / (sigma * vs1 * vs1 * airDensity);
                return clmax;
            },
            function vs1FromWsSigmaCl(ws, sigma, cl) {
                var vs1 = Math.sqrt(ws / (sigma * cl * airDensity));
                return vs1;
            },
            function wsFromSigmaClmaxfVs0(sigma, clmaxf, vs0) {
                var ws = sigma * clmaxf * vs0 * vs0 * airDensity;
                return ws;
            },
            function sigmaFromWsClmaxfVs0(ws, clmaxf, vs0) {
                var sigma = ws / (clmaxf * vs0 * vs0 * airDensity);
                return sigma;
            },
            function clmaxfFromWsSigmaVs0(ws, sigma, vs0) {
                var clmaxf = ws / (sigma * vs0 * vs0 * airDensity);
                return clmaxf;
            },
            function vs0FromWsSigmaClmaxf(ws, sigma, clmaxf) {
                var vs0 = Math.sqrt(ws / (sigma * clmaxf * airDensity));
                return vs0;
            },
            function wsFromSigmaClVmax(sigma, cl, vmax) {
                var ws = sigma * cl * vmax * vmax * airDensity;
                return ws;
            },
            function sigmaFromWsClVmax(ws, cl, vmax) {
                var sigma = ws / (cl * vmax * vmax * airDensity);
                return sigma;
            },
            function clFromWSigmaVmax(ws, sigma, vmax) {
                var cl = ws / (sigma * vmax * vmax * airDensity);
                return cl;
            },
            function vmaxFromWsSigmaCl(ws, sigma, cl) {
                var vmax = Math.sqrt(ws / (sigma * cl * airDensity));
                return vmax;
            },
            function weFromWWu(w, wu) {
                var we = w - wu;
                return we;
            },
            function wFromWeWu(we, wu) {
                var w = we + wu;
                return w;
            },
            function wuFromWeW(we, w) {
                var wu = w - we;
                return wu;
            }
        ],
        [ // Formula 8
            function thetagFromSigmaCdSV(sigma, cd, s, v) {
                var densityRatio = sigma * airDensity;
                var thetag = 360 / Math.TAU * densityRatio * cd * s * v * v;
                return thetag;
            },
            function sigmaFromThetagCdSV(thetag, cd, s, v) {
                var sigma = Math.TAU / 360 *
                    thetag / (airDensity * cd * s * v * v);
                return sigma;
            },
            function cdFromThetagSigmaSV(thetag, sigma, s, v) {
                var densityRatio = sigma * airDensity;
                var cd = Math.TAU / 360 * thetag / (densityRatio * s * v * v);
                return cd;
            },
            function sFromThetagSigmaCdV(thetag, sigma, cd, v) {
                var densityRatio = sigma * airDensity;
                var s = Math.TAU / 360 * thetag / (densityRatio * cd * v * v);
                return s;
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
                var thetag = 360 / Math.TAU * cd / cl;
                return thetag;
            },
            function cdFromThetagCl(thetag, cl) {
                var cd = Math.TAU / 360 * thetag * cl;
                return cd;
            },
            function clFromThetagCd(thetag, cd) {
                var cl = 360 / Math.TAU * cd / thetag;
                return cl;
            }
        ],
        [ // Formula 10
            function rsFromSigmaCdSVW(sigma, cd, s, v, w) {
                var densityRatio = sigma * airDensity;
                var rs = 5280 / 60 * v * densityRatio * cd * s * v * v / w;
                return rs;
            },
            function sigmaFromRsCdSVW(rs, cd, s, v, w) {
                var sigma = 60 / 5280 * rs *
                    w / (v * airDensity * cd * s * v * v);
                return sigma;
            },
            function cdFromRsSigmaSVW(rs, sigma, s, v, w) {
                var densityRatio = sigma * airDensity;
                var cd = 60 / 5280 * rs * w / (v * densityRatio * s * v * v);
                return cd;
            },
            function sFromRsSigmaCdVW(rs, sigma, cd, v, w) {
                var densityRatio = sigma * airDensity;
                var s = 60 / 5280 * rs * w / (v * densityRatio * cd * v * v);
                return s;
            },
            function vFromRsSigmaCdSW(rs, sigma, cd, s, w) {
                var densityRatio = sigma * airDensity;
                var v = Math.pow(60 / 5280 * rs *
                    w / (densityRatio * cd * s), 1 / 3);
                return v;
            },
            function wFromRsSigmaCdSV(rs, sigma, cd, s, v) {
                var densityRatio = sigma * airDensity;
                var w = 5280 / 60 * v * densityRatio * cd * s * v * v / rs;
                return w;
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
                var cd = cd0 + cdi;
                return cd;
            },
            function cd0FromCdCdi(cd, cdi) {
                var cd0 = cd - cdi;
                return cd0;
            },
            function cdiFromCdCd0(cd, cd0) {
                var cdi = cd - cd0;
                return cdi;
            }
        ],
        [ // Formula 13
            function cdiFromClEAr(cl, e, ar) {
                var cdi = cl * cl / (Math.PI * e * ar);
                return cdi;
            },
            function clFromCdiEAr(cdi, e, ar) {
                var cl = Math.sqrt(cdi * (Math.PI * e * ar));
                return cl;
            },
            function eFromCdiClAr(cdi, cl, ar) {
                var e = cl * cl / (Math.PI * cdi * ar);
                return e;
            },
            function arFromCdiClE(cdi, cl, e) {
                var ar = cl * cl / (cdi * Math.PI * e);
                return ar;
            },
            function cdiFromClEar(cl, ear) {
                var cdi = cl * cl / (Math.PI * ear);
                return cdi;
            },
            function clFromCdiEar(cdi, ear) {
                var cl = Math.sqrt(cdi * (Math.PI * ear));
                return cl;
            },
            function earFromCdiCl(cdi, cl) {
                var ear = cl * cl / (cdi * Math.PI);
                return ear;
            }
        ],
        [ // Formula 14
            function arFromBC(b, c) {
                var ar = b / c;
                return ar;
            },
            function bFromArC(ar, c) {
                var b = ar * c;
                return b;
            },
            function cFromArB(ar, b) {
                var c = b / ar;
                return c;
            },
            function arFromBS(b, s) {
                var ar = b * b / s;
                return ar;
            },
            function bFromArS(ar, s) {
                var b = Math.sqrt(ar * s);
                return b;
            },
            function sFromArB(ar, b) {
                var s = b * b / ar;
                return s;
            }
        ],
        [ // Formula 15
            function cdFromCd0ClEar(cd0, cl, ear) {
                var cd = cd0 + cl * cl / (Math.PI * ear);
                return cd;
            },
            function cd0FromCdClEar(cd, cl, ear) {
                var cd0 = cd - cl * cl / (Math.PI * ear);
                return cd0;
            },
            function clFromCdCd0Ear(cd, cd0, ear) {
                var cl = Math.sqrt((cd - cd0) * Math.PI * ear);
                return cl;
            },
            function earFromCdCd0Cl(cd, cd0, cl) {
                var ear = cl * cl / (Math.PI * (cd - cd0));
                return ear;
            },
            function earFromEAr(e, ar) {
                var ear = e * ar;
                return ear;
            },
            function eFromEarAr(ear, ar) {
                var e = ear / ar;
                return e;
            },
            function arFromEarE(ear, e) {
                var ar = ear / e;
                return ar;
            }
        ],
        [], // Formula 16 - working towards Formula 18
        [], // Formula 17 - working towards Formula 18
        [ // Formula 18
            function clminsFromEarCd0(ear, cd0) {
                var clmins = Math.sqrt(3 * Math.PI * ear * cd0);
                return clmins;
            },
            function earFromClminsCd0(clmins, cd0) {
                var ear = 1 / (3 * Math.PI) * Math.pow(clmins, 2) / cd0;
                return ear;
            },
            function cd0FromClminsEar(clmins, ear) {
                var cd0 = Math.pow(clmins, 2) / (3 * Math.PI * ear);
                return cd0;
            }
        ],
        [ // Formula 19
            function clminsFromAdCe(ad, ce) {
                var clmins = Math.sqrt(3 * Math.PI) * Math.sqrt(ad) / ce;
                return clmins;
            },
            function adFromClminsCe(clmins, ce) {
                var ad = Math.pow(clmins * ce / Math.sqrt(3 * Math.PI), 2);
                return ad;
            },
            function ceFromClminsAd(clmins, ad) {
                var ce = Math.sqrt(3 * Math.PI) / clmins * Math.sqrt(ad);
                return ce;
            },
            function ceFromCE(c, e) {
                var ce = c / Math.sqrt(e);
                return ce;
            },
            function eFromCeE(ce, e) {
                var c = ce * Math.sqrt(e);
                return c;
            },
            function eFromCeC(ce, c) {
                var e = Math.pow(c / ce, 2);
                return e;
            }
            // ad/cd0/s formulas are found in Relation 6
        ],
        [ // Formula 20
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
            },
            function beFromBE(b, e) {
                var be = b * Math.sqrt(e);
                return be;
            },
            function bFromBeE(be, e) {
                var b = be / Math.sqrt(e);
                return b;
            },
            function eFromBeB(be, b) {
                var e = Math.pow(be / b, 2);
                return e;
            }
        ],
        [ // Formula 21
            function vminsFromWBeSigmaAd(w, be, sigma, ad) {
                var vmins = Math.sqrt(1 / airDensity) /
                    Math.pow(3 * Math.PI, 1 / 4) *
                    Math.sqrt(w / be) / Math.sqrt(sigma) /
                    Math.pow(ad, 1 / 4);
                return vmins;
            },
            function wFromVminsBeSigmaAd(vmins, be, sigma, ad) {
                var w = Math.pow(Math.pow(3 * Math.PI, 1 / 4) *
                    Math.sqrt(airDensity) * vmins * Math.sqrt(be) *
                    Math.sqrt(sigma) * Math.pow(ad, 1 / 4), 2);
                return w;
            },
            function beFromVminsWSigmaAd(vmins, w, sigma, ad) {
                var be = w / (airDensity * Math.sqrt(3 * Math.PI) *
                    Math.pow(vmins, 2) * sigma * Math.sqrt(ad));
                return be;
            },
            function sigmaFromvMinsWBeAd(vmins, w, be, ad) {
                var sigma = w / (airDensity * Math.sqrt(3 * Math.PI) *
                    Math.pow(vmins, 2) * be * Math.sqrt(ad));
                return sigma;
            },
            function adFromVminsWBeSigma(vmins, w, be, sigma) {
                var ad = Math.pow(1 / (airDensity * sigma *
                    Math.sqrt(3 * Math.PI) * Math.pow(vmins, 2)) * w / be, 2);
                return ad;
            },
            function wbeFromWBe(w, be) {
                var wbe = w / be;
                return wbe;
            },
            function wFromWbeBe(wbe, be) {
                var w = wbe * be;
                return w;
            },
            function beFromWbeW(wbe, w) {
                var be = w / wbe;
                return be;
            }
        ],
        [ // Formula 22
            function rsFromSigmaAdVWBe(sigma, ad, v, w, be) {
                var dragArea = sigma * airDensity * ad * Math.pow(v, 3) / w;
                var effectiveSpan = w / (Math.PI * sigma * airDensity *
                    v * Math.pow(be, 2));
                var rs = (dragArea + effectiveSpan) * 5280 / 60;
                return rs;
            },
            function sigmaFromRsAdVWBe(rs, ad, v, w, be) {
                var a = 5280 / 60 * ad * Math.pow(v, 3) * airDensity / w;
                var b = -rs;
                var c = 5280 / 60 * w / (airDensity * Math.PI * v * be * be);
                var sigma = solvePoly([a, b, c])[1];
                return sigma;
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
                var v = solvePoly(coeffs)[1];
                return v;
            },
            function wFromRsSigmaAdVBe(rs, sigma, ad, v, be) {
                var coeffs = [
                    1 / (airDensity * Math.PI * sigma * v * be * be),
                    -60 / 5280 * rs,
                    sigma * ad * Math.pow(v, 3) * airDensity
                ];
                var w = solvePoly(coeffs)[0];
                return w;
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
                var sigmas_dv = 5280 / 60 * 3 * densityRatio * ad * v * v / w -
                    w / (Math.PI * densityRatio * v * v * be * be);
                return sigmas_dv;
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
                var w = solvePoly(coeffs)[0];
                return w;
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
            function vminsFromSigmaWBeAd(sigma, w, be, ad) {
                var vmins = Math.sqrt(1 / airDensity) /
                    Math.pow(3 * Math.PI, 1 / 4) *
                    Math.sqrt(w / be) /
                    (Math.sqrt(sigma) * Math.pow(ad, 1 / 4));
                return vmins;
            },
            function wFromVminsSigmaBeAd(vmins, sigma, be, ad) {
                var w = Math.sqrt(3 * Math.PI) * airDensity *
                    sigma * Math.pow(vmins, 2) * be * Math.sqrt(ad);
                return w;
            },
            function beFromVminsSigmaWAd(vmins, sigma, w, ad) {
                var be = w / (Math.sqrt(3 * Math.PI) * airDensity *
                    sigma * Math.pow(vmins, 2) * Math.sqrt(ad));
                return be;
            },
            function sigmaFromVminsWBeAd(vmins, w, be, ad) {
                var sigma = w / (Math.sqrt(3 * Math.PI) * airDensity *
                    Math.pow(vmins, 2) * be * Math.sqrt(ad));
                return sigma;
            },
            function adFromVminsSigmaWBe(vmins, sigma, w, be) {
                var ad = 1 / (3 * Math.PI) * Math.pow(1 / vmins, 4) *
                Math.pow(w / be / (sigma * airDensity), 2);
                return ad;
            }
        ],
        [ // Formula 25
            function rshatFromVhat(vhat) {
                var rshat = (Math.pow(vhat, 4) + 3) / (4 * vhat);
                return rshat;
            },
            function vhatFromRshatVhat(rshat) {
                var coeffs = [
                    1,
                    0,
                    0,
                    -rshat * 4,
                    3
                ];
                var vhat = solvePoly(coeffs)[1];
                return vhat;
            }
        ],
        [ // Formula 26
            function dgdclFromClCd0Ear(cl, cd0, ear) {
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
                var clmaxld = Math.sqrt(Math.PI * ear * cd0);
                return clmaxld;
            },
            function earFromClmaxldCd0(clmaxld, cd0) {
                var ear = Math.pow(clmaxld, 2) / (Math.PI * cd0);
                return ear;
            },
            function cd0FromClmaxldEar(clmaxld, ear) {
                var cd0 = Math.pow(clmaxld, 2) / (Math.PI * ear);
                return cd0;
            }
        ],
        [ // Formula 28
            // ldmax/ear/cd0 formulas are found in Relation 9
        ],
        [ // Formula 29
            function ldmaxFromBeAd(be, ad) {
                var ldmax = Math.sqrt(Math.PI) / 2 * be / Math.sqrt(ad);
                return ldmax;
            },
            function beFromLdmaxAd(ldmax, ad) {
                var be = 2 / Math.sqrt(Math.PI) * ldmax * Math.sqrt(ad);
                return be;
            },
            function adFromLdmaxBe(ldmax, be) {
                var ad = Math.PI / 4 * Math.pow(be / ldmax, 2);
                return ad;
            }
        ],
        [ // Formula 30
            // ad/cd0/s formulas are found in Relation 7
        ],
        [ // Formula 31
            function thpalFromSigmaAdVWBe(sigma, ad, v, w, be) {
                var thpal = (5280 / 60) / 33000 *
                    (sigma * ad * Math.pow(v, 3) * airDensity +
                    1 / airDensity *
                    Math.pow(w / be, 2) / (Math.PI * sigma * v));
                return thpal;
            },
            function sigmaFromThpalAdVWBe(thpal, ad, v, w, be) {
                var coeffs = [
                    (5280 / 60) / 33000 * ad * Math.pow(v, 3) * airDensity,
                    -thpal,
                    (5280 / 60) / 33000  / airDensity *
                        Math.pow(w / be, 2) / (Math.PI * v)
                ];
                var sigma = solvePoly(coeffs)[1];
                return sigma;
            },
            function adFromThpalSigmaVWBe(thpal, sigma, v, w, be) {
                var ad = 1 / (Math.pow(v, 3) * airDensity * sigma) * (
                    33000 * 60 / 5280 * thpal -
                    1 / airDensity *
                    Math.pow(w / be, 2) / (Math.PI * sigma * v)
                );
                return ad;
            },
            function vFromThpalSigmaAdWBe(thpal, sigma, ad, w, be) {
                var coeffs = [
                    ad * airDensity * sigma,
                    0,
                    0,
                    33000 / (5280 / 60) * thpal,
                    Math.pow(w / be, 2) / (airDensity * Math.PI)
                ];
                var v = -solvePoly(coeffs)[1];
                return v;
            },
            function wFromThpalSigmaAdVBe(thpal, sigma, ad, v, be) {
                var w = Math.sqrt(
                    (thpal / 5280 * 60 * 33000 -
                        sigma * ad * Math.pow(v, 3) * airDensity) *
                    Math.PI * sigma * v * airDensity * be * be
                );
                return w;
            },
            function beFromThpalSigmaAdVW(thpal, sigma, ad, v, w) {
                var be = w / Math.sqrt(
                    airDensity * Math.PI * sigma * v * (
                        33000 * 60 / 5280 * thpal -
                        Math.pow(v, 3) * airDensity * sigma * ad
                    )
                );
                return be;
            },
            function thpaFromAdVmaxSigma(ad, vmax, sigma) {
                var thpa = 88 / 33000 * airDensity *
                    sigma * ad * Math.pow(vmax, 3);
                return thpa;
            },
            function adFromThpaVmaxSigma(thpa, vmax, sigma) {
                var ad = 33000 / 88 / airDensity *
                    sigma * thpa / Math.pow(vmax, 3);
                return ad;
            },
            function vmaxThpaAdSigma(thpa, ad, sigma) {
                var vmax = Math.pow(
                    33000 / 88 / airDensity * sigma * thpa / ad, 1 / 3
                );
                return vmax;
            },
            function thpaFromBhpEta(bhp, eta) {
                var thpa = bhp * eta;
                return thpa;
            },
            function bhpFromThpaEta(thpa, eta) {
                var bhp = thpa / eta;
                return bhp;
            },
            function etaFromThpaBhp(thpa, bhp) {
                var eta = thpa / bhp;
                return eta;
            }
        ],
        [ // Formula 32
            function thpalFromRsW(rs, w) {
                var thpal = rs * w / 33000;
                return thpal;
            },
            function rsFromThpalW(thpal, w) {
                var rs = 33000 * thpal / w;
                return rs;
            },
            function wFromThpalRs(thpal, rs) {
                var w = 33000 * thpal / rs;
                return w;
            }
        ],
        [ // Formula 33
            // todo, simplify using Relation 7 code
            function thpminFromAdSigmaWBe(ad, sigma, w, be) {
                var thpmin = 5280 / 60 * 4 / 33000 *
                Math.sqrt(1 / airDensity) / Math.pow(3 * Math.PI, 3 / 4) *
                Math.pow(ad, 1 / 4) / Math.sqrt(sigma) *
                Math.pow(w / be, 3 / 2);
                return thpmin;
            },
            function adFromThpminSigmaWBe(thpmin, sigma, w, be) {
                var ad = Math.pow(33000 / 4 * 60 / 5280 *
                    Math.sqrt(airDensity) * Math.pow(3 * Math.PI, 3 / 4) *
                    thpmin * Math.sqrt(sigma) / Math.pow(w / be, 3 / 2), 4);
                return ad;
            },
            function sigmaFromThpminAdWBe(thpmin, ad, w, be) {
                var sigma = Math.pow(
                    5280 / 60 * 4 *
                    Math.sqrt(1 / airDensity) * Math.pow(ad, 1 / 4) *
                    Math.pow(w / be, 3 / 2) / (
                        33000 * Math.pow(3 * Math.PI, 3 / 4) * thpmin
                    ), 2
                );
                return sigma;
            },
            function wFromThpminAdSigmaBe(thpmin, ad, sigma, be) {
                var w = Math.pow(60 / 5280 * 33000 *
                    Math.pow(3 * Math.PI, 3 / 4) * thpmin *
                    Math.sqrt(sigma) / (
                        4 * Math.sqrt(1 / airDensity) * Math.pow(ad, 1 / 4)
                    ), 2 / 3) * be;
                return w;
            },
            function beFromThpminAdSigmaW(thpmin, ad, sigma, w) {
                var be = Math.pow(
                    5280 / 60 * 4 / 33000 *
                    Math.sqrt(1 / airDensity) / Math.pow(3 * Math.PI, 3 / 4) *
                    Math.pow(ad, 1 / 4) / (thpmin * Math.sqrt(sigma)), 2 / 3
                ) * w;
                return be;
            }
        ],
        [ // Formula 34
            function tFromDWThetac(d, w, thetac) {
                var t = d + w * Math.sin(thetac / 360 * Math.TAU);
                return t;
            },
            function dFromTWThetac(t, w, thetac) {
                var d = t - w * Math.sin(thetac / 360 * Math.TAU);
                return d;
            },
            function wFromTDThetac(t, d, thetac) {
                var w = (t - d) / Math.sin(thetac / 360 * Math.TAU);
                return w;
            },
            function thetacFromTDW(t, d, w) {
                var thetac = 360 / Math.TAU * Math.asin((t - d) / w);
                return thetac;
            }
        ],
        [ // Formula 35
            function lFromWThetac(w, thetac) {
                var l = w * Math.cos(thetac / 360 * Math.TAU);
                return l;
            },
            function wFromLThetaC(l, thetac) {
                var w = l / Math.cos(thetac / 360 * Math.TAU);
                return w;
            },
            function thetacFromLW(l, w) {
                var thetac = 360 / Math.TAU * Math.acos(l / w);
                return thetac;
            }
        ],
        [ // Formula 36
            function tFromThetaCSigmaAdVWBe(thetac, sigma, ad, v, w, be) {
                var t = w * Math.sin(thetac / 360 * Math.TAU) +
                    sigma * ad * v * v * airDensity +
                    1 / airDensity * Math.pow(w / be, 2) / (sigma * v * v);
                return t;
            },
            function thetacFromTSigmaAdVWBe(t, sigma, ad, v, w, be) {
                var thetac = Math.asin((
                    t - sigma * ad * v * v * airDensity -
                    1 / airDensity * Math.pow(w / be, 2) / (sigma * v * v)
                ) / w) / Math.TAU * 360;
                return thetac;
            },
            function sigmaFromTThetacAdVWBeSigma(t, thetac, ad, v, w, be) {
                var coeffs = [
                    ad * v * v * airDensity,
                    w * Math.sin(thetac / 360 * Math.TAU) - t,
                    1 / airDensity * Math.pow(w / be, 2) / (v * v)
                ];
                var sigma = solvePoly(coeffs)[1];
                return sigma;
            },
            function adFromTThetacSigmaVWBe(t, thetac, sigma, v, w, be) {
                var ad = (
                    t - w * Math.sin(thetac / 360 * Math.TAU) -
                    1 / airDensity * Math.pow(w / be, 2) / (sigma * v * v)
                ) / (sigma * v * v * airDensity);
                return ad;
            },
            function vFromTThetacSigmaAdWBe(t, thetac, sigma, ad, w, be) {
                var coeffs = [
                    sigma * ad * airDensity,
                    0,
                    w * Math.sin(thetac / 360 * Math.TAU) - t,
                    0,
                    1 / airDensity * Math.pow(w / be, 2) / sigma
                ];
                var v = Math.abs(solvePoly(coeffs)[3]);
                return v;
            },
            function wFromTThetaCSigmaAdVBe(t, thetac, sigma, ad, v, be) {
                var coeffs = [
                    1 / airDensity * Math.pow(1 / be, 2) / (sigma * v * v),
                    Math.sin(thetac / 360 * Math.TAU),
                    sigma * ad * v * v * airDensity - t
                ];
                var w = solvePoly(coeffs)[0];
                return w;
            },
            function beFromTThetacSigmaAdVW(t, thetac, sigma, ad, v, w) {
                var be = w / Math.sqrt((
                    t - w * Math.sin(thetac / 360 * Math.TAU) -
                    airDensity * sigma * ad * v * v
                ) * airDensity * sigma * v * v);
                return be;
            }
        ],
        [], // Formula 37 - theoretical, allowing us to obtain rate of climb
        [ // Formula 38
            function rcFromBhpWEtaRsmin(bhp, w, eta, rsmin) {
                // eta is the efficiency: THPa / BHP
                var rc = (33000 * bhp / w) * eta - rsmin;
                return rc;
            },
            function bhpFromRcWEtaRsmin(rc, w, eta, rsmin) {
                var bhp = w / 33000 * (rc + rsmin) / eta;
                return bhp;
            },
            function wFromRcBhpEtaRsmin(rc, bhp, eta, rsmin) {
                var w = 33000 * eta * bhp / (rc + rsmin);
                return w;
            },
            function etaFromRcBhpWRsmin(rc, bhp, w, rsmin) {
                var eta = (rc + rsmin) / (33000 * bhp / w);
                return eta;
            },
            function rsminFromRcBhpWEta(rc, bhp, w, eta) {
                var rsmin = (33000 * bhp / w) * eta - rc;
                return rsmin;
            }
        ],
        [ // Formula 39
            function mdotFromRhoApVp(rho, ap, vp) {
                var mdot = rho * ap * vp;
                return mdot;
            },
            function rhoFromMdotApVp(mdot, ap, vp) {
                var rho = mdot / (ap * vp);
                return rho;
            },
            function apFromMdotRhoVp(mdot, rho, vp) {
                var ap = mdot / (rho * vp);
                return ap;
            },
            function vpFromMdotRhoAp(mdot, rho, ap) {
                var vp = mdot / (rho * ap);
                return vp;
            },
            function mdotFromRhoA3V3(rho, a3, v3) {
                var mdot = rho * a3 * v3;
                return mdot;
            },
            function rhosFromMdotA3V3(mdot, a3, v3) {
                var rhos = mdot / (a3 * v3);
                return rhos;
            },
            function a3FromMdotRhoV3(mdot, rho, v3) {
                var a3 = mdot / (rho * v3);
                return a3;
            },
            function v3FromMdotRhoA3(mdot, rho, a3) {
                var v3 = mdot / (rho * a3);
                return v3;
            }
        ],
        [ // Formula 40: change in momentum vs pressure jump
            function tFromMV3V(m, v3, v) {
                var t = m * (v3 - v);
                return t;
            },
            function mFromTV3V(t, v3, v) {
                var m = t / (v3 - v);
                return m;
            },
            function v3FromTMV(t, m, v) {
                var v3 = t / m + v;
                return v3;
            },
            function vFromTMV3(t, m, v3) {
                var v = v3 - t / m;
                return v;
            }
        ],
        [ // Formula 41: Upstream propeller pressure increase
            function pdiFromPdRhoV(pd, rho, v) {
                var pdi = pd + 0.5 * rho * v * v;
                return pdi;
            },
            function pdFromPdiRhoV(pdi, rho, v) {
                var pd = pdi - 0.5 * rho * v * v;
                return pd;
            },
            function rhoFromPdiPdV(pdi, pd, v) {
                var rho = (pdi - pd) / (0.5 * v * v);
                return rho;
            },
            function vFromPdiPdRho(pdi, pd, rho) {
                var v = Math.sqrt((pdi - pd) / (0.5 * rho));
                return v;
            },
            function p1iFromP1RhoVp(p1, rho, vp) {
                var p1i = p1 + 0.5 * rho * vp * vp;
                return p1i;
            },
            function p1iFromRhoVp(p1i, rho, vp) {
                var p1 = p1i - 0.5 * rho * vp * vp;
                return p1;
            },
            function rhoFromP1iP1Vp(p1i, p1, vp) {
                var rho = (p1i - p1) / (0.5 + vp * vp);
                return rho;
            },
            function vpFromP1iP1Rho(p1i, p1, rho) {
                var vp = Math.sqrt((p1i - p1) / (0.5 * rho));
                return vp;
            }
        ],
        [ // Formula 42: Downstream propeller pressure
            function p2FromPdRhoVpV3(pd, rho, vp, v3) {
                var p2 = pd + 0.5 * rho * v3 * v3 - 0.5 * rho * vp * vp;
                return p2;
            },
            function pdFromP2RhoVpV3(p2, rho, vp, v3) {
                var pd = p2 + 0.5 * rho * vp * vp - 0.5 * rho * v3 * v3;
                return pd;
            },
            function rhoFromP2PdVpV3(p2, pd, vp, v3) {
                var rho = (p2 - pd) / (0.5 * v3 * v3 - 0.5 * vp * vp);
                return rho;
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
                var p2 = p1 + 0.5 * rho * (Math.pow(v3, 2 / 3) - v * v);
                return p2;
            },
            function p1FromP2RhoV3V(p2, rho, v3, v) {
                var p1 = p2 - 0.5 * rho * (Math.pow(v3, 2 / 3) - v * v);
                return p1;
            },
            function rhoFromP1P2V3V(p1, p2, v3, v) {
                var rho = (p2 - p1) / (0.5 * (Math.pow(v3, 2 / 3) - v * v));
                return rho;
            },
            function v3FromP1P2RhoV(p1, p2, rho, v) {
                var v3 = Math.pow((p2 - p1) / (0.5 * rho) + v * v, 3 / 2);
                return v3;
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
                var t = 0.5 * rho * (v3 - v) * (v3 + v) * ap;
                return t;
            },
            function rhoFromTV3VAp(t, v3, v, ap) {
                var rho = t / (0.5 * (v3 - v) * (v3 + v) * ap);
                return rho;
            },
            function v3FromTRhoVAp(t, rho, v, ap) {
                var v3 = Math.sqrt(t / (0.5 * rho * ap) + v * v);
                return v3;
            },
            function vFromTRhoV3Ap(t, rho, v3, ap) {
                var v = Math.sqrt(v3 * v3 - t / (0.5 * rho * ap));
                return v;
            },
            function apFromTRhoV3V(t, rho, v3, v) {
                var ap = t / (0.5 * rho * (v3 - v) * (v3 + v));
                return ap;
            }
        ],
        [ // Formula 45: Prop velocity
            function vpFromV3V(v3, v) {
                var vp = 0.5 * (v3 + v);
                return vp;
            },
            function vFromVpV3(vp, v3) {
                var v = 2 * vp - v3;
                return v;
            }
        ],
        [ // Formula 46: Slipstream velocity
            function v3FromVpV(vp, v) {
                var v3 = 2 * vp - v;
                return v3;
            }
        ],
        [ // Formula 47: Available propeller thrust
            function tFromRhoApVpV(rho, ap, vp, v) {
                var t = 2 * rho * ap * vp * (vp - v);
                return t;
            },
            function rhoFromTApVpV(t, ap, vp, v) {
                var rho = t / (2 * ap * vp * (vp - v));
                return rho;
            },
            function apFromTRhoVpV(t, rho, vp, v) {
                var ap = t / (2 * rho * vp * (vp - v));
                return ap;
            },
            function vpFromTRhoApV(t, rho, ap, v) {
                var vp = solvePoly([2 * rho * ap, -2 * rho * ap * v, -t])[1];
                return vp;
            },
            function vFromTRhoApVp(t, rho, ap, vp) {
                var v = vp - t / (2 * rho * ap * vp);
                return v;
            }
        ],
        [ // Formula 48: Engine power at shaft
            function pthrustFromTV(t, v) {
                var pthrust = t * v;
                return pthrust;
            },
            function tFromPthrustFromV(pthrust, v) {
                var t = pthrust / v;
                return t;
            },
            function vFromPthrustT(pthrust, t) {
                var v = pthrust / t;
                return v;
            },
            function pshaftFromTVp(t, vp) {
                var pshaft = t * vp;
                return pshaft;
            },
            function tFromPshaftVp(pshaft, vp) {
                var t = pshaft / vp;
                return t;
            },
            function vpFromPshaftT(pshaft, t) {
                var vp = pshaft / t;
                return vp;
            },
            function etaFromPthrustPshaft(pthrust, pshaft) {
                var eta = pthrust / pshaft;
                return eta;
            },
            function pthrustFromEtaPshaft(eta, pshaft) {
                var pthrust = eta * pshaft;
                return pthrust;
            },
            function pshaftFromEtaPthrust(eta, pthrust) {
                var pshaft = pthrust / eta;
                return pshaft;
            }
        ],
        [ // Formula 49: Engine power
            function pshaftFromRhoApVpV(rho, ap, vp, v) {
                var pshaft = 2 * rho * ap * vp * vp * (vp - v);
                return pshaft;
            },
            function rhoFromPshaftApVpV(pshaft, ap, vp, v) {
                var rho = pshaft / (2 * ap * vp * vp * (vp - v));
                return rho;
            },
            function apFromPshaftRhoVpV(pshaft, rho, vp, v) {
                var ap = pshaft / (2 * rho * vp * vp * (vp - v));
                return ap;
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
                var v = vp - pshaft / (2 * rho * ap * vp * vp);
                return v;
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
            function SigmaFromBhpDpVEta(bhp, dp, v, eta) {
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
        [ // Formula 51: Dimensionless velocity
            function vpropFromBhpSigmaDp(bhp, sigma, dp) {
                var vprop = Math.pow(
                    33000 / sea_level_density *
                    Math.pow(60, 2) / Math.pow(5280 / 60, 3), 1 / 3
                ) * Math.pow(bhp / (sigma * dp * dp), 1 / 3);
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
            function vhatFromEta(eta) {
                var vhat = Math.pow(2 / Math.PI, 1 / 3) *
                    eta / Math.pow(1 - eta, 1 / 3);
                return vhat;
            },
            function etaFromVhat(vhat) {
                var eta = solvePoly([
                    1,
                    0,
                    Math.pow(vhat, 3) * Math.PI / 2,
                    -Math.pow(vhat, 3) * Math.PI / 2
                ])[0];
                return eta;
            }
        ],
        [ // Formula 53: Solution to cubic equation for dimensionless velocity
            function zeroFromEtaVhat(eta, vhat) {
                var zero = Math.pow(eta, 3) + Math.PI / 2 * Math.pow(vhat, 3) *
                    eta - Math.PI / 2 * Math.pow(vhat, 3);
                return zero;
            }
        ],
        [ // Formula 54: Solution to cubic equation for dimensionless velocity
            function etaFromVhat(vhat) {
                var eta = solvePoly([
                    1,
                    0,
                    Math.pow(vhat, 3) * Math.PI / 2,
                    -Math.pow(vhat, 3) * Math.PI / 2
                ])[0];
                return eta;
            }
        ],
        [ // Formula 55: Nondimensional advance ratio (per second)
            function jFromVNDp(v, n, dp) {
                var j = v / (n * dp);
                return j;
            },
            function vFromJNDp(j, n, dp) {
                var v = j * n * dp;
                return v;
            },
            function nFromJVDp(j, v, dp) {
                var n = v / (j * dp);
                return n;
            },
            function dpFromJVN(j, v, n) {
                var dp = v / (n * j);
                return dp;
            }
        ],
        [ // Formula 56: Nondimensional advance ratio (per hour)
            function jFromVRpmDp(v, rpm, dp) {
                var j = 5280 / 60 * v / (rpm * dp);
                return j;
            },
            function vFromJRpmDp(j, rpm, dp) {
                var v = 60 / 5280 * j * rpm * dp;
                return v;
            },
            function rpmFromJVDp(j, v, dp) {
                var rpm = 5280 / 60 * v / (j * dp);
                return rpm;
            },
            function dpFromJVRpm(j, v, rpm) {
                var dp = 5280 / 60 * v / (rpm * j);
                return dp;
            }
        ],
        [ // Formula 57: Dimensionless power coefficient as ft-lb/sec
            function cpFromPRhoNDp(p, rho, n, dp) {
                var cp = p / (rho * Math.pow(n, 3) * Math.pow(dp, 5));
                return cp;
            },
            function pFromCpRhoNDp(cp, rho, n, dp) {
                var p = cp * rho * Math.pow(n, 3) * Math.pow(dp, 5);
                return p;
            },
            function rhoFromCpPNDp(cp, p, n, dp) {
                var rho = p / (cp * Math.pow(n, 3) * Math.pow(dp, 5));
                return rho;
            },
            function nFromCpPRhoDp(cp, p, rho, dp) {
                var n = Math.pow(p / (rho * cp * Math.pow(dp, 5)), 1 / 3);
                return n;
            },
            function dpFromCpPRhoN(cp, p, rho, n) {
                var dp = Math.pow(p / (cp * rho * Math.pow(n, 3)), 1 / 5);
                return dp;
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
            function vhatFromJCp(j, cp) {
                var vhat = j / Math.pow(cp, 3);
                return vhat;
            },
            function jFromVhatCp(vhat, cp) {
                var j = vhat * Math.pow(cp, 3);
                return j;
            },
            function cpFromVhatJ(vhat, j) {
                var cp = Math.pow(j / vhat, 1 / 3);
                return cp;
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
                var ts = 10.41 * Math.pow(sigma, 1 / 3) *
                    Math.pow(dp * bhp, 2 / 3);
                return ts;
            },
            function sigmaFromTsDpBhp(ts, dp, bhp) {
                var sigma = Math.pow(
                    ts / (10.41 * Math.pow(dp * bhp, 2 / 3)), 3
                );
                return sigma;
            },
            function dpFromTsSigmaBhp(ts, sigma, bhp) {
                var dp = Math.pow(
                    ts / (10.41 * Math.pow(sigma, 1 / 3)), 3 / 2
                ) / bhp;
                return dp;
            },
            function bhpFromTsSigmaDp(ts, sigma, dp) {
                var bhp = Math.pow(
                    ts / (10.41 * Math.pow(sigma, 1 / 3)), 3 / 2
                ) / dp;
                return bhp;
            }
        ],
        [ // Formula 62: Ideal thrust from an engine-propeller combination
            function thatFromEtaVhat(eta, vhat) {
                var that = Math.pow(2 / Math.PI, 1 / 3) * eta / vhat;
                return that;
            },
            function etaFromThatVhat(that, vhat) {
                var eta = that * vhat / Math.pow(2 / Math.PI, 1 / 3);
                return eta;
            },
            function vhatFromThatEta(that, eta) {
                var vhat = Math.pow(2 / Math.PI, 1 / 3) * eta / that;
                return vhat;
            }
        ],
        [ // Formula 63: Idealised thrust ratio from dimensionless velocity
            function thatFromVhat(vhat) {
                var that = 1 / Math.pow(2, 1 / 3) *
                    (Math.pow(1 + Math.sqrt(
                        1 + 2 * Math.PI / 27 * Math.pow(vhat, 3)
                    ), 1  / 3) - Math.pow(-1 + Math.sqrt(
                        1 + 2 * Math.PI / 27 * Math.pow(vhat, 3)
                    ), 1  / 3));
                return that;
            }
        ],
        [ // Formula 64: Propeller tip mach number
            function mpFromRpmDp(rpm, dp) {
                var mp = Math.PI / (60 * 1100) * rpm * dp;
                return mp;
            },
            function rpmFromMpDp(mp, dp) {
                var rpm = 60 * 1100 / Math.PI * mp / dp;
                return rpm;
            },
            function dpFromMpRpm(mp, rpm) {
                var dp = 60 * 1100 / Math.PI * mp / rpm;
                return dp;
            }
        ]
    ];
    var appendicies = {
        d: [
            [
                function dummyFunc(dummy) {
                    return dummy;
                }
            ],
            [ // D.1: Differential of vertical momentum equation
                function dpFromRhoDh(rho, dh) {
                    var dp = -rho * constants.G * dh;
                    return dp;
                },
                function dhFromDpRho(dp, rho) {
                    var dh = dp / (-rho * constants.G);
                    return dh;
                },
                function rhoFromDpDh(dp, dh) {
                    var rho = -dp / (constants.G * dh);
                    return rho;
                }
            ],
            [ // D.2: Hydrostatic variation for water
                function pFromP0H(p0, h) {
                    var p = p0 - Math.pow(p0, constants.G * h);
                    console.log("d2 p");
                    return p;
                }
            ],
            [ // D.3: Equation of state
                function pFromRhoF(rho, f) {
                    var rankine = f + constants.FAHRENHEIT_TO_RANKINE;
                    var p = rho * constants.UNIVERSAL_GAS_CONSTANT * rankine;
                    return p;
                },
                function rFromF(f) {
                    var r = f + constants.FAHRENHEIT_TO_RANKINE;
                    return r;
                },
                function fFromR(r) {
                    var f = r - constants.FAHRENHEIT_TO_RANKINE;
                    return f;
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
                    var h = Math.log(p / p0) * constants.R * t0 / -constants.G;
                    return h;
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
                    var sigma = Math.exp(-constants.G * h / (constants.R * t0));
                    return sigma;
                },
                function hFromSigmaT0(sigma, t0) {
                    var h = Math.log(sigma) * (constants.R * t0) / -constants.G;
                    return h;
                },
                function t0FromSigmaH(sigma, h) {
                    var t0 = -constants.G * h / (Math.log(sigma) * constants.R);
                    return t0;
                }
            ],
            [   // D.8: Defined with characteristic altitude
                function sigmaFromHH0(h, h0) {
                    var sigma = Math.exp(-h / h0);
                    return sigma;
                },
                function hFromSigmaH0(sigma, h0) {
                    var h = Math.log(sigma) * -h0;
                    return h;
                },
                function h0FromSigmaH(sigma, h) {
                    var h0 = -h / Math.log(sigma);
                    return h0;
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
                    var f = tsl - constants.FAHRENHEIT_TO_RANKINE;
                    return f;
                }
            ],
            [], // D.13: estimated values for variation of density
            [] // D.14: estimated values for variation of density
               //       from 36240 ft to 82000 ft
        ],
        f: [ // Airplane efficiency factor e, and ground effect
            [
                function dummyFunc(dummy) {
                    return dummy;
                }
            ],
            [
                function cdsFromCd0ClEarS(cd0, cl, ear, s) {
                    var cds = (cd0 + cl * cl / (Math.PI * ear)) * s;
                    return cds;
                },
                function cd0FromCdsClEarS(cds, cl, ear, s) {
                    var cd0 = cds / s - cl * cl / (Math.PI * ear);
                    return cd0;
                },
                function clFromCdsCd0EarS(cds, cd0, ear, s) {
                    var cl = Math.sqrt((cds / s - cd0) * (Math.PI * ear));
                    return cl;
                },
                function earFromCdsCd0ClS(cds, cd0, cl, s) {
                    var ear = (cl * cl) / (cds / s - cd0) / Math.PI;
                    return ear;
                },
                function sFromCdsCd0ClEar(cds, cd0, cl, ear) {
                    var s = cds / (cd0 + cl * cl / (Math.PI * ear));
                    return s;
                }
            ],
            [
                function cdsFromWingFuseCompCdi(cdwing, s, kwing, cl,
                    cdfuse, sfuse, kfuse, angleOfAttack,
                    cdcomp, scomp, ar, planformCorrection) {
                    var cd0 = {
                            wing: cdwing * s * (1 + kwing * cl * cl),
                            fuse: cdfuse * sfuse *
                                (1 + kfuse * angleOfAttack * angleOfAttack),
                            comp: cdcomp * scomp
                        };
                    var cdi = cl * cl / (Math.PI * ar) *
                        (1 + planformCorrection) * s;
                    var cds = cd0.wing + cd0.fuse + cd0.comp + cdi;
                    return cds;
                }
            ],
            [ // no F.3 in appendix
            ],
            [ // no F.4 in appendix
            ],
            [ // Appendix F.5
                function adFromCdwindSCdfuseSfuseCdcompScomp(cdwing, s,
                    cdfuse, sfuse, cdcomp, scomp) {
                    var ad = cdwing * s + cdfuse * sfuse + cdcomp * scomp;
                    return ad;
                }
            ],
            [ // Appendix F.6
                function liftSlopeFromAr(ar) {
                    var radiansToDegrees = constants.RADIANS_TO_DEGREES;
                    // from lift equation at http://aancl.snu.ac.kr/aancl/lecture/up_file/_1305606276_11th%20week.pdf
                    var liftSlopePerDegree = Math.PI  / 0.5 * radiansToDegrees;
                    var liftSlope = liftSlopePerDegree * ar / (ar + 3);
                    return liftSlope;
                },
                function arFromLiftslope(liftSlope) {
                    var radiansToDegrees = constants.RADIANS_TO_DEGREES;
                    var liftSlopePerDegree = Math.PI / 0.5 * radiansToDegrees;
                    var ar = 3 * liftSlope / (liftSlopePerDegree - liftSlope);
                    return ar;
                }
            ],
            [ // Appendix F.7
                function clFromLiftslopeAoa(liftSlope, angleOfAttack) {
                    var cl = liftSlope * angleOfAttack;
                    return cl;
                },
                function liftslopeFromClAoa(cl, angleOfAttack) {
                    var liftSlope = cl / angleOfAttack;
                    return liftSlope;
                },
                function aoaFromClLiftslope(cl, liftSlope) {
                    var angleOfAttack = cl / liftSlope;
                    return angleOfAttack;
                }
            ],
            [ // Appendix F.8
                // wing efficiency factor
                function inviewFromPcArCdwingKwing(planformCorrection, ar, cdwing, kwing) {
                    var invew = (1 + planformCorrection) +
                        Math.PI * ar * cdwing * kwing;
                    return invew;
                },
                function pcFromInviewArCdwingKwing(invew, ar, cdwing, kwing) {
                    var planformCorrection = invew -
                        Math.PI * ar * cdwing * kwing - 1;
                    return planformCorrection;
                },
                function arFromInviewPcCdwingKwing(invew, planformCorrection, cdwing, kwing) {
                    var ar = (invew - (1 + planformCorrection)) /
                        (Math.PI * cdwing * kwing);
                    return ar;
                },
                function cdwingFromInviewPcArKwing(invew, planformCorrection, ar, kwing) {
                    var cdwing = (invew - (1 + planformCorrection)) /
                        (Math.PI * ar * kwing);
                    return cdwing;
                },
                function kwingFromInviewPcACdwing(invew, planformCorrection, ar, cdwing) {
                    var kwing = (invew - (1 + planformCorrection)) /
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
                function deltafuseFromArCdfuseKfuseSfuseS(ar, cdfusekfuse, sfuse, s) {
                    var deltafuse = Math.PI * cdfusekfuse * (
                            Math.pow(ar + 3, 2) / 0.12 * sfuse / s
                        );
                    return deltafuse;
                },
                function cdfuseFromDeltafuseArJfuseSfuseS(deltafuse, ar, kfuse, sfuse, s) {
                    var liftSlopePerDegree = Math.PI  / 0.5 *
                        constants.RADIANS_TO_DEGREES;
                    var cdfuse = deltafuse * ar / (Math.PI * kfuse * Math.pow(
                        (ar + 3) / liftSlopePerDegree, 2)
                    ) / (sfuse / s);
                    return cdfuse;
                },
                function kfuseFromDeltafuseArCdfuseSfuseS(deltafuse, ar, cdfuse, sfuse, s) {
                    var liftSlopePerDegree = Math.PI  / 0.5 *
                        constants.RADIANS_TO_DEGREES;
                    var kfuse = deltafuse * ar / (Math.PI * cdfuse * Math.pow(
                        (ar + 3) / liftSlopePerDegree, 2
                    ) * sfuse / s);
                    return kfuse;
                },
                function sfuseFromDeltafuseArCdfuseKfuseS(deltafuse, ar, cdfuse, kfuse, s) {
                    var liftSlopePerDegree = Math.PI  / 0.5 *
                        constants.RADIANS_TO_DEGREES;
                    var sfuse = deltafuse / (Math.PI * cdfuse * kfuse * Math.pow(
                        (ar + 3) / liftSlopePerDegree, 2) / ar
                    ) * s;
                    return sfuse;
                },
                function sFromDeltafuseArCdfuseKfuseSfuse(deltafuse, ar, cdfuse, kfuse, sfuse) {
                    var liftSlopePerDegree = Math.PI  / 0.5 *
                        constants.RADIANS_TO_DEGREES;
                    var s = Math.PI * cdfuse * kfuse * Math.pow(
                        (ar + 3) / liftSlopePerDegree, 2
                    ) / (deltafuse * ar) * sfuse;
                    return s;
                },
                function inveFromInvewDeltafuse(invew, deltafuse) {
                    var inve = invew + deltafuse;
                    return inve;
                },
                function invewFromInveDeltafuse(inve, deltafuse) {
                    var invew = inve - deltafuse;
                    return invew;
                },
                function deltafuseFromInveInvew(inve, invew) {
                    var deltafuse = inve - invew;
                    return deltafuse;
                },
                function eFromArSfuseS(ar, sfuse, s) {
                    var invew = 1 / chart.ew.rectangle(ar);
                    var fuselageEffect = chart.efuse.rectangle(ar);
                    var inve = invew + fuselageEffect * (sfuse / s);
                    var e = 1 / (invew + fuselageEffect * (sfuse / s));
                    return e;
                },
                function sfuseFromEArS(e, ar, s) {
                    var invew = 1 / chart.ew.rectangle(ar);
                    var fuselageEffect = chart.efuse.rectangle(ar);
                    var inve = invew + fuselageEffect * (sfuse / s);
                    var sfuse = (1 / e - invew) * s / fuselageEffect;
                    return sfuse;
                },
                function sFromEArSfuse(e, ar, sfuse) {
                    var invew = 1 / chart.ew.rectangle(ar);
                    var fuselageEffect = chart.efuse.rectangle(ar);
                    var inve = invew + fuselageEffect * (sfuse / s);
                    var s = fuselageEffect * sfuse / (1 / e - invew);
                    return s;
                }
            ],
            [ // Appendix F charts
                function ewingFromArWingshape(ar, wing_shape) {
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
                    if (wing_shape) {
                        ewing = ewing[wing_shape];
                    }
                    return ewing;
                },
                function fcFromArFuselageSlope(ar, fuselage_shape) {
                    // values from http://www.xuru.org/rt/PR.asp
                    var fuselageCorrection = {
                        rectangular: 0.0009810583609 * Math.pow(ar, 3) -
                            0.0152240777 * Math.pow(ar, 2) +
                            0.1597429943 * ar + 1.047025734,
                        round: 0.001669860442 * Math.pow(ar, 2) +
                            0.01325063838 * ar + 0.5558606027
                    };
                    if (fuselage_shape) {
                        fuselageCorrection = fuselageCorrection[fuselage_shape];
                    }
                    return fuselageCorrection;
                },
                function deltafuseFromFcSfuseS(fuselageCorrection, sfuse, s) {
                    var deltafuse = fuselageCorrection * (sfuse / s);
                    return deltafuse;
                },
                function fcFromDeltafuseSfuseS(deltafuse, sfuse, s) {
                    var fuselageCorrection = deltafuse / (sfuse / s);
                    return fuselageCorrection;
                },
                function sfuseFromDeltafuseFcS(deltafuse, fuselageCorrection, s) {
                    var sfuse = deltafuse / fuselageCorrection * s;
                    return sfuse;
                },
                function sFromDeltafuseFcSfuse(
                    deltafuse, fuselageCorrection, sfuse) {
                    var s = fuselageCorrection / deltafuse * sfuse;
                    return s;
                },
                function inveFromInvewDeltafuse(invew, deltafuse) {
                    var inve = invew + deltafuse;
                    return inve;
                },
                function invewFromInveDeltafuse(inve, deltafuse) {
                    var invew = inve - deltafuse;
                    return invew;
                },
                function deltafuseFromInveInvew(inve, invew) {
                    var deltafuse = inve - invew;
                    return deltafuse;
                },
                function eFromInve(inve) {
                    var e = 1 / inve;
                    return e;
                },
                function eFromInve(e) {
                    var inve = 1 / e;
                    return inve;
                },
                function ewingFromInvew(invew) {
                    var ewing = 1 / invew;
                    return ewing;
                },
                function invewFromEwing(ewing) {
                    var invew = 1 / ewing;
                    return invew;
                },
                function ewgdFromEwHB(ew, h, b) {
                    // from a DataAnalysis app that
                    // results in the following Logistics formula
                    function logistics(a, b, k, x) {
                        return a / (1 + b * Math.pow(Math.E, -k * x));
                    }
                    var a = 1.0869;
                    // var b = -0.9337;
                    var k = 7.6391;
                    var kgd = logistics(a, b, k, h / b);
                    var ewgd = ew * kgd;
                    return ewgd;
                }
            ]
        ],
        g: [ // Drag analysis
            [
                function dummyFunc(dummy) {
                    return dummy;
                }
            ],
            [ // Appendix G.1
                function adFromCdfAfCdwSw(cdf, af, cdw, sw) {
                    var ad = cdf * af + cdw * sw;
                    return ad;
                },
                function cdfFromAdAfCdwSw(ad, af, cdw, sw) {
                    var cdf = (ad - cdw * sw) / af;
                    return cdf;
                },
                function afFromAdCdfCdwSw(ad, cdf, cdw, sw) {
                    var af = (ad - cdw * sw) / cdf;
                    return af;
                },
                function CdwFromAdCdfAfSw(ad, cdf, af, sw) {
                    var cdw = (ad - cdf * af) / sw;
                    return cdw;
                },
                function swFromAdCdfAfCdw(ad, cdf, af, cdw) {
                    var sw = (ad - cdf * af) / cdw;
                    return sw;
                }
            ],
            [ // Appendix G.2
                function cdwFromRel(rel) {
                    // default behaviour is for laminar airflow
                    // alpha source: J.P.Boyd from http://hal.archives-ouvertes.fr/docs/00/26/92/82/PDF/BrighiFruchardSariHAL.pdf
                    var alpha = 1.32822934486;
                    var cdw = alpha / Math.sqrt(rel);
                    return cdw;
                }
            ]
        ],
        h: [
            [
                function dummyFunc(dummy) {
                    return dummy;
                }
            ],
        ], // Appendix H
        i: [ // Appendix I
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
                    var rel = inertia / viscous;
                    return rel;
                }
            ]
        ],
        j: [ // Appendix J
            [
                function dummyFunc(dummy) {
                    return dummy;
                }
            ],
            [
                function pFromRhoR(rho, r) {
                    var p = rho * constants.UNIVERSAL_GAS_CONSTANT * r;
                    return p;
                },
                function rhoFromPR(p, r) {
                    var rho = p / (constants.UNIVERSAL_GAS_CONSTANT * r);
                    return rho;
                },
                function rFromPRho(p, rho) {
                    var r = p / (rho * constants.UNIVERSAL_GAS_CONSTANT);
                    return r;
                },
                function sigmaFromRho(rho) {
                    var sigma = rho / constants.SEALEVEL_DENSITY;
                    return sigma;
                },
                function rhoFromSigma(sigma) {
                    var rho = sigma * constants.SEALEVEL_DENSITY;
                    return rho;
                }

            ]
        ]
    };
    return {
        formulas: formulas,
        appendicies: appendicies
    };
}
