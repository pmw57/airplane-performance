/*jslint browser:true */
/*globals Solver, rpSolve */

var formulas = (function () {
    'use strict';

    function solvePoly(coeffs) {
        var degree = {Degree: coeffs.length - 1},
            real = [0, 0, 0],
            imag = [0, 0, 0],
            answers = [];
        rpSolve(degree, coeffs, real, imag);
        answers = real.map(function (real, index) {
            return {real: real, i: imag[index]};
        })
            .filter(function (result) {
                return result.i === 0;
            })
            .map(function (result) {
                return result.real;
            });
        return answers;
    }

    var dynamic_mph_pressure = 0.5 * 0.002377 * Math.pow(5280 / 3600, 2),
        sea_level_density = 0.002377,
        G = window.G, // gravitational constant
        R = window.R, // universal gas constant
        formulas = [
            [ // formula 1
                function (w, g) {
                    var d = w * Math.sin(g * Math.TAU / 360);
                    return d;
                },
                function (d, g) {
                    var w = d / Math.sin(g * Math.TAU / 360);
                    return w;
                },
                function (d, w) {
                    var g = Math.asin(d / w) * 360 / Math.TAU;
                    return g;
                }
            ],
            [ // Formula 2
                function (w, g) {
                    var l = w * Math.cos(g * Math.TAU / 360);
                    return l;
                },
                function (l, g) {
                    var w = l / Math.cos(g * Math.TAU / 360);
                    return w;
                },
                function (l, w) {
                    var g = Math.acos(l / w) / Math.TAU * 360;
                    return g;
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
                }
            ],
            [ // Formula 8
                function (sigma, cd, s, v) {
                    var g = 360 / Math.TAU * sigma * cd * s * v * v * dynamic_mph_pressure;
                    return g;
                },
                function (g, cd, s, v) {
                    var sigma = Math.TAU / 360 * g / (cd * s * v * v * dynamic_mph_pressure);
                    return sigma;
                },
                function (g, sigma, s, v) {
                    var cd = Math.TAU / 360 * g / (sigma * s * v * v * dynamic_mph_pressure);
                    return cd;
                },
                function (g, sigma, cd, v) {
                    var s = Math.TAU / 360 * g / (sigma * cd * v * v * dynamic_mph_pressure);
                    return s;
                },
                function (g, sigma, cd, s) {
                    var v = Math.sqrt(Math.TAU / 360 * g / (sigma * cd * s * dynamic_mph_pressure));
                    return v;
                }
            ],
            [ // Formula 9
                function (cd, cl) {
                    var g = 360 / Math.TAU * cd / cl;
                    return g;
                },
                function (g, cl) {
                    var cd = Math.TAU / 360 * g * cl;
                    return cd;
                },
                function (g, cd) {
                    var cl = 360 / Math.TAU * g * cd;
                    return cl;
                }
            ],
            [ // Formula 10
                function (sigma, cd, s, v, w) {
                    var rs = 60 / 5280 * v * sigma * cd * s * v * v / dynamic_mph_pressure * w;
                    return rs;
                },
                function (rs, cd, s, v, w) {
                    var sigma = 60 / 5280 * rs / (v * cd * s * v * v  * w) * dynamic_mph_pressure;
                    return sigma;
                },
                function (rs, sigma, s, v, w) {
                    var cd = 60 / 5280 * rs / (v * sigma * s * v * v  * w) * dynamic_mph_pressure;
                    return cd;
                },
                function (rs, sigma, cd, v, w) {
                    var s = 60 / 5280 * rs / (v * sigma * cd * v * v * w) * dynamic_mph_pressure;
                    return s;
                },
                function (rs, sigma, cd, s, w) {
                    var v = Math.pow(60 / 5280 * rs / (sigma * cd * s * w) * dynamic_mph_pressure, 1 / 3);
                    return v;
                },
                function (rs, sigma, cd, s, v) {
                    var  w = 60 / 5280 * rs / (v * sigma * cd * s * v * v) * dynamic_mph_pressure;
                    return w;
                }
            ],
            [ // Formula 11
                function (dr, w, s, cd, cl) {
                    var rs = 5280 / 60 * Math.sqrt(1 / (dr * dynamic_mph_pressure) * w / s) * cd / Math.pow(cl, 3 / 2);
                    return rs;
                },
                function (w, s, rs, cd, cl) {
                    var dr = Math.pow(5280 / 60 * Math.sqrt(1 / dynamic_mph_pressure * w / s) / rs * cd / Math.pow(cl, 3 / 2), 2);
                    return dr;
                },
                function (rs, dr, s, cd, cl) {
                    var w = Math.pow(60 / 5280 * rs * Math.sqrt(dr * dynamic_mph_pressure), 2) * s * Math.pow(Math.pow(cl, 3 / 2) / cd, 2);
                    return w;
                },
                function (dr, w, rs, cd, cl) {
                    var s = Math.pow(5280 / 60, 2) / (dynamic_mph_pressure * dr) * w / Math.pow(rs, 2) * Math.pow(cd / Math.pow(cl, 3 / 2), 2);
                    return s;
                },
                function (rs, dr, w, s, cl) {
                    var cd = 60 / 5280 * Math.sqrt(dr * dynamic_mph_pressure) * Math.sqrt(s / w) * rs * Math.pow(cl, 3 / 2);
                    return cd;
                },
                function (dr, w, s, rs, cd) {
                    var cl = Math.pow(5280 / 60 / Math.sqrt(dr * dynamic_mph_pressure) * Math.sqrt(w / s) / rs * cd, 2 / 3);
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
                    var cdi = cd0 - cd;
                    return cdi;
                }
            ],
            [ // Formula 13
                function (cl, ar) {
                    var cd = cl * cl / (Math.PI * ar);
                    return cd;
                },
                function (cd, ar) {
                    var cl = Math.sqrt(cd * (Math.PI * ar));
                    return cl;
                },
                function (cd, cl) {
                    var ar = Math.PI * cl * cl / cd;
                    return ar;
                }
            ],
            [ // Formula 14
                function (b, c) {
                    var ar_c = b / c;
                    return ar_c;
                },
                function (ar, c) {
                    var b_c = ar * c;
                    return b_c;
                },
                function (ar, b) {
                    var c = b / ar;
                    return c;
                },
                function (b, s) {
                    var ar_s = b * b / s;
                    return ar_s;
                },
                function (ar, s) {
                    var b_s = Math.sqrt(ar * s);
                    return b_s;
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
                }
            ],
            [ // Formula 16
                function (cd0, cl, ear) {
                    var cd_cl32 = cd0 / Math.pow(cl, 3 / 2) + Math.sqrt(cl) / (Math.PI * ear);
                    return cd_cl32;
                },
                function (cd_cl32, cl, ear) {
                    var cd0 = Math.pow(cl, 3 / 2) * (cd_cl32 - Math.sqrt(cl) / (Math.PI * ear));
                    return cd0;
                },
                function (cd_cl32, cd0, ear) {
                    var cl = 1,
                        clold = 0,
                        count = 0;
                    // d_dcl should be close to zero
                    while (Math.abs(cl - clold) > 1e-16 && count < 100) {
                        clold = cl;
                        cl = Math.pow(cl, 2) / -(Math.PI * ear) + cd_cl32 * Math.pow(Math.abs(cl), 3 / 2) - cd0;
                        count += 1;
                    }
                    return cl;
                },
                function (cd_cl32, cd0, cl) {
                    var ear = Math.sqrt(cl) / (Math.PI * (cd_cl32 - cd0 / Math.pow(cl, 3 / 2)));
                    return ear;
                }
            ],
            [ // Formula 17
                function (cd0, cl, ear) {
                    var d_dcl = -3 / 2 * cd0 / Math.pow(cl, 5 / 2) + 1 / 2 / (Math.PI * ear * Math.sqrt(cl));
                    return d_dcl;
                },
                function (d_dcl, cl, ear) {
                    var cd0 = 2 / -3 * Math.pow(cl, 5 / 2) * (d_dcl - 1 / (2 * Math.PI * ear * Math.sqrt(cl)));
                    return cd0;
                },
                function (d_dcl, cd0, ear) {
                    var cl = 1,
                        clold = 0,
                        count = 0;
                    // d_dcl should be close to zero
                    while (Math.abs(cl - clold) > 1e-16 && count < 100) {
                        clold = cl;
                        cl = Math.sqrt(2 * Math.PI * ear * (3 / 2 * cd0 + d_dcl * Math.pow(Math.abs(cl), 5 / 2)));
                        count += 1;
                    }
                    return cl;
                },
                function (d_dcl, cd0, cl) {
                    var ear = 1 / 2 / ((d_dcl + 3 / 2 * cd0 / Math.pow(cl, 5 / 2)) * Math.PI * Math.sqrt(cl));
                    return ear;
                }
            ],
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
                }
            ],
            [ // Formula 20
                function (w, dr, ad, be) {
                    var rsmin = 5280 / 60 * Math.sqrt(1 / dynamic_mph_pressure) * 4 / Math.pow(3 * Math.PI, 3 / 4) * Math.sqrt(w / dr) * Math.pow(ad, 1 / 4) / Math.pow(be, 3 / 2);
                    return rsmin;
                },
                function (rsmin, dr, ad, be) {
                    var w = Math.pow(rsmin * 60 / 5280 * Math.sqrt(dynamic_mph_pressure) * Math.pow(3 * Math.PI, 3 / 4) / (4 * Math.pow(ad, 1 / 4)) * Math.pow(be, 3 / 2), 2) * dr;
                    return w;
                },
                function (rsmin, w, ad, be) {
                    var dr = Math.pow(5280 / 60 * 4 / Math.pow(3 * Math.PI, 3 / 4) / Math.sqrt(dynamic_mph_pressure) / rsmin * Math.pow(ad, 1 / 4) / Math.pow(be, 3 / 2), 2) * w;
                    return dr;
                },
                function (rsmin, w, dr, be) {
                    var ad = Math.pow(60 / 5280 * Math.pow(3 * Math.PI, 3 / 4) / 4 * Math.sqrt(dynamic_mph_pressure) * rsmin * Math.sqrt(dr / w) * Math.pow(be, 3 / 2), 4);
                    return ad;
                },
                function (rsmin, w, dr, ad) {
                    var be = Math.pow(5280 / 60 * 4 / Math.pow(3 * Math.PI, 3 / 4) / (Math.sqrt(dynamic_mph_pressure) * rsmin) * Math.sqrt(w / dr) * Math.pow(ad, 1 / 4), 2 / 3);
                    return be;
                }
            ],
            [ // Formula 21
                function (w, be, dr, ad) {
                    var vmins = Math.sqrt(1 / dynamic_mph_pressure) / Math.pow(3 * Math.PI, 1 / 4) * Math.sqrt(w / be) / (Math.sqrt(dr) * Math.pow(ad, 1 / 4));
                    return vmins;
                },
                function (vmins, be, dr, ad) {
                    var w = Math.pow(Math.pow(3 * Math.PI, 1 / 4) * Math.sqrt(dynamic_mph_pressure) * vmins * Math.sqrt(be) * Math.sqrt(dr) * Math.pow(ad, 1 / 4), 2);
                    return w;
                },
                function (vmins, w, dr, ad) {
                    var be = w / (dynamic_mph_pressure * Math.sqrt(3 * Math.PI) * Math.pow(vmins, 2) * dr * Math.sqrt(ad));
                    return be;
                },
                function (vmins, w, be, ad) {
                    var dr = w / (dynamic_mph_pressure * Math.sqrt(3 * Math.PI) * Math.pow(vmins, 2) * be * Math.sqrt(ad));
                    return dr;
                },
                function (vmins, w, be, dr) {
                    var ad = Math.pow(1 / (dynamic_mph_pressure * dr * Math.sqrt(3 * Math.PI) * Math.pow(vmins, 2)) * w / be, 2);
                    return ad;
                }
            ],
            [ // Formula 22
                function (dr, ad, v, w, be) {
                    var rs = 5280 / 60 * (dr * ad * v * v * v * dynamic_mph_pressure + w / dynamic_mph_pressure * Math.PI * dr * v * be * be);
                    return rs;
                },
                function (rs, ad, v, w, be) {
                    var dr = 60 / 5280 * rs / (ad * v * v * v * dynamic_mph_pressure + w / dynamic_mph_pressure * Math.PI * v * be * be);
                    return dr;
                },
                function (rs, dr, v, w, be) {
                    var ad = (60 / 5280 * rs / (dr * v) - w / dynamic_mph_pressure * Math.PI * be * be) / (v * v * dynamic_mph_pressure);
                    return ad;
                },
                function (rs, dr, ad, w, be) {
                    var a = (w / dynamic_mph_pressure * Math.PI * dr * be * be / (dr * ad * dynamic_mph_pressure)),
                        b = -60 / 5280 * rs / (dr * ad * dynamic_mph_pressure),
                        v = solvePoly([1, 0, a, b]);
                    return v;
                },
                function (rs, dr, ad, v, be) {
                    var w = dynamic_mph_pressure * (60 / 5280 * rs - dynamic_mph_pressure * dr * ad * v * v * v) / (Math.PI * dr * v * be * be);
                    return w;
                },
                function (rs, dr, ad, v, w) {
                    var be = Math.sqrt(dynamic_mph_pressure / (Math.PI * dr * v * w) * (60 / 5280 * rs - dr * ad * v * v * v * dynamic_mph_pressure));
                    return be;
                }
            ],
            [ // Formula 23
                function (dr, ad, v, w, be) {
                    var drs_dv = 5280 / 60 * 3 * dr * ad * v * v * dynamic_mph_pressure / w - w / (dynamic_mph_pressure * Math.PI * dr * v * v * be * be);
                    return drs_dv;
                },
                function (drs_dv, ad, v, w, be) {
                    var dr = drs_dv / (5280 / 60 * 3 * ad * v * v * dynamic_mph_pressure / w - w / (dynamic_mph_pressure * Math.PI * v * v * be * be));
                    return dr;
                },
                function (drs_dv, dr, v, w, be) {
                    var ad = 60 / 5280 * w / (3 * dr * v * v * dynamic_mph_pressure) * (drs_dv + w / (dynamic_mph_pressure * Math.PI * dr * v * v * be * be));
                    return ad;
                },
                function (drs_dv, dr, ad, v, be) {
                    var coeffs = [1 / (dynamic_mph_pressure * Math.PI * dr * v * v * be * be), drs_dv, -5280 / 60 * 3 * dr * ad * v * v * dynamic_mph_pressure],
                        w = solvePoly(coeffs)[0];
                    return w;
                },
                function (drs_dv, dr, ad, v, w) {
                    var be = Math.sqrt(1 / (5280 / 60 * 3 * dr * ad * v * v * dynamic_mph_pressure / w - drs_dv) * w / (dynamic_mph_pressure * Math.PI * dr * v * v));
                    return be;
                }
            ],
            [ // Formula 24
                function (dr, w, be, ad) {
                    var vmins = Math.sqrt(1 / dynamic_mph_pressure) / Math.pow(3 * Math.PI, 1 / 4) * Math.sqrt(w / be) / (Math.sqrt(dr) * Math.pow(ad, 1 / 4));
                    return vmins;
                },
                function (vmins, dr, be, ad) {
                    var w = Math.sqrt(3 * Math.PI) * dynamic_mph_pressure * dr * Math.pow(vmins, 2) * be * Math.sqrt(ad);
                    return w;
                },
                function (vmins, dr, w, ad) {
                    var be = w / (Math.sqrt(3 * Math.PI) * dynamic_mph_pressure * dr * Math.pow(vmins, 2) * Math.sqrt(ad));
                    return be;
                },
                function (vmins, w, be, ad) {
                    var dr = w / (Math.sqrt(3 * Math.PI) * dynamic_mph_pressure * Math.pow(vmins, 2) * be * Math.sqrt(ad));
                    return dr;
                },
                function (vmins, dr, w, be) {
                    var ad = 1 / (3 * Math.PI) * Math.pow(1 / vmins, 4) * Math.pow(w / be / (dr * dynamic_mph_pressure), 2);
                    return ad;
                }
            ],
            [ // Formula 25
                function (vhat) {
                    var rshat = Math.pow(vhat, 3) / 4 + 3 / 4 * vhat;
                    return rshat;
                },
                function (rshat) {
                    var coeffs = [1, 0, 3, -4 * rshat],
                        vhat = solvePoly(coeffs)[0];
                    return vhat;
                }
            ],
            [ // Formula 26
                function (cl, cd0, ear) {
                    var dg_dcl = 180 / Math.PI * (cd0 / (cl * cl) + 1 / (Math.PI * ear));
                    return dg_dcl;
                },
                function (dg_dcl, cd0, ear) {
                    var cl = Math.sqrt(cd0 / (dg_dcl / 180 * Math.PI - 1 / (Math.PI * ear)));
                    return cl;
                },
                function (dg_dcl, cl, ear) {
                    var cd0 = (dg_dcl / 180 * Math.PI - 1 / (Math.PI * ear)) * cl * cl;
                    return cd0;
                },
                function (dg_dcl, cl, cd0) {
                    var ear = 1 / (Math.PI * (dg_dcl * Math.PI / 180 - cd0 / (cl * cl)));
                    return ear;
                }
            ],
            [ // Formula 27
                function (ear, cd0) {
                    var clmaxld1 = Math.sqrt(Math.PI * ear * cd0);
                    return clmaxld1;
                },
                function (clmaxld1, cd0) {
                    var ear = Math.pow(clmaxld1, 2) / (Math.PI * cd0);
                    return ear;
                },
                function (clmaxld1, ear) {
                    var cd0 = Math.pow(clmaxld1, 2) / (Math.PI * ear);
                    return cd0;
                }
            ],
            [ // Formula 28
                function (clmins) {
                    var clmaxld2 = clmins / Math.sqrt(3);
                    return clmaxld2;
                },
                function (clmaxld2) {
                    var clmins = clmaxld2 * Math.sqrt(3);
                    return clmins;
                }
            ],
            [ // Formula 29
                function (ad, be) {
                    var ldmax = be * Math.sqrt(Math.PI / 4 / ad);
                    return ldmax;
                },
                function (ldmax, be) {
                    var ad = Math.PI / (4 * Math.pow(ldmax / be, 2));
                    return ad;
                },
                function (ldmax, ad) {
                    var be = ldmax / Math.sqrt(Math.PI / 4 / ad);
                    return be;
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
                function (dr, ad, v, w, be) {
                    var thpal = 5280 / 60 / 33000 * (dr * ad * Math.pow(v, 3) * dynamic_mph_pressure + 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (Math.PI * dr * v));
                    return thpal;
                },
                function (thpal, ad, v, w, be) {
                    var coeffs = [
                        ad * Math.pow(v, 3) * dynamic_mph_pressure,
                        -33000 * 60 / 5280 * thpal,
                        Math.pow(w / be, 2) / (dynamic_mph_pressure * Math.PI * v)
                    ],
                        dr = solvePoly(coeffs)[1];
                    return dr;
                },
                function (thpal, dr, v, w, be) {
                    var ad = 1 / (Math.pow(v, 3) * dynamic_mph_pressure * dr) * (33000 * 60 / 5280 * thpal - 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (Math.PI * dr * v));
                    return ad;
                },
                function (thpal, dr, ad, w, be) {
                    // TODO
                    // var thpal = 5280 / 60 / 33000 * (dr * ad * Math.pow(v, 3) * dynamic_mph_pressure + 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (Math.PI * dr * v));
                    // return v;
                },
                function (thpal, dr, ad, v, be) {
                    // TODO
                    // var thpal = 5280 / 60 / 33000 * (dr * ad * Math.pow(v, 3) * dynamic_mph_pressure + 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (Math.PI * dr * v));
                    // return w;
                },
                function (thpal, dr, ad, v, w) {
                    var be = w / Math.sqrt(dynamic_mph_pressure * Math.PI * dr * v * (33000 * 60 / 5280 * thpal - Math.pow(v, 3) * dynamic_mph_pressure * dr * ad));
                    return be;
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
                function (ad, dr, w, be) {
                    var thpmin = 5280 / 60 * 4 / 33000 * Math.sqrt(1 / dynamic_mph_pressure) / Math.pow(3 * Math.PI, 3 / 4) * Math.pow(ad, 1 / 4) / Math.sqrt(dr) * Math.pow(w / be, 3 / 2);
                    return thpmin;
                },
                function (thpmin, dr, w, be) {
                    var ad = Math.pow(33000 / 4 * 60 / 5280 * Math.sqrt(dynamic_mph_pressure) * Math.pow(3 * Math.PI, 3 / 4) * thpmin * Math.sqrt(dr) / Math.pow(w / be, 3 / 2), 4);
                    return ad;
                },
                function (thpmin, ad, w, be) {
                    var dr = Math.pow(5280 / 60 * 4 * Math.sqrt(1 / dynamic_mph_pressure) * Math.pow(ad, 1 / 4) * Math.pow(w / be, 3 / 2) / (33000 * Math.pow(3 * Math.PI, 3 / 4) * thpmin), 2);
                    return dr;
                },
                function (thpmin, ad, dr, be) {
                    var w = Math.pow(60 / 5280 * 33000 * Math.pow(3 * Math.PI, 3 / 4) * thpmin * Math.sqrt(dr) / (4 * Math.sqrt(1 / dynamic_mph_pressure) * Math.pow(ad, 1 / 4)), 2 / 3) * be;
                    return w;
                },
                function (thpmin, ad, dr, w) {
                    var be = Math.pow(5280 / 60 * 4 / 33000 * Math.sqrt(1 / dynamic_mph_pressure) / Math.pow(3 * Math.PI, 3 / 4) * Math.pow(ad, 1 / 4) / (thpmin * Math.sqrt(dr)), 2 / 3) * w;
                    return be;
                }
            ],
            [ // Formula 34
                function (d, w, c) {
                    var t = d + w * Math.sin(c / 360 * Math.TAU);
                    return t;
                },
                function (t, w, c) {
                    var d = t - w * Math.sin(c / 360 * Math.TAU);
                    return d;
                },
                function (t, d, c) {
                    var w = (t - d) / Math.sin(c / 360 * Math.TAU);
                    return w;
                },
                function (t, d, w) {
                    var c = 360 / Math.TAU * Math.asin((t - d) / w);
                    return c;
                }
            ],
            [ // Formula 35
                function (w, c) {
                    var l = w * Math.cos(c / 360 * Math.TAU);
                    return l;
                },
                function (l, c) {
                    var w = l / Math.cos(c / 360 * Math.TAU);
                    return w;
                },
                function (l, w) {
                    var c = 360 / Math.TAU * Math.acos(l / w);
                    return c;
                }
            ],
            [ // Formula 36
                function (c, dr, ad, v, w, be) {
                    var t = w * Math.sin(c / 360 * Math.TAU) + dr * ad * v * v * dynamic_mph_pressure + 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (dr * v * v);
                    return t;
                },
                function (t, dr, ad, v, w, be) {
                    var c = Math.asin((t - dr * ad * v * v * dynamic_mph_pressure - 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (dr * v * v)) / w) / Math.TAU * 360;
                    return c;
                },
                function (t, c, ad, v, w, be, dr) {
                    var coeffs = [
                        ad * v * v * dynamic_mph_pressure,
                        w * Math.sin(c / 360 * Math.TAU) - t,
                        1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (v * v)
                    ];
                    dr = solvePoly(coeffs)[1];
                    return dr;
                },
                function (t, c, dr, v, w, be) {
                    var ad = (t - w * Math.sin(c / 360 * Math.TAU) - 1 / dynamic_mph_pressure * Math.pow(w / be, 2) / (dr * v * v)) / (dr * v * v * dynamic_mph_pressure);
                    return ad;
                },
                function (t, c, dr, ad, v, be) {
                    var coeffs = [
                        1 / dynamic_mph_pressure * Math.pow(1 / be, 2) / (dr * v * v),
                        Math.sin(c / 360 * Math.TAU),
                        dr * ad * v * v * dynamic_mph_pressure - t
                    ],
                        w = solvePoly(coeffs)[0];
                    return w;
                },
                function (t, c, dr, ad, v, w) {
                    var be = w / Math.sqrt((t - w * Math.sin(c / 360 * Math.TAU) - dynamic_mph_pressure * dr * ad * v * v) * dynamic_mph_pressure * dr * v * v);
                    return be;
                }
            ],
            [ // Formula 37
                function (w, rc, thpal) {
                    var thpa = w * rc / 33000 + thpal;
                    return thpa;
                },
                function (thpa, rc, thpal) {
                    var w = 33000 * (thpa - thpal) / rc;
                    return w;
                },
                function (thpa, w, thpal) {
                    var rc = 33000 * (thpa - thpal) / w;
                    return rc;
                },
                function (thpa, w, rc) {
                    var thpal = thpa - w * rc / 33000;
                    return thpal;
                }
            ],
            [ // Formula 38
                function (bhp, w, eta, rs) {
                    // eta is the efficiency: THPa / BHP
                    var rc = (33000 * bhp / w) * eta - rs;
                    return rc;
                },
                function (rc, w, eta, rs) {
                    var bhp = w / 33000 * (rc + rs) / eta;
                    return bhp;
                },
                function (rc, bhp, eta, rs) {
                    var w = 33000 * eta * bhp / (rc + rs);
                    return w;
                },
                function (rc, bhp, w, rs) {
                    var eta = (rc + rs) / (33000 * bhp / w);
                    return eta;
                },
                function (rc, bhp, w, eta) {
                    var rs = (33000 * bhp / w) * eta - rc;
                    return rs;
                }
            ],
            [ // Formula 39
                function (rho, ap, vp) {
                    var mp = rho * ap * vp;
                    return mp;
                },
                function (mp, ap, vp) {
                    var rhop = mp / (ap * vp);
                    return rhop;
                },
                function (mp, rho, vp) {
                    var ap = mp / (rho * vp);
                    return ap;
                },
                function (mp, rho, ap) {
                    var vp = mp / (rho * ap);
                    return vp;
                },
                function (rho, a3, v3) {
                    var ms = rho * a3 * v3;
                    return ms;
                },
                function (ms, a3, v3) {
                    var rhos = ms / (a3 * v3);
                    return rhos;
                },
                function (ms, rho, v3) {
                    var a3 = ms / (rho * v3);
                    return a3;
                },
                function (ms, rho, a3) {
                    var v3 = ms / (rho * a3);
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
                // TODO: Add equalities as checks and comparisons
                //eta = pthrust/pshaft = t.v/t.vp = v/vp
                function (pthrust, pshaft) {
                    var eta = pthrust / pshaft;
                    return eta;
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
                function (rho, dp, bhp) {
                    var ts = 10.41 * Math.pow(rho, 1 / 3) * Math.pow(dp * bhp, 2 / 3);
                    return ts;
                },
                function (ts, dp, bhp) {
                    var rho = Math.pow(ts / (10.41 * Math.pow(dp * bhp, 2 / 3)), 3);
                    return rho;
                },
                function (ts, rho, bhp) {
                    var dp = Math.pow(ts / (10.41 * Math.pow(rho, 1 / 3)), 3 / 2) / bhp;
                    return dp;
                },
                function (ts, rho, dp) {
                    var bhp = Math.pow(ts / (10.41 * Math.pow(rho, 1 / 3)), 3 / 2) / dp;
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
                    var rpm = 60 * 1100 * mp / (Math.PI * dp);
                    return rpm;
                },
                function (mp, rpm) {
                    var dp = 60 * 1100 * mp / (Math.PI * rpm);
                    return dp;
                }
            ]
        ],
        appendicies = {
            d: [
                [], // D.1: Differential of vertical momentum equation
                [], // D.2: Hydrostatic variation for water
                [], // D.3: Equation of state
                [], // D.4: Substituting into D.1
                [], // D.5: Integrate for isothermal atmosphere
                [   // D.6: Expressed as a solution for p
                    function (p0, h, t0) {
                        var p = p0 * Math.exp(-window.G * h / (R * t0));
                        return p;
                    },
                    function (p, p0, t0) {
                        var h = Math.log(p / p0) * R * t0 / -G;
                        return h;
                    },
                    function (p, p0, h) {
                        var t0 = -G * h / (Math.log(p / p0) * R);
                        return t0;
                    }
                ],
                [   // D.7: Substituting in to D.3 for density ratio
                    function (h, t0) {
                        var sigma = Math.exp(-G * h / (R * t0));
                        return sigma;
                    },
                    function (sigma, t0) {
                        var h = Math.log(sigma) * (R * t0) / -G;
                        return h;
                    },
                    function (sigma, h) {
                        var t0 = -G * h / (Math.log(sigma) * R);
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
                    function (h) {
                        var tsl = window.TSL + window.FAHRENHEIT_TO_RANKIN,
                            temperatureDecreaseRatio = window.BETA / tsl,
                            sigma = Math.pow(1 - temperatureDecreaseRatio * h, window.G / (window.R * window.BETA) - 1);
                        return sigma;
                    },
                    function (sigma) {
                        var tsl = window.TSL + window.FAHRENHEIT_TO_RANKIN,
                            temperatureDecreaseRatio = window.BETA / tsl,
                            h = (1 - Math.pow(sigma, 1 / (window.G / (window.R * window.BETA) - 1))) / temperatureDecreaseRatio;
                        return h;
                    }
                ],
                [], // D.13: estimated values for variation of density using estimated values
                [] // D.14: estimated values for variation of density from 36240 ft to 82000 ft
            ],
            f: [
                [
                    function (cd0, cl, ear, s) {
                        var cds = (cd0 + cl * cl / (Math.PI * ear)) * s;
                        return cds;
                    }
                ],
                [
                    function (cdwing, s, kwing, cl, cdfuse, sfuse, kfuse, adeg, cdpart, spart, ar, planformCorrection) {
                        // Prandtls lifting line theory tells us that an elliptical planform equals 0
                        var cds =
                            // paradise drag of the wing
                            cdwing * s * (1 + kwing * cl * cl) +
                            // paradise drag of the fuselage
                            cdfuse * sfuse * (1 + kfuse * adeg) +
                            // parasite drag of other parts
                            cdpart * spart +
                            // induced drag of airfoil
                            cl * cl / (Math.PI * ar) * (1 + planformCorrection) * s;
                        return cds;
                    }
                ],
                [ // no F.3 in appendix
                ],
                [ // no F.4 in appendix
                ],
                [ // Appendix F.5
                    function (cdwing, s, cdfuse, sfuse, cdpart, spart) {
                        var ap = cdwing * s + cdfuse * sfuse + cdpart * spart;
                        return ap;
                    }
                ],
                [ // Appendix F.6
                    function (ar) {
                        var liftSlopePerDegree = 0.110, // from figure H.3
                            dcl_dadeg = liftSlopePerDegree * ar / (ar + 3);
                        return dcl_dadeg;
                    }
                ],
                [ // Appendix F.7
                    function (dcl, dcl_dadeg, adeg) {
                        var cl = dcl / dcl_dadeg * adeg;
                        return cl;
                    }
                ],
                [ // Appendix F.8
                    function (planformCorrection, ar, cdwing, kwing) {
                        var invew = (1 + planformCorrection) + Math.PI * ar * cdwing * kwing; // 1/ew
                        return invew;
                    },
                    function (cdfuse, kfuse, ar, sfuse, s) {
                        var invefuse = Math.PI * cdfuse * kfuse * Math.pow(ar + 3, 2) / (0.12 * ar) * sfuse / s; // 1/efuse
                        // 1.6 * 9/q.s * (0.012*q.ar*q.s)/(Math.pow(q.ar+3, 2) * 9)/ Math.PI / 0.005 = 0.095
                        return invefuse;
                    },
                    function (planformCorrection, invew, invefuse) {
                        var inve = invew + invefuse;
                        return inve;
                    }
                ],
                [
                    function (d_inve_fuse, sfuse, s) {
                        var e_factor = d_inve_fuse / (sfuse / s);
                        return e;
                    },
                    function (e, sfuse, s) {
                        var d_inve_fuse = e_factor * (sfuse / s);
                        return d_inve_fuse;
                    },
                    function (e, d_inve_fuse, s) {
                        var sfuse = d_inve_fuse * s / e_factor;
                        return sfuse;
                    },
                    function (e, d_inve_fuse, sfuse) {
                        var s = e_factor * sfuse / d_inve_fuse;
                        return s;
                    },
                    function (ar, s) {
                        var dr = 1,
                            cl = 1.53,
                            v = 67,
                            wing_load_lb_ft = dr * cl * v * v * dynamic_mph_pressure,
                            wingArea = perf.gross_lb / wing_load_lb_ft,
                            test = (1.6 * 9 / s) / (9 / s);
                        return test;
                    }
                ]
            ]
        };
    return {
        formulas: formulas,
        appendicies: appendicies
    };
}());

var aircraftFormulas = (function (Solver, data) {
    'use strict';

    function dummyFunc(dummy) {
        return dummy;
    }

    var solverFormulas = [
        dummyFunc
    ],
        formulas = data.formulas,
        appendicies = data.appendicies;

    formulas.forEach(function (formulaGroup) {
        solverFormulas.push(new Solver(formulaGroup));
    });
    Object.keys(appendicies).forEach(function (appKey) {
        appendicies[appKey].unshift(dummyFunc);

        var appendix = appendicies[appKey];
        solverFormulas[appKey] = [];
        appendix.forEach(function (appendixGroup) {
            solverFormulas[appKey].push(new Solver(appendixGroup));
        });
    });

    solverFormulas.all = solverFormulas.reduce(function (prev, next) {
        if (next.all) {
            [].push.apply(prev, next.all);
        }
        return prev;
    }, []);

    return solverFormulas;
}(Solver, formulas));
