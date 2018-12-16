/*jslint browser:true */
/*globals */

function aircraftFormulas(constants, solvePoly) {
    'use strict';

    var dynamic_mph_pressure = 0.5 * 0.002377 * Math.pow(5280 / 3600, 2),
        sea_level_density = 0.002377,
        formulas = [
            [ // formula 1
                function (w, thetag) {
                    var d = w * Math.sin(thetag * Math.TAU / 360);
                    return d;
                },
                function (d, thetag) {
                    var w = d / Math.sin(thetag * Math.TAU / 360);
                    return w;
                },
                function (d, w) {
                    var thetag = Math.asin(d / w) * 360 / Math.TAU;
                    return thetag;
                }
            ],
            [ // Formula 2
                function (w, thetag) {
                    var l = w * Math.cos(thetag * Math.TAU / 360);
                    return l;
                },
                function (l, thetag) {
                    var w = l / Math.cos(thetag * Math.TAU / 360);
                    return w;
                },
                function (l, w) {
                    var thetag = Math.acos(l / w) / Math.TAU * 360;
                    return thetag;
                }
            ],
            [ // Formula 3
                function (l, rho, vfs, s) {
                    var cl = l / (0.5 * rho * vfs * vfs * s);
                    return cl;
                },
                function (cl, rho, vfs, s) {
                    var l = 0.5 * cl * rho * vfs * vfs * s;
                    return l;
                },
                function (cl, l, vfs, s) {
                    var rho = 2 * l / (cl * vfs * vfs * s);
                    return rho;
                },
                function (cl, l, rho, s) {
                    var vfs = Math.sqrt(2 * l / (cl * rho * s));
                    return vfs;
                },
                function (cl, l, rho, vfs) {
                    var s = 2 * l / (cl * rho * vfs * vfs);
                    return s;
                },
                function (vfs) {
                    var v = vfs * window.CONSTANTS.MPH_TO_FPS;
                    return v;
                },
                function (v) {
                    var vfs = v * window.CONSTANTS.FPS_TO_MPH;
                    return vfs;
                }
            ],
            [ // Formula 4
                function (d, rho, vfs, s) {
                    var cd = d / (0.5 * rho * vfs * vfs * s);
                    return cd;
                },
                function (cd, rho, vfs, s) {
                    var d = 0.5 * rho * cd * vfs * vfs * s;
                    return d;
                },
                function (cd, d, vfs, s) {
                    var rho = d / (0.5 * cd * vfs * vfs * s);
                    return rho;
                },
                function (cd, d, rho, s) {
                    var vfs = Math.sqrt(d / (0.5 * rho * cd * s));
                    return vfs;
                },
                function (cd, d, rho, vfs) {
                    var s = d / (0.5 * rho * cd * vfs * vfs);
                    return s;
                }
            ],
            [ // Formula 5
                function (sigma, cd, s, v) {
                    var d = sigma * cd * s * v * v * dynamic_mph_pressure;
                    return d;
                },
                function (d, cd, s, v) {
                    var sigma = d / (cd * s * v * v * dynamic_mph_pressure);
                    return sigma;
                },
                function (d, sigma, s, v) {
                    var cd = d / (sigma * s * v * v * dynamic_mph_pressure);
                    return cd;
                },
                function (d, sigma, cd, v) {
                    var s = d / (sigma * cd * v * v * dynamic_mph_pressure);
                    return s;
                },
                function (d, sigma, cd, s) {
                    var v = Math.sqrt(d / (sigma * cd * s * dynamic_mph_pressure));
                    return v;
                }
            ],
            [ // Formula 6
                function (sigma, cl, s, v) {
                    var l = sigma * cl * s * v * v * dynamic_mph_pressure;
                    return l;
                },
                function (l, cl, s, v) {
                    var sigma = l / (cl * s * v * v * dynamic_mph_pressure);
                    return sigma;
                },
                function (l, sigma, s, v) {
                    var cl = l / (sigma * s * v * v * dynamic_mph_pressure);
                    return cl;
                },
                function (l, sigma, cl, v) {
                    var s = l / (sigma * cl * v * v * dynamic_mph_pressure);
                    return s;
                },
                function (l, sigma, cl, s) {
                    var v = Math.sqrt(l / (sigma * cl * s * dynamic_mph_pressure));
                    return v;
                }
            ],
            [ // Formula 7
                function (w, s) {
                    var ws = w / s;
                    return ws;
                },
                function (ws, s) {
                    var w = ws * s;
                    return w;
                },
                function (ws, w) {
                    var s = w / ws;
                    return s;
                },
                function (sigma, cl, v) {
                    var ws = sigma * cl * v * v * dynamic_mph_pressure;
                    return ws;
                },
                function (ws, cl, v) {
                    var sigma = ws / (cl * v * v * dynamic_mph_pressure);
                    return sigma;
                },
                function (ws, sigma, v) {
                    var cl = ws / (sigma * v * v * dynamic_mph_pressure);
                    return cl;
                },
                function (ws, sigma, cl) {
                    var v = Math.sqrt(ws / (sigma * cl * dynamic_mph_pressure));
                    return v;
                },
                function (sigma, clmax, vs1) {
                    var ws = sigma * clmax * vs1 * vs1 * dynamic_mph_pressure;
                    return ws;
                },
                function (ws, clmax, vs1) {
                    var sigma = ws / (clmax * vs1 * vs1 * dynamic_mph_pressure);
                    return sigma;
                },
                function (ws, sigma, vs1) {
                    var clmax = ws / (sigma * vs1 * vs1 * dynamic_mph_pressure);
                    return clmax;
                },
                function (ws, sigma, cl) {
                    var vs1 = Math.sqrt(ws / (sigma * cl * dynamic_mph_pressure));
                    return vs1;
                },
                function (sigma, clmaxf, vs0) {
                    var ws = sigma * clmaxf * vs0 * vs0 * dynamic_mph_pressure;
                    return ws;
                },
                function (ws, clmaxf, vs0) {
                    var sigma = ws / (clmaxf * vs0 * vs0 * dynamic_mph_pressure);
                    return sigma;
                },
                function (ws, sigma, vs0) {
                    var clmaxf = ws / (sigma * vs0 * vs0 * dynamic_mph_pressure);
                    return clmaxf;
                },
                function (ws, sigma, clmaxf) {
                    var vs0 = Math.sqrt(ws / (sigma * clmaxf * dynamic_mph_pressure));
                    return vs0;
                },
                function (sigma, cl, vmax) {
                    var ws = sigma * cl * vmax * vmax * dynamic_mph_pressure;
                    return ws;
                },
                function (ws, cl, vmax) {
                    var sigma = ws / (cl * vmax * vmax * dynamic_mph_pressure);
                    return sigma;
                },
                function (ws, sigma, vmax) {
                    var cl = ws / (sigma * vmax * vmax * dynamic_mph_pressure);
                    return cl;
                },
                function (ws, sigma, cl) {
                    var vmax = Math.sqrt(ws / (sigma * cl * dynamic_mph_pressure));
                    return vmax;
                },
                function (w, wu) {
                    var we = w - wu;
                    return we;
                },
                function (we, wu) {
                    var w = we + wu;
                    return w;
                },
                function (we, w) {
                    var wu = w - we;
                    return wu;
                }
            ],
            [ // Formula 8
                function (sigma, cd, s, v) {
                    var thetag = 360 / Math.TAU * sigma * cd * s * v * v * dynamic_mph_pressure;
                    return thetag;
                },
                function (thetag, cd, s, v) {
                    var sigma = Math.TAU / 360 * thetag / (cd * s * v * v * dynamic_mph_pressure);
                    return sigma;
                },
                function (thetag, sigma, s, v) {
                    var cd = Math.TAU / 360 * thetag / (sigma * s * v * v * dynamic_mph_pressure);
                    return cd;
                },
                function (thetag, sigma, cd, v) {
                    var s = Math.TAU / 360 * thetag / (sigma * cd * v * v * dynamic_mph_pressure);
                    return s;
                },
                function (thetag, sigma, cd, s) {
                    var v = Math.sqrt(Math.TAU / 360 * thetag / (sigma * cd * s * dynamic_mph_pressure));
                    return v;
                }
            ],
            [ // Formula 9
                function (cd, cl) {
                    var thetag = 360 / Math.TAU * cd / cl;
                    return thetag;
                },
                function (thetag, cl) {
                    var cd = Math.TAU / 360 * thetag * cl;
                    return cd;
                },
                function (thetag, cd) {
                    var cl = 360 / Math.TAU * cd / thetag;
                    return cl;
                }
            ],
            [ // Formula 10
                function (sigma, cd, s, v, w) {
                    var rs = 5280 / 60 * v * sigma * cd * s * v * v / w * dynamic_mph_pressure;
                    return rs;
                },
                function (rs, cd, s, v, w) {
                    var sigma = 60 / 5280 * rs * w / (v * cd * s * v * v * dynamic_mph_pressure);
                    return sigma;
                },
                function (rs, sigma, s, v, w) {
                    var cd = 60 / 5280 * rs * w / (v * sigma * s * v * v * dynamic_mph_pressure);
                    return cd;
                },
                function (rs, sigma, cd, v, w) {
                    var s = 60 / 5280 * rs * w / (v * sigma * cd * v * v * dynamic_mph_pressure);
                    return s;
                },
                function (rs, sigma, cd, s, w) {
                    var v = Math.pow(60 / 5280 * rs * w / (sigma * cd * s * dynamic_mph_pressure), 1 / 3);
                    return v;
                },
                function (rs, sigma, cd, s, v) {
                    var w = 5280 / 60 * v * sigma * cd * s * v * v * dynamic_mph_pressure / rs;
                    return w;
                }
            ],
            [ // Formula 11
                function (sigma, w, s, cd, cl) {
                    var rs = 5280 / 60 * Math.sqrt(1 / (sigma * dynamic_mph_pressure) * w / s) * cd / Math.pow(cl, 3 / 2);
                    return rs;
                },
                function (rs, w, s, cd, cl) {
                    var sigma = Math.pow(5280 / 60 * Math.sqrt(1 / dynamic_mph_pressure * w / s) / rs * cd / Math.pow(cl, 3 / 2), 2);
                    return sigma;
                },
                function (rs, sigma, s, cd, cl) {
                    var w = Math.pow(60 / 5280 * rs * Math.sqrt(sigma * dynamic_mph_pressure), 2) * s * Math.pow(Math.pow(cl, 3 / 2) / cd, 2);
                    return w;
                },
                function (rs, sigma, w, cd, cl) {
                    var s = Math.pow(5280 / 60, 2) / (dynamic_mph_pressure * sigma) * w / Math.pow(rs, 2) * Math.pow(cd / Math.pow(cl, 3 / 2), 2);
                    return s;
                },
                function (rs, sigma, w, s, cl) {
                    var cd = 60 / 5280 * Math.sqrt(sigma * dynamic_mph_pressure) * Math.sqrt(s / w) * rs * Math.pow(cl, 3 / 2);
                    return cd;
                },
                function (rs, sigma, w, s, cd) {
                    var cl = Math.pow(5280 / 60 / Math.sqrt(sigma * dynamic_mph_pressure) * Math.sqrt(w / s) / rs * cd, 2 / 3);
                    return cl;
                }
            ],
            [ // Formula 12
                function (cd0, cdi) {
                    var cd = cd0 + cdi;
                    return cd;
                },
                function (cd, cdi) {
                    var cd0 = cd - cdi;
                    return cd0;
                },
                function (cd, cd0) {
                    var cdi = cd - cd0;
                    return cdi;
                }
            ],
            [ // Formula 13
                function (cl, e, ar) {
                    var cdi = cl * cl / (Math.PI * e * ar);
                    return cdi;
                },
                function (cdi, e, ar) {
                    var cl = Math.sqrt(cdi * (Math.PI * e * ar));
                    return cl;
                },
                function (cdi, cl, ar) {
                    var e = cl * cl / (Math.PI * cdi * ar);
                    return e;
                },
                function (cdi, cl, e) {
                    var ar = cl * cl / (cdi * Math.PI * e);
                    return ar;
                },
                function (cl, ear) {
                    var cdi = cl * cl / (Math.PI * ear);
                    return cdi;
                },
                function (cdi, ear) {
                    var cl = Math.sqrt(cdi * (Math.PI * ear));
                    return cl;
                },
                function (cdi, cl) {
                    var ear = cl * cl / (cdi * Math.PI);
                    return ear;
                }
            ],
            [ // Formula 14
                function (b, c) {
                    var ar = b / c;
                    return ar;
                },
                function (ar, c) {
                    var b = ar * c;
                    return b;
                },
                function (ar, b) {
                    var c = b / ar;
                    return c;
                },
                function (b, s) {
                    var ar = b * b / s;
                    return ar;
                },
                function (ar, s) {
                    var b = Math.sqrt(ar * s);
                    return b;
                },
                function (ar, b) {
                    var s = b * b / ar;
                    return s;
                }
            ],
            [ // Formula 15
                function (cd0, cl, ear) {
                    var cd = cd0 + cl * cl / (Math.PI * ear);
                    return cd;
                },
                function (cd, cl, ear) {
                    var cd0 = cd - cl * cl / (Math.PI * ear);
                    return cd0;
                },
                function (cd, cd0, ear) {
                    var cl = Math.sqrt((cd - cd0) * Math.PI * ear);
                    return cl;
                },
                function (cd, cd0, cl) {
                    var ear = cl * cl / (Math.PI * (cd - cd0));
                    return ear;
                },
                function (e, ar) {
                    var ear = e * ar;
                    return ear;
                },
                function (ear, ar) {
                    var e = ear / ar;
                    return e;
                },
                function (ear, e) {
                    var ar = ear / e;
                    return ar;
                }
            ],
            [], // Formula 16 - working towards Formula 18
            [], // Formula 17 - working towards Formula 18
            [ // Formula 18
                function (ear, cd0) {
                    var clmins = Math.sqrt(3 * Math.PI * ear * cd0);
                    return clmins;
                },
                function (clmins, cd0) {
                    var ear = 1 / (3 * Math.PI) * Math.pow(clmins, 2) / cd0;
                    return ear;
                },
                function (clmins, ear) {
                    var cd0 = Math.pow(clmins, 2) / (3 * Math.PI * ear);
                    return cd0;
                }
            ],
            [ // Formula 19
                function (ad, ce) {
                    var clmins = Math.sqrt(3 * Math.PI) * Math.sqrt(ad) / ce;
                    return clmins;
                },
                function (clmins, ce) {
                    var ad = Math.pow(clmins * ce / Math.sqrt(3 * Math.PI), 2);
                    return ad;
                },
                function (clmins, ad) {
                    var ce = Math.sqrt(3 * Math.PI) / clmins * Math.sqrt(ad);
                    return ce;
                },
                function (c, e) {
                    var ce = c / Math.sqrt(e);
                    return ce;
                },
                function (ce, e) {
                    var c = ce * Math.sqrt(e);
                    return c;
                },
                function (ce, c) {
                    var e = Math.pow(c / ce, 2);
                    return e;
                },
                function (cd0, s) {
                    var ad = cd0 * s;
                    return ad;
                },
                function (ad, s) {
                    var cd0 = ad / s;
                    return cd0;
                },
                function (ad, cd0) {
                    var s = ad / cd0;
                    return s;
                }
            ],
            [ // Formula 20
                function (w, sigma, ad, be) {
                    var rsmin = 5280 / 60 * Math.sqrt(1 / dynamic_mph_pressure) * 4 / Math.pow(3 * Math.PI, 3 / 4) * Math.sqrt(w / sigma) * Math.pow(ad, 1 / 4) / Math.pow(be, 3 / 2);
                    return rsmin;
                },
                function (rsmin, sigma, ad, be) {
                    var w = Math.pow(rsmin * 60 / 5280 * Math.sqrt(dynamic_mph_pressure) * Math.pow(3 * Math.PI, 3 / 4) / (4 * Math.pow(ad, 1 / 4)) * Math.pow(be, 3 / 2), 2) * sigma;
                    return w;
                },
                function (rsmin, w, ad, be) {
                    var sigma = Math.pow(5280 / 60 * 4 / Math.pow(3 * Math.PI, 3 / 4) / Math.sqrt(dynamic_mph_pressure) / rsmin * Math.pow(ad, 1 / 4) / Math.pow(be, 3 / 2), 2) * w;
                    return sigma;
                },
                function (rsmin, w, sigma, be) {
                    var ad = Math.pow(60 / 5280 * Math.pow(3 * Math.PI, 3 / 4) / 4 * Math.sqrt(dynamic_mph_pressure) * rsmin * Math.sqrt(sigma / w) * Math.pow(be, 3 / 2), 4);
                    return ad;
                },
                function (rsmin, w, sigma, ad) {
                    var be = Math.pow(5280 / 60 * 4 / Math.pow(3 * Math.PI, 3 / 4) / (Math.sqrt(dynamic_mph_pressure) * rsmin) * Math.sqrt(w / sigma) * Math.pow(ad, 1 / 4), 2 / 3);
                    return be;
                },
                function (b, e) {
                    var be = b * Math.sqrt(e);
                    return be;
                },
                function (be, e) {
                    var b = be / Math.sqrt(e);
                    return b;
                },
                function (be, b) {
                    var e = Math.pow(be / b, 2);
                    return e;
                }
            ],
            [ // Formula 21
                function (w, be, sigma, ad) {
                    var vmins = Math.sqrt(1 / dynamic_mph_pressure) / Math.pow(3 * Math.PI, 1 / 4) * Math.sqrt(w / be) / (Math.sqrt(sigma) * Math.pow(ad, 1 / 4));
                    return vmins;
                },
                function (vmins, be, sigma, ad) {
                    var w = Math.pow(Math.pow(3 * Math.PI, 1 / 4) * Math.sqrt(dynamic_mph_pressure) * vmins * Math.sqrt(be) * Math.sqrt(sigma) * Math.pow(ad, 1 / 4), 2);
                    return w;
                },
                function (vmins, w, sigma, ad) {
                    var be = w / (dynamic_mph_pressure * Math.sqrt(3 * Math.PI) * Math.pow(vmins, 2) * sigma * Math.sqrt(ad));
                    return be;
                },
                function (vmins, w, be, ad) {
                    var sigma = w / (dynamic_mph_pressure * Math.sqrt(3 * Math.PI) * Math.pow(vmins, 2) * be * Math.sqrt(ad));
                    return sigma;
                },
                function (vmins, w, be, sigma) {
                    var ad = Math.pow(1 / (dynamic_mph_pressure * sigma * Math.sqrt(3 * Math.PI) * Math.pow(vmins, 2)) * w / be, 2);
                    return ad;
                },
                function (w, be) {
                    var wbe = w / be;
                    return wbe;
                },
                function (wbe, be) {
                    var w = wbe * be;
                    return w;
                },
                function (wbe, w) {
                    var be = w / wbe;
                    return be;
                }
            ],
            [ // Formula 22
                function (sigma, ad, v, w, be) {
                    var rs = 5280 / 60 * (sigma * ad * Math.pow(v, 3) * dynamic_mph_pressure / w + w / (dynamic_mph_pressure * Math.PI * sigma * v * be * be));
                    return rs;
                },
                function (rs, ad, v, w, be) {
                    var a = 5280 / 60 * ad * Math.pow(v, 3) * dynamic_mph_pressure / w,
                        b = -rs,
                        c = 5280 / 60 * w / (dynamic_mph_pressure * Math.PI * v * be * be),
                        sigma = solvePoly([a, b, c])[1];
                    return sigma;
                },
                function (rs, sigma, v, w, be) {
                    var ad = (rs / 5280 * 60 - w / dynamic_mph_pressure / Math.PI / sigma / v / be / be) / sigma / Math.pow(v, 3) / dynamic_mph_pressure * w;
                    return ad;
                },
                function (rs, sigma, ad, w, be) {
                    var coeffs = [
                        sigma * ad * dynamic_mph_pressure / w,
                        0,
                        0,
                        -60 / 5280 * rs,
                        w / (dynamic_mph_pressure * Math.PI * sigma * be * be)
                    ],
                        v = solvePoly(coeffs)[1];
                    return v;
                },
                function (rs, sigma, ad, v, be) {
                    var coeffs = [
                        1 / (dynamic_mph_pressure * Math.PI * sigma * v * be * be),
                        -60 / 5280 * rs,
                        sigma * ad * Math.pow(v, 3) * dynamic_mph_pressure
                    ],
                        w = solvePoly(coeffs)[0];
                    return w;
                },
                function (rs, sigma, ad, v, w) {
                    var be = Math.sqrt(1 / (Math.PI * dynamic_mph_pressure * v * sigma / w * (60 / 5280 * rs - dynamic_mph_pressure * sigma * ad * Math.pow(v, 3) / w)));
                    return be;
                }
            ],
            [ // Formula 23
                function (sigma, ad, v, w, be) {
                    var sigmas_dv = 5280 / 60 * 3 * sigma * ad * v * v * dynamic_mph_pressure / w - w / (dynamic_mph_pressure * Math.PI * sigma * v * v * be * be);
                    return sigmas_dv;
                },
                function (sigmas_dv, ad, v, w, be) {
                    var sigma = sigmas_dv / (5280 / 60 * 3 * ad * v * v * dynamic_mph_pressure / w - w / (dynamic_mph_pressure * Math.PI * v * v * be * be));
                    return sigma;
                },
                function (sigmas_dv, sigma, v, w, be) {
                    var ad = 60 / 5280 * w / (3 * sigma * v * v * dynamic_mph_pressure) * (sigmas_dv + w / (dynamic_mph_pressure * Math.PI * sigma * v * v * be * be));
                    return ad;
                },
                function (sigmas_dv, sigma, ad, v, be) {
                    var coeffs = [1 / (dynamic_mph_pressure * Math.PI * sigma * v * v * be * be), sigmas_dv, -5280 / 60 * 3 * sigma * ad * v * v * dynamic_mph_pressure],
                        w = solvePoly(coeffs)[0];
                    return w;
                },
                function (sigmas_dv, sigma, ad, v, w) {
                    var be = Math.sqrt(1 / (5280 / 60 * 3 * sigma * ad * v * v * dynamic_mph_pressure / w - sigmas_dv) * w / (dynamic_mph_pressure * Math.PI * sigma * v * v));
                    return be;
                }
            ],
            [ // Formula 24
                function (sigma, w, be, ad) {
                    var vmins = Math.sqrt(1 / dynamic_mph_pressure) / Math.pow(3 * Math.PI, 1 / 4) * Math.sqrt(w / be) / (Math.sqrt(sigma) * Math.pow(ad, 1 / 4));
                    return vmins;
                },
                function (vmins, sigma, be, ad) {
                    var w = Math.sqrt(3 * Math.PI) * dynamic_mph_pressure * sigma * Math.pow(vmins, 2) * be * Math.sqrt(ad);
                    return w;
                },
                function (vmins, sigma, w, ad) {
                    var be = w / (Math.sqrt(3 * Math.PI) * dynamic_mph_pressure * sigma * Math.pow(vmins, 2) * Math.sqrt(ad));
                    return be;
                },
                function (vmins, w, be, ad) {
                    var sigma = w / (Math.sqrt(3 * Math.PI) * dynamic_mph_pressure * Math.pow(vmins, 2) * be * Math.sqrt(ad));
                    return sigma;
                },
                function (vmins, sigma, w, be) {
                    var ad = 1 / (3 * Math.PI) * Math.pow(1 / vmins, 4) * Math.pow(w / be / (sigma * dynamic_mph_pressure), 2);
                    return ad;
                }
            ],
            [ // Formula 25
                function (vhat) {
                    var rshat = (Math.pow(vhat, 4) + 3) / (4 * vhat);
                    return rshat;
                },
                function (rshat, vhat) {
                    var coeffs = [
                        1,
                        0,
                        0,
                        -rshat * 4,
                        3
                    ],
                        vhat = solvePoly(coeffs)[1];
                    return vhat;
                }
            ],
            [ // Formula 26
                function (cl, cd0, ear) {
                    var dg_dcl = 360 / Math.TAU * (cd0 / (cl * cl) + 1 / (Math.PI * ear));
                    return dg_dcl;
                },
                function (dg_dcl, cd0, ear) {
                    var cl = Math.sqrt(cd0 / (dg_dcl / 360 * Math.TAU - 1 / (Math.PI * ear)));
                    return cl;
                },
                function (dg_dcl, cl, ear) {
                    var cd0 = (dg_dcl / 360 * Math.TAU - 1 / (Math.PI * ear)) * cl * cl;
                    return cd0;
                },
                function (dg_dcl, cl, cd0) {
                    var ear = 1 / (Math.PI * (dg_dcl * Math.TAU / 360 - cd0 / (cl * cl)));
                    return ear;
                }
            ],
            [ // Formula 27
                function (ear, cd0) {
                    var clmaxld = Math.sqrt(Math.PI * ear * cd0);
                    return clmaxld;
                },
                function (clmaxld, cd0) {
                    var ear = Math.pow(clmaxld, 2) / (Math.PI * cd0);
                    return ear;
                },
                function (clmaxld, ear) {
                    var cd0 = Math.pow(clmaxld, 2) / (Math.PI * ear);
                    return cd0;
                }
            ],
            [ // Formula 28
                function (ear, cd0) {
                    var ldmax = Math.sqrt(Math.PI) / 2 * Math.sqrt(ear / cd0);
                    return ldmax;
                },
                function (ldmax, cd0) {
                    var ear = Math.pow(2 / Math.sqrt(Math.PI) * ldmax, 2) * cd0;
                    return ear;
                },
                function (ldmax, ear) {
                    var cd0 = ear / Math.pow(2 * ldmax / Math.sqrt(Math.PI), 2);
                    return cd0;
                }
            ],
            [ // Formula 29
                function (be, ad) {
                    var ldmax = Math.sqrt(Math.PI) / 2 * be / Math.sqrt(ad);
                    return ldmax;
                },
                function (ldmax, ad) {
                    var be = 2 / Math.sqrt(Math.PI) * ldmax * Math.sqrt(ad);
                    return be;
                },
                function (ldmax, be) {
                    var ad = Math.PI / 4 * Math.pow(be / ldmax, 2);
                    return ad;
                }
            ],
            [ // Formula 30
                function (ad, w, be) {
                    var dmin = 2 / Math.sqrt(Math.PI) * Math.sqrt(ad) * w / be;
                    return dmin;
                },
                function (dmin, w, be) {
                    var ad = Math.pow(dmin * Math.sqrt(Math.PI) / 2 * be / w, 2);
                    return ad;
                },
                function (dmin, ad, be) {
                    var w = Math.sqrt(Math.PI) * dmin * be / (2 * Math.sqrt(ad));
                    return w;
                },
                function (dmin, ad, w) {
                    var be = 2 * Math.sqrt(ad) * w / (Math.sqrt(Math.PI) * dmin);
                    return be;
                }
            ],
            [ // Formula 31
                function (sigma, ad, v, w, be) {
                    var thpal = 5280 / 60 / 33000 * (sigma * ad * Math.pow(v, 3) * dynamic_mph_pressure + 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (Math.PI * sigma * v));
                    return thpal;
                },
                function (thpal, ad, v, w, be) {
                    var coeffs = [
                            5280 / 60 / 33000 * ad * Math.pow(v, 3) * dynamic_mph_pressure,
                            -thpal,
                            5280 / 60 / 33000  / dynamic_mph_pressure * Math.pow(w / be, 2) / (Math.PI * v)
                        ];
                    var sigma = solvePoly(coeffs)[1];
                    return sigma;
                },
                function (thpal, sigma, v, w, be) {
                    var ad = 1 / (Math.pow(v, 3) * dynamic_mph_pressure * sigma) * (33000 * 60 / 5280 * thpal - 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (Math.PI * sigma * v));
                    return ad;
                },
                function (thpal, sigma, ad, w, be) {
                var mph_pressure = 1 / 391.15;
                var coeffs = [
                    ad * mph_pressure * sigma,
                    0,
                    0,
                    33000 / (5280 / 60) * thpal,
                    Math.pow(w / be, 2) / (mph_pressure * Math.PI)
                ];
                var v = -solvePoly(coeffs)[1];
                return v;
                },
                function (thpal, sigma, ad, v, be) {
                    var w = Math.sqrt((thpal / 5280 * 60 * 33000 - sigma * ad * Math.pow(v, 3) * dynamic_mph_pressure) * Math.PI * sigma * v * dynamic_mph_pressure * be * be);
                    return w;
                },
                function (thpal, sigma, ad, v, w) {
                    var be = w / Math.sqrt(dynamic_mph_pressure * Math.PI * sigma * v * (33000 * 60 / 5280 * thpal - Math.pow(v, 3) * dynamic_mph_pressure * sigma * ad));
                    return be;
                },
                function (ad, vmax, sigma) {
                    var thpa = 88 / 33000 * dynamic_mph_pressure * sigma * ad * Math.pow(vmax, 3);
                    return thpa;
                },
                function (thpa, vmax, sigma) {
                    var ad = 33000 / 88 / dynamic_mph_pressure * sigma * thpa / Math.pow(vmax, 3);
                    return ad;
                },
                function (thpa, ad, sigma) {
                    var vmax = Math.pow(33000 / 88 / dynamic_mph_pressure * sigma * thpa / ad, 1 / 3);
                    return vmax;
                },
                function (bhp, eta) {
                    var thpa = bhp * eta;
                    return thpa;
                },
                function (thpa, eta) {
                    var bhp = thpa / eta;
                    return bhp;
                },
                function (thpa, bhp) {
                    var eta = thpa / bhp;
                    return eta;
                }
            ],
            [ // Formula 32
                function (rs, w) {
                    var thpal = rs * w / 33000;
                    return thpal;
                },
                function (thpal, w) {
                    var rs = 33000 * thpal / w;
                    return rs;
                },
                function (thpal, rs) {
                    var w = 33000 * thpal / rs;
                    return w;
                }
            ],
            [ // Formula 33
                function (ad, sigma, w, be) {
                    var thpmin = 5280 / 60 * 4 / 33000 * Math.sqrt(1 / dynamic_mph_pressure) / Math.pow(3 * Math.PI, 3 / 4) * Math.pow(ad, 1 / 4) / Math.sqrt(sigma) * Math.pow(w / be, 3 / 2);
                    return thpmin;
                },
                function (thpmin, sigma, w, be) {
                    var ad = Math.pow(33000 / 4 * 60 / 5280 * Math.sqrt(dynamic_mph_pressure) * Math.pow(3 * Math.PI, 3 / 4) * thpmin * Math.sqrt(sigma) / Math.pow(w / be, 3 / 2), 4);
                    return ad;
                },
                function (thpmin, ad, w, be) {
                    var sigma = Math.pow(5280 / 60 * 4 * Math.sqrt(1 / dynamic_mph_pressure) * Math.pow(ad, 1 / 4) * Math.pow(w / be, 3 / 2) / (33000 * Math.pow(3 * Math.PI, 3 / 4) * thpmin), 2);
                    return sigma;
                },
                function (thpmin, ad, sigma, be) {
                    var w = Math.pow(60 / 5280 * 33000 * Math.pow(3 * Math.PI, 3 / 4) * thpmin * Math.sqrt(sigma) / (4 * Math.sqrt(1 / dynamic_mph_pressure) * Math.pow(ad, 1 / 4)), 2 / 3) * be;
                    return w;
                },
                function (thpmin, ad, sigma, w) {
                    var be = Math.pow(5280 / 60 * 4 / 33000 * Math.sqrt(1 / dynamic_mph_pressure) / Math.pow(3 * Math.PI, 3 / 4) * Math.pow(ad, 1 / 4) / (thpmin * Math.sqrt(sigma)), 2 / 3) * w;
                    return be;
                }
            ],
            [ // Formula 34
                function (d, w, thetac) {
                    var t = d + w * Math.sin(thetac / 360 * Math.TAU);
                    return t;
                },
                function (t, w, thetac) {
                    var d = t - w * Math.sin(thetac / 360 * Math.TAU);
                    return d;
                },
                function (t, d, thetac) {
                    var w = (t - d) / Math.sin(thetac / 360 * Math.TAU);
                    return w;
                },
                function (t, d, w) {
                    var thetac = 360 / Math.TAU * Math.asin((t - d) / w);
                    return thetac;
                }
            ],
            [ // Formula 35
                function (w, thetac) {
                    var l = w * Math.cos(thetac / 360 * Math.TAU);
                    return l;
                },
                function (l, thetac) {
                    var w = l / Math.cos(thetac / 360 * Math.TAU);
                    return w;
                },
                function (l, w) {
                    var thetac = 360 / Math.TAU * Math.acos(l / w);
                    return thetac;
                }
            ],
            [ // Formula 36
                function (thetac, sigma, ad, v, w, be) {
                    var t = w * Math.sin(thetac / 360 * Math.TAU) + sigma * ad * v * v * dynamic_mph_pressure + 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (sigma * v * v);
                    return t;
                },
                function (t, sigma, ad, v, w, be) {
                    var thetac = Math.asin((t - sigma * ad * v * v * dynamic_mph_pressure - 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (sigma * v * v)) / w) / Math.TAU * 360;
                    return thetac;
                },
                function (t, thetac, ad, v, w, be, sigma) {
                    var coeffs = [
                        ad * v * v * dynamic_mph_pressure,
                        w * Math.sin(thetac / 360 * Math.TAU) - t,
                        1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (v * v)
                    ];
                    sigma = solvePoly(coeffs)[1];
                    return sigma;
                },
                function (t, thetac, sigma, v, w, be) {
                    var ad = (t - w * Math.sin(thetac / 360 * Math.TAU) - 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (sigma * v * v)) / (sigma * v * v * dynamic_mph_pressure);
                    return ad;
                },
                function (t, thetac, sigma, ad, w, be) {
                    var coeffs = [
                        sigma * ad * dynamic_mph_pressure,
                        0,
                        w * Math.sin(thetac / 360 * Math.TAU) - t,
                        0,
                        1 / dynamic_mph_pressure * Math.pow(w / be, 2) / sigma
                    ],
                        v = Math.abs(solvePoly(coeffs)[3]);
                    return v;
                },
                function (t, thetac, sigma, ad, v, be) {
                    var coeffs = [
                        1 / dynamic_mph_pressure * Math.pow(1 / be, 2) / (sigma * v * v),
                        Math.sin(thetac / 360 * Math.TAU),
                        sigma * ad * v * v * dynamic_mph_pressure - t
                    ],
                        w = solvePoly(coeffs)[0];
                    return w;
                },
                function (t, thetac, sigma, ad, v, w) {
                    var be = w / Math.sqrt((t - w * Math.sin(thetac / 360 * Math.TAU) - dynamic_mph_pressure * sigma * ad * v * v) * dynamic_mph_pressure * sigma * v * v);
                    return be;
                }
            ],
            [], // Formula 37 - theoretical, allowing us to obtain rate of climb
            [ // Formula 38
                function (bhp, w, eta, rsmin) {
                    // eta is the efficiency: THPa / BHP
                    var rc = (33000 * bhp / w) * eta - rsmin;
                    return rc;
                },
                function (rc, w, eta, rsmin) {
                    var bhp = w / 33000 * (rc + rsmin) / eta;
                    return bhp;
                },
                function (rc, bhp, eta, rsmin) {
                    var w = 33000 * eta * bhp / (rc + rsmin);
                    return w;
                },
                function (rc, bhp, w, rsmin) {
                    var eta = (rc + rsmin) / (33000 * bhp / w);
                    return eta;
                },
                function (rc, bhp, w, eta) {
                    var rsmin = (33000 * bhp / w) * eta - rc;
                    return rsmin;
                }
            ],
            [ // Formula 39
                function (rho, ap, vp) {
                    var mdot = rho * ap * vp;
                    return mdot;
                },
                function (mdot, ap, vp) {
                    var rho = mdot / (ap * vp);
                    return rho;
                },
                function (mdot, rho, vp) {
                    var ap = mdot / (rho * vp);
                    return ap;
                },
                function (mdot, rho, ap) {
                    var vp = mdot / (rho * ap);
                    return vp;
                },
                function (rho, a3, v3) {
                    var mdot = rho * a3 * v3;
                    return mdot;
                },
                function (mdot, a3, v3) {
                    var rhos = mdot / (a3 * v3);
                    return rhos;
                },
                function (mdot, rho, v3) {
                    var a3 = mdot / (rho * v3);
                    return a3;
                },
                function (mdot, rho, a3) {
                    var v3 = mdot / (rho * a3);
                    return v3;
                }
            ],
            [ // Formula 40: change in momentum vs pressure jump
                function (m, v3, v) {
                    var t = m * (v3 - v);
                    return t;
                },
                function (t, v3, v) {
                    var m = t / (v3 - v);
                    return m;
                },
                function (t, m, v) {
                    var v3 = t / m + v;
                    return v3;
                },
                function (t, m, v3) {
                    var v = v3 - t / m;
                    return v;
                }
            ],
            [ // Formula 41: Upstream propeller pressure increase
                function (pd, rho, v) {
                    var pdi = pd + 0.5 * rho * v * v;
                    return pdi;
                },
                function (pdi, rho, v) {
                    var pd = pdi - 0.5 * rho * v * v;
                    return pd;
                },
                function (pdi, pd, v) {
                    var rho = (pdi - pd) / (0.5 * v * v);
                    return rho;
                },
                function (pdi, pd, rho) {
                    var v = Math.sqrt((pdi - pd) / (0.5 * rho));
                    return v;
                },
                function (p1, rho, vp) {
                    var p1i = p1 + 0.5 * rho * vp * vp;
                    return p1i;
                },
                function (p1i, rho, vp) {
                    var p1 = p1i - 0.5 * rho * vp * vp;
                    return p1;
                },
                function (p1i, p1, vp) {
                    var rho = (p1i - p1) / (0.5 + vp * vp);
                    return rho;
                },
                function (p1i, p1, rho) {
                    var vp = Math.sqrt((p1i - p1) / (0.5 * rho));
                    return vp;
                }
            ],
            [ // Formula 42: Downstream propeller pressure
                function (pd, rho, vp, v3) {
                    var p2 = pd + 0.5 * rho * v3 * v3 - 0.5 * rho * vp * vp;
                    return p2;
                },
                function (p2, rho, vp, v3) {
                    var pd = p2 + 0.5 * rho * vp * vp - 0.5 * rho * v3 * v3;
                    return pd;
                },
                function (p2, pd, vp, v3) {
                    var rho = (p2 - pd) / (0.5 * v3 * v3 - 0.5 * vp * vp);
                    return rho;
                },
                function (p2, pd, rho, v3) {
                    var vp = Math.sqrt((0.5 * rho * v3 * v3 - (p2 - pd)) / (0.5 * rho));
                    return vp;
                },
                function (p2, pd, rho, vp) {
                    var v3 = Math.sqrt(((p2 - pd) + 0.5 * rho * vp * vp) / (0.5 * rho));
                    return v3;
                }
            ],
            [ // Formula 43: Propeller pressure jump
                function (p1, rho, v3, v) {
                    var p2 = p1 + 0.5 * rho * (Math.pow(v3, 2 / 3) - v * v);
                    return p2;
                },
                function (p2, rho, v3, v) {
                    var p1 = p2 - 0.5 * rho * (Math.pow(v3, 2 / 3) - v * v);
                    return p1;
                },
                function (p1, p2, v3, v) {
                    var rho = (p2 - p1) / (0.5 * (Math.pow(v3, 2 / 3) - v * v));
                    return rho;
                },
                function (p1, p2, rho, v) {
                    var v3 = Math.pow((p2 - p1) / (0.5 * rho) + v * v, 3 / 2);
                    return v3;
                },
                function (p1, p2, rho, v3) {
                    var v = Math.sqrt(Math.pow(v3, 2 / 3) - (p2 - p1) / (0.5 * rho));
                    return v;
                }
            ],
            [ // Formula 44: Thrust force
                function (rho, v3, v, ap) {
                    var t = 0.5 * rho * (v3 - v) * (v3 + v) * ap;
                    return t;
                },
                function (t, v3, v, ap) {
                    var rho = t / (0.5 * (v3 - v) * (v3 + v) * ap);
                    return rho;
                },
                function (t, rho, v, ap) {
                    var v3 = Math.sqrt(t / (0.5 * rho * ap) + v * v);
                    return v3;
                },
                function (t, rho, v3, ap) {
                    var v = Math.sqrt(v3 * v3 - t / (0.5 * rho * ap));
                    return v;
                },
                function (t, rho, v3, v) {
                    var ap = t / (0.5 * rho * (v3 - v) * (v3 + v));
                    return ap;
                }
            ],
            [ // Formula 45: Prop velocity
                function (v3, v) {
                    var vp = 0.5 * (v3 + v);
                    return vp;
                },
                function (vp, v3) {
                    var v = 2 * vp - v3;
                    return v;
                }
            ],
            [ // Formula 46: Slipstream velocity
                function (vp, v) {
                    var v3 = 2 * vp - v;
                    return v3;
                }
            ],
            [ // Formula 47: Available propeller thrust
                function (rho, ap, vp, v) {
                    var t = 2 * rho * ap * vp * (vp - v);
                    return t;
                },
                function (t, ap, vp, v) {
                    var rho = t / (2 * ap * vp * (vp - v));
                    return rho;
                },
                function (t, rho, vp, v) {
                    var ap = t / (2 * rho * vp * (vp - v));
                    return ap;
                },
                function (t, rho, ap, v) {
                    var vp = solvePoly([2 * rho * ap, -2 * rho * ap * v, -t])[1];
                    return vp;
                },
                function (t, rho, ap, vp) {
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
                function (rho, ap, vp, v) {
                    var pshaft = 2 * rho * ap * vp * vp * (vp - v);
                    return pshaft;
                },
                function (pshaft, ap, vp, v) {
                    var rho = pshaft / (2 * ap * vp * vp * (vp - v));
                    return rho;
                },
                function (pshaft, rho, vp, v) {
                    var ap = pshaft / (2 * rho * vp * vp * (vp - v));
                    return ap;
                },
                function (pshaft, rho, ap, v) {
                    var vp = solvePoly([2 * rho * ap, -2 * rho * ap * v, 0, -pshaft])[0];
                    return vp;
                },
                function (pshaft, rho, ap, vp) {
                    var v = vp - pshaft / (2 * rho * ap * vp * vp);
                    return v;
                }
            ],
            [ // Formula 50: Propeller velocity
                function (sigma, dp, v, eta) {
                    var bhp = Math.PI / 2 * sea_level_density / 33000 * Math.pow(5280 / 60, 3) / Math.pow(60, 2) * sigma * dp * dp * Math.pow(v, 3) * (1 - eta) / Math.pow(eta, 3);
                    return bhp;
                },
                function (bhp, dp, v, eta) {
                    var sigma = 2 / Math.PI * 33000 / sea_level_density * Math.pow(60, 2) / Math.pow(5280 / 60, 3) * bhp / (dp * dp * Math.pow(v, 3)) * Math.pow(eta, 3) / (1 - eta);
                    return sigma;
                },
                function (bhp, sigma, v, eta) {
                    var dp = Math.sqrt(2 / Math.PI * 33000 / sea_level_density * Math.pow(60, 2) / Math.pow(5280 / 60, 3) * bhp / (sigma * Math.pow(v, 3)) * Math.pow(eta, 3) / (1 - eta));
                    return dp;
                },
                function (bhp, sigma, dp, eta) {
                    var v = Math.pow(2 / Math.PI * 33000 / sea_level_density * Math.pow(60, 2) / Math.pow(5280 / 60, 3) * bhp / (sigma * dp * dp) * Math.pow(eta, 3) / (1 - eta), 1 / 3);
                    return v;
                }
            ],
            [ // Formula 51: Dimensionless velocity
                function (bhp, sigma, dp) {
                    var vprop = Math.pow(33000 / sea_level_density * Math.pow(60, 2) / Math.pow(5280 / 60, 3), 1 / 3) * Math.pow(bhp / (sigma * dp * dp), 1 / 3);
                    return vprop;
                },
                function (vprop, sigma, dp) {
                    var bhp = sea_level_density / 33000 * Math.pow(5280 / 60, 3) / Math.pow(60, 2) * sigma * dp * dp * Math.pow(vprop, 3);
                    return bhp;
                },
                function (vprop, bhp, dp) {
                    //33000 / sea_level_density * Math.pow(60, 2) / Math.pow(5280 / 60 * vprop, 3)
                    var sigma = 33000 / sea_level_density * Math.pow(60, 2) / Math.pow(5280 / 60 * vprop, 3) * bhp / (dp * dp);
                    return sigma;
                },
                function (vprop, bhp, sigma) {
                    var dp = Math.sqrt(33000 / sea_level_density * Math.pow(60, 2) / Math.pow(5280 / 60, 3) * bhp / (Math.pow(vprop, 3) * sigma));
                    return dp;
                }
            ],
            [ // Formula 52: Cubic equation for dimensionless velocity
                function (eta) {
                    var vhat = Math.pow(2 / Math.PI, 1 / 3) * eta / Math.pow(1 - eta, 1 / 3);
                    return vhat;
                },
                function (vhat) {
                    var eta = solvePoly([1, 0, Math.pow(vhat, 3) * Math.PI / 2, -Math.pow(vhat, 3) * Math.PI / 2])[0];
                    return eta;
                }
            ],
            [ // Formula 53: Solution to cubic equation for dimensionless velocity
                function (eta, vhat) {
                    var zero = Math.pow(eta, 3) + Math.PI / 2 * Math.pow(vhat, 3) * eta - Math.PI / 2 * Math.pow(vhat, 3);
                    return zero;
                }
            ],
            [ // Formula 54: Solution to cubic equation for dimensionless velocity
                function (vhat) {
                    var eta = solvePoly([1, 0, Math.pow(vhat, 3) * Math.PI / 2, -Math.pow(vhat, 3) * Math.PI / 2])[0];
                    return eta;
                }
            ],
            [ // Formula 55: Nondimensional advance ratio (per second)
                function (v, n, dp) {
                    var j = v / (n * dp);
                    return j;
                },
                function (j, n, dp) {
                    var v = j * n * dp;
                    return v;
                },
                function (j, v, dp) {
                    var n = v / (j * dp);
                    return n;
                },
                function (j, v, n) {
                    var dp = v / (n * j);
                    return dp;
                }
            ],
            [ // Formula 56: Nondimensional advance ratio (per hour)
                function (v, rpm, dp) {
                    var j = 5280 / 60 * v / (rpm * dp);
                    return j;
                },
                function (j, rpm, dp) {
                    var v = 60 / 5280 * j * rpm * dp;
                    return v;
                },
                function (j, v, dp) {
                    var rpm = 5280 / 60 * v / (j * dp);
                    return rpm;
                },
                function (j, v, rpm) {
                    var dp = 5280 / 60 * v / (rpm * j);
                    return dp;
                }
            ],
            [ // Formula 57: Dimensionless power coefficient as ft-lb/sec
                function (p, rho, n, dp) {
                    var cp = p / (rho * Math.pow(n, 3) * Math.pow(dp, 5));
                    return cp;
                },
                function (cp, rho, n, dp) {
                    var p = cp * rho * Math.pow(n, 3) * Math.pow(dp, 5);
                    return p;
                },
                function (cp, p, n, dp) {
                    var rho = p / (cp * Math.pow(n, 3) * Math.pow(dp, 5));
                    return rho;
                },
                function (cp, p, rho, dp) {
                    var n = Math.pow(p / (rho * cp * Math.pow(dp, 5)), 1 / 3);
                    return n;
                },
                function (cp, p, rho, n) {
                    var dp = Math.pow(p / (cp * rho * Math.pow(n, 3)), 1 / 5);
                    return dp;
                }
            ],
            [ // Formula 58: Dimensionless power coefficient as rpm
                function (bhp, rpm, dp) {
                    var cp = 550 * bhp * Math.pow(60, 3) / (sea_level_density * Math.pow(rpm, 3) * Math.pow(dp, 5));
                    return cp;
                },
                function (cp, rpm, dp) {
                    var bhp = cp * (sea_level_density * Math.pow(rpm, 3) * Math.pow(dp, 5)) / (550 * Math.pow(60, 3));
                    return bhp;
                },
                function (cp, bhp, dp) {
                    var rpm = Math.pow(550 * Math.pow(60, 3) * bhp / (cp * sea_level_density * Math.pow(dp, 5)), 1 / 3);
                    return rpm;
                },
                function (cp, bhp, rpm) {
                    var dp = Math.pow(550 * Math.pow(60, 3) * bhp / (sea_level_density * cp * Math.pow(rpm, 3)), 1 / 5);
                    return dp;
                }
            ],
            [ // Formula 59: Dimensionless velocity from advance ratio and power coefficient
                function (j, cp) {
                    var vhat = j / Math.pow(cp, 3);
                    return vhat;
                },
                function (vhat, cp) {
                    var j = vhat * Math.pow(cp, 3);
                    return j;
                },
                function (vhat, j) {
                    var cp = Math.pow(j / vhat, 1 / 3);
                    return cp;
                }
            ],
            [ // Formula 60: Approximation of static thrust as ft-lb/sec
                function (rho, dp, pshaft) {
                    var ts = Math.pow(Math.PI / 2, 1 / 3) * Math.pow(rho, 1 / 3) * Math.pow(dp, 2 / 3) * Math.pow(pshaft, 2 / 3);
                    return ts;
                },
                function (ts, dp, pshaft) {
                    var rho = 2 / Math.PI * Math.pow(ts, 3) / Math.pow(dp * pshaft, 2);
                    return rho;
                },
                function (ts, rho, pshaft) {
                    var dp = Math.sqrt(2 * Math.pow(ts, 3) / (Math.PI * rho)) / pshaft;
                    return dp;
                },
                function (ts, rho, dp) {
                    var pshaft = Math.pow(ts, 3 / 2) * Math.sqrt(2 / (Math.PI * rho)) / dp;
                    return pshaft;
                }
            ],
            [ // Formula 61: Approximation of static thrust as rpm
                function (sigma, dp, bhp) {
                    var ts = 10.41 * Math.pow(sigma, 1 / 3) * Math.pow(dp * bhp, 2 / 3);
                    return ts;
                },
                function (ts, dp, bhp) {
                    var sigma = Math.pow(ts / (10.41 * Math.pow(dp * bhp, 2 / 3)), 3);
                    return sigma;
                },
                function (ts, sigma, bhp) {
                    var dp = Math.pow(ts / (10.41 * Math.pow(sigma, 1 / 3)), 3 / 2) / bhp;
                    return dp;
                },
                function (ts, sigma, dp) {
                    var bhp = Math.pow(ts / (10.41 * Math.pow(sigma, 1 / 3)), 3 / 2) / dp;
                    return bhp;
                }
            ],
            [ // Formula 62: Ideal thrust from an engine-propeller combination
                function (eta, vhat) {
                    var that = Math.pow(2 / Math.PI, 1 / 3) * eta / vhat;
                    return that;
                },
                function (that, vhat) {
                    var eta = that * vhat / Math.pow(2 / Math.PI, 1 / 3);
                    return eta;
                },
                function (that, eta) {
                    var vhat = Math.pow(2 / Math.PI, 1 / 3) * eta / that;
                    return vhat;
                }
            ],
            [ // Formula 63: Idealised thrust ratio from dimensionless velocity
                function (vhat) {
                    var that = 1 / Math.pow(2, 1 / 3) * (Math.pow(1 + Math.sqrt(1 + 2 * Math.PI / 27 * Math.pow(vhat, 3)), 1  / 3) - Math.pow(-1 + Math.sqrt(1 + 2 * Math.PI / 27 * Math.pow(vhat, 3)), 1  / 3));
                    return that;
                }
            ],
            [ // Formula 64: Propeller tip mach number
                function (rpm, dp) {
                    var mp = Math.PI / (60 * 1100) * rpm * dp;
                    return mp;
                },
                function (mp, dp) {
                    var rpm = 60 * 1100 / Math.PI * mp / dp;
                    return rpm;
                },
                function (mp, rpm) {
                    var dp = 60 * 1100 / Math.PI * mp / rpm;
                    return dp;
                }
            ]
        ],
        appendicies = {
            d: [
                [ // D.1: Differential of vertical momentum equation
                    function (rho, dh) {
                        var dp = -rho * constants.G * dh;
                        return dp;
                    },
                    function (dp, rho) {
                        var dh = dp / (-rho * constants.G);
                        return dh;
                    },
                    function (dp, dh) {
                        var rho = -dp / (constants.G * dh);
                        return rho;
                    }
                ],
                [ // D.2: Hydrostatic variation for water
                    function (p0, h) {
                        var p = p0 - Math.pow(p0, constants.G * h);
                        return p;
                    }
                ],
                [ // D.3: Equation of state
                    function (rho, f) {
                        var rankine = f + window.CONSTANTS.FAHRENHEIT_TO_RANKINE,
                            p = rho * constants.UNIVERSAL_GAS_CONSTANT * rankine;
                        return p;
                    },
                    function (f) {
                        var r = f + window.CONSTANTS.FAHRENHEIT_TO_RANKINE;
                        return r;
                    },
                    function (r) {
                        var f = r - window.CONSTANTS.FAHRENHEIT_TO_RANKINE;
                        return f;
                    }
                ],
                [ // D.4: Substituting into D.1
                ],
                [], // D.5: Integrate for isothermal atmosphere
                [   // D.6: Expressed as a solution for p
                    function (p0, h, t0) {
                        var p = p0 * Math.exp(-constants.G * h / (constants.R * t0));
                        return p;
                    },
                    function (p, p0, t0) {
                        var h = Math.log(p / p0) * constants.R * t0 / -constants.G;
                        return h;
                    },
                    function (p, p0, h) {
                        var t0 = -constants.G * h / (Math.log(p / p0) * constants.R);
                        return t0;
                    }
                ],
                [   // D.7: Substituting in to D.3 for density ratio
                    function (h, t0) {
                        var sigma = Math.exp(-constants.G * h / (constants.R * t0));
                        return sigma;
                    },
                    function (sigma, t0) {
                        var h = Math.log(sigma) * (constants.R * t0) / -constants.G;
                        return h;
                    },
                    function (sigma, h) {
                        var t0 = -constants.G * h / (Math.log(sigma) * constants.R);
                        return t0;
                    }
                ],
                [   // D.8: Defined with characteristic altitude
                    function (h, h0) {
                        var sigma = Math.exp(-h / h0);
                        return sigma;
                    },
                    function (sigma, h0) {
                        var h = Math.log(sigma) * -h0;
                        return h;
                    },
                    function (sigma, h) {
                        var h0 = -h / Math.log(sigma);
                        return h0;
                    }
                ],
                [], // D.9: Reformulate D.4 to adjust for altitude
                [], // D.10: Take the integral of the D.9 formula
                [], // D.11: Remove log terms from D20 formula
                [   // D.12: Variation of density ratio with altitude (by substituting into D.3)
                    function (h, f) {
                        var densityRatioRankine, sigma, rankine;
                        densityRatioRankine = function (h, tsl_r) {
                            var temperatureDecreaseRatio = constants.BETA / tsl_r,
                                sigma = Math.pow(1 - temperatureDecreaseRatio * h, constants.G / (constants.R * constants.BETA) - 1);
                            return sigma;
                        };
                        rankine = f + constants.FAHRENHEIT_TO_RANKINE;
                        if (h >= 36240) {
                            rankine = -70 + constants.FAHRENHEIT_TO_RANKINE;
                        }
                        sigma = densityRatioRankine(h, rankine);
                        return sigma;
                    },
                    function (sigma, f) {
                        var h;
                        function ratioHeight() {
                            var tsl = f + constants.FAHRENHEIT_TO_RANKINE,
                                temperatureDecreaseRatio = constants.BETA / tsl,
                                height = (1 - Math.pow(sigma, 1 / (constants.G / (constants.R * constants.BETA) - 1))) / temperatureDecreaseRatio;
                            return height;
                        }
                        h = ratioHeight(sigma, f);
                        return h;
                    },
                    function (sigma, h) {
                        var temperatureDecreaseRatio = (1 - Math.pow(sigma, 1 / (constants.G / (constants.R * constants.BETA) - 1))) / h,
                            tsl = constants.BETA / temperatureDecreaseRatio,
                            f = tsl - constants.FAHRENHEIT_TO_RANKINE;
                        return f;
                    }
                ],
                [], // D.13: estimated values for variation of density using estimated values
                [] // D.14: estimated values for variation of density from 36240 ft to 82000 ft
            ],
            f: [ // Airplane efficiency factor e, and ground effect
                [
                    function (cd0, cl, ear, s) {
                        var cds = (cd0 + cl * cl / (Math.PI * ear)) * s;
                        return cds;
                    },
                    function (cds, cl, ear, s) {
                        var cd0 = cds / s - cl * cl / (Math.PI * ear);
                        return cd0;
                    },
                    function (cds, cd0, ear, s) {
                        var cl = Math.sqrt((cds / s - cd0) * (Math.PI * ear));
                        return cl;
                    },
                    function (cds, cd0, cl, s) {
                        var ear = (cl * cl) / (cds / s - cd0) / Math.PI;
                        return ear;
                    },
                    function (cds, cd0, cl, ear) {
                        var s = cds / (cd0 + cl * cl / (Math.PI * ear));
                        return s;
                    }
                ],
                [
                    function (cdwing, s, kwing, cl, cdfuse, sfuse, kfuse, angleOfAttack, cdcomp, scomp, ar, planformCorrection) {
                        var cd0 = {
                                wing: cdwing * s * (1 + kwing * cl * cl),
                                fuse: cdfuse * sfuse * (1 + kfuse * angleOfAttack * angleOfAttack),
                                comp: cdcomp * scomp
                            },
                            cdi = cl * cl / (Math.PI * ar) * (1 + planformCorrection) * s,
                            cds = cd0.wing + cd0.fuse + cd0.comp + cdi;
                        return cds;
                    }
                ],
                [ // no F.3 in appendix
                ],
                [ // no F.4 in appendix
                ],
                [ // Appendix F.5
                    function (cdwing, s, cdfuse, sfuse, cdcomp, scomp) {
                        var ad = cdwing * s + cdfuse * sfuse + cdcomp * scomp;
                        return ad;
                    }
                ],
                [ // Appendix F.6
                    function (ar) {
                        var radiansToDegrees = window.CONSTANTS.RADIANS_TO_DEGREES,
                            // from lift equation at http://aancl.snu.ac.kr/aancl/lecture/up_file/_1305606276_11th%20week.pdf
                            liftSlopePerDegree = Math.PI  / 0.5 * radiansToDegrees,
                            liftSlope = liftSlopePerDegree * ar / (ar + 3);
                        return liftSlope;
                    },
                    function (liftSlope) {
                        var radiansToDegrees = window.CONSTANTS.RADIANS_TO_DEGREES,
                            liftSlopePerDegree = Math.PI / 0.5 * radiansToDegrees,
                            ar = 3 * liftSlope / (liftSlopePerDegree - liftSlope);
                        return ar;
                    }
                ],
                [ // Appendix F.7
                    function (liftSlope, angleOfAttack) {
                        var cl = liftSlope * angleOfAttack;
                        return cl;
                    },
                    function (cl, angleOfAttack) {
                        var liftSlope = cl / angleOfAttack;
                        return liftSlope;
                    },
                    function (cl, liftSlope) {
                        var angleOfAttack = cl / liftSlope;
                        return angleOfAttack;
                    }
                ],
                [ // Appendix F.8
                    function (planformCorrection, ar, cdwing, kwing) {
                        var invew = (1 + planformCorrection) + Math.PI * ar * cdwing * kwing;
                        return invew;
                    },
                    function (invew, ar, cdwing, kwing) {
                        var planformCorrection = invew - Math.PI * ar * cdwing * kwing - 1;
                        return planformCorrection;
                    },
                    function (invew, planformCorrection, cdwing, kwing) {
                        var ar = (invew - (1 + planformCorrection)) / (Math.PI * cdwing * kwing);
                        return ar;
                    },
                    function (invew, planformCorrection, ar, kwing) {
                        var cdwing = (invew - (1 + planformCorrection)) / (Math.PI * ar * kwing);
                        return cdwing;
                    },
                    function (invew, planformCorrection, ar, cdwing) {
                        var kwing = (invew - (1 + planformCorrection)) / (Math.PI * ar * cdwing);
                        return kwing;
                    },
                    function (ar, cdfuse, kfuse, sfuse, s) {
                        var liftSlopePerDegree = Math.PI  / 0.5 * window.CONSTANTS.RADIANS_TO_DEGREES,
                            invefuse = Math.PI * cdfuse * kfuse * Math.pow((ar + 3) / liftSlopePerDegree, 2) / ar * sfuse / s;
                        return invefuse;
                    },
                    function (invefuse, ar, kfuse, sfuse, s) {
                        var liftSlopePerDegree = Math.PI  / 0.5 * window.CONSTANTS.RADIANS_TO_DEGREES,
                            cdfuse = invefuse * ar / (Math.PI * kfuse * Math.pow((ar + 3) / liftSlopePerDegree, 2)) / (sfuse / s);
                        return cdfuse;
                    },
                    function (invefuse, ar, cdfuse, sfuse, s) {
                        var liftSlopePerDegree = Math.PI  / 0.5 * window.CONSTANTS.RADIANS_TO_DEGREES,
                            kfuse = invefuse * ar / (Math.PI * cdfuse * Math.pow((ar + 3) / liftSlopePerDegree, 2) * sfuse / s);
                        return kfuse;
                    },
                    function (invefuse, ar, cdfuse, kfuse, s) {
                        var liftSlopePerDegree = Math.PI  / 0.5 * window.CONSTANTS.RADIANS_TO_DEGREES,
                            sfuse = invefuse / (Math.PI * cdfuse * kfuse * Math.pow((ar + 3) / liftSlopePerDegree, 2) / ar) * s;
                        return sfuse;
                    },
                    function (invefuse, ar, cdfuse, kfuse, sfuse) {
                        var liftSlopePerDegree = Math.PI  / 0.5 * window.CONSTANTS.RADIANS_TO_DEGREES,
                            s = Math.PI * cdfuse * kfuse * Math.pow((ar + 3) / liftSlopePerDegree, 2) / (invefuse * ar) * sfuse;
                        return s;
                    },
                    function (invew, invefuse) {
                        var inve = invew + invefuse;
                        return inve;
                    },
                    function (inve, invefuse) {
                        var invew = inve - invefuse;
                        return invew;
                    },
                    function (inve, invew) {
                        var invefuse = inve - invew;
                        return invefuse;
                    }
                ],
                [ // Appendix F charts
                    function (ar, wing_shape) {
                        var ewing = {
                            // y = -1.299978216·10-4 x4 + 4.834347856·10-3 x3 - 6.620280841·10-2 x2 + 3.637235757·10-1 x + 1.852971495·10-1
                            rectangular: (ar < 1 || ar > 20) ? undefined
                                : -0.0001299978216 * Math.pow(ar, 4) + 0.004834347856 * Math.pow(ar, 3) - 0.06620280841 * Math.pow(ar, 2) + 0.3637235757 * ar + 0.1852971495,
                            // y = -3.880517128·10-5 x4 + 1.96650416·10-3 x3 - 3.706755805·10-2 x2 + 2.647194811·10-1 x + 2.944072497·10-1
                            tapered: (ar < 1 || ar > 20) ? undefined
                                : -0.00003880517128 * Math.pow(ar, 4) + 0.00196650416 * Math.pow(ar, 3) - 0.03706755805 * Math.pow(ar, 2) + 0.2647194811 * ar + 0.2944072497,
                            // y = 5.303030303·10-4 x4 - 1.136363636·10-2 x3 + 9.189393939·10-2 - 3.853896104·10-1 x + 1.000822511
                            delta: (ar < 0 || ar > 6) ? undefined
                                : 0.0005303030303 * Math.pow(ar, 4) - 0.01136363636 * Math.pow(ar, 3) + 0.09189393939 * Math.pow(ar, 2) - 0.3853896104 * ar + 1.000822511,
                            elliptical: (ar < 0) ? undefined
                                : 1
                        };
                        if (wing_shape) {
                            ewing = ewing[wing_shape];
                        }
                        return ewing;
                    },
                    function (ar, fuselage_shape) {
                        // values from http://www.xuru.org/rt/PR.asp
                        var fuselageCorrection = {
                            rectangular: 0.0009810583609 * Math.pow(ar, 3) - 0.0152240777 * Math.pow(ar, 2) + 0.1597429943 * ar + 1.047025734,
                            round: 0.001669860442 * Math.pow(ar, 2) + 0.01325063838 * ar + 0.5558606027
                        };
                        if (fuselage_shape) {
                            fuselageCorrection = fuselageCorrection[fuselage_shape];
                        }
                        return fuselageCorrection;
                    },
                    function (fuselageCorrection, sfuse, s) {
                        var invefuse = fuselageCorrection * (sfuse / s);
                        return invefuse;
                    },
                    function (invefuse, sfuse, s) {
                        var fuselageCorrection = invefuse / (sfuse / s);
                        return fuselageCorrection;
                    },
                    function (invefuse, fuselageCorrection, s) {
                        var sfuse = invefuse / fuselageCorrection * s;
                        return sfuse;
                    },
                    function (invefuse, fuselageCorrection, sfuse) {
                        var s = fuselageCorrection / invefuse * sfuse;
                        return s;
                    },
                    function (invew, invefuse) {
                        var inve = invew + invefuse;
                        return inve;
                    },
                    function (inve, invefuse) {
                        var invew = inve - invefuse;
                        return invew;
                    },
                    function (inve, invew) {
                        var invefuse = inve - invew;
                        return invefuse;
                    },
                    function (inve) {
                        var e = 1 / inve;
                        return e;
                    },
                    function (e) {
                        var inve = 1 / e;
                        return inve;
                    },
                    function (invew) {
                        var ewing = 1 / invew;
                        return ewing;
                    },
                    function (ewing) {
                        var invew = 1 / ewing;
                        return invew;
                    },
                    function (ew, h, b) {
                        // from a DataAnalysis app that results in the following Logistics formula
                        function logistics(A, B, k, x) {
                            return A / (1 + B * Math.pow(Math.E, -k * x));
                        }
                        var A = 1.0869,
                            B = -0.9337,
                            k = 7.6391,
                            kgd = logistics(A, B, k, h / b),
                            ewgd = ew * kgd;
                        return ewgd;
                    }
                ]
            ],
            g: [ // Drag analysis
                [ // Appendix G.1
                    function (cdf, af, cdw, sw) {
                        var ad = cdf * af + cdw * sw;
                        return ad;
                    },
                    function (ad, af, cdw, sw) {
                        var cdf = (ad - cdw * sw) / af;
                        return cdf;
                    },
                    function (ad, cdf, cdw, sw) {
                        var af = (ad - cdw * sw) / cdf;
                        return af;
                    },
                    function (ad, cdf, af, sw) {
                        var cdw = (ad - cdf * af) / sw;
                        return cdw;
                    },
                    function (ad, cdf, af, cdw) {
                        var sw = (ad - cdf * af) / cdw;
                        return sw;
                    }
                ],
                [ // Appendix G.2
                    function (rel) {
                        // default behaviour is for laminar airflow
                        // alpha source: J.P.Boyd from http://hal.archives-ouvertes.fr/docs/00/26/92/82/PDF/BrighiFruchardSariHAL.pdf
                        var alpha = 1.32822934486,
                            cdw = alpha / Math.sqrt(rel);
                        return cdw;
                    }
                ]
            ],
            h: [], // Appendix H
            i: [ // Appendix I
                [
                    function (f) {
                        // μ = 2.270 * (T^(3/2) / T + 198.6) * 10^-8
                        var rankine = f + window.CONSTANTS.FAHRENHEIT_TO_RANKINE,
                            mu = 2.270 * Math.pow(rankine, 3 / 2) / (rankine + 198.6) * 1e-8;
                        return mu;
                    },
                    function (rho, v, mu, c) {
                        var vfs = v * window.CONSTANTS.MPH_TO_FPS,
                            inertia = rho * vfs * vfs,
                            viscous = mu * vfs / c,
                            rel = inertia / viscous;
                        return rel;
                    }
                ]
            ],
            j: [ // Appendix J
                [
                    function (rho, r) {
                        var p = rho * constants.UNIVERSAL_GAS_CONSTANT * r;
                        return p;
                    },
                    function (p, r) {
                        var rho = p / (constants.UNIVERSAL_GAS_CONSTANT * r);
                        return rho;
                    },
                    function (p, rho) {
                        var r = p / (rho * constants.UNIVERSAL_GAS_CONSTANT);
                        return r;
                    },
                    function (rho) {
                        var sigma = rho / constants.SEALEVEL_DENSITY;
                        return sigma;
                    },
                    function (sigma) {
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
