const chart = (function () {
    "use strict";
    const polar = {
        roughness: function roughnessFromCl(cl) {
            if (cl < -0.5 || cl > 1.25) {
                return;
            }
            // curve matching formula, with no algebraic relevance to aircraft
            const a = 1.0237 * Math.pow(10, -2);
            const b = 1.5597 * Math.pow(10, -3);
            const c = 5.5449 * Math.pow(10, -1);
            const d = -7.5911 * Math.pow(10, -1);
            return (a + b * cl) / (1 + c * cl + d * cl * cl);
        },
        r3: function cdFromCl3(cl) {
            // curve matching formula, with no algebraic relevance to aircraft
            const a = 8.057 * Math.pow(10, -3);
            const b = -3.3885 * Math.pow(10, -3);
            const c = 5.8687 * Math.pow(10, -3);
            return a * cl * cl + b * cl + c;
        },
        r6: function cdFromCl6(cl) {
            // curve matching formula, with no algebraic relevance to aircraft
            const a = 5.9213 * Math.pow(10, -3);
            const b = -2.5207 * Math.pow(10, -3);
            const c = 5.3258 * Math.pow(10, -3);
            return a * cl * cl + b * cl + c;
        },
        r9: function cdFromCl9(cl) {
            // curve matching formula, with no algebraic relevance to aircraft
            const a = 5.0071 * Math.pow(10, -3);
            const b = -2.0292 * Math.pow(10, -3);
            const c = 5.2600 * Math.pow(10, -3);
            return a * cl * cl + b * cl + c;
        }
    };
    const ew = {
        tapered: function ewTaperFromAr(ar) {
            if (ar < 1) {
                return;
            }
            // curve matching formula, with no algebraic relevance to aircraft
            const a = 1.1991;
            const b = -1.0662;
            const c = -0.039331;
            const r = 0.59239;
            return a + b * Math.pow(r, ar) + c * ar;
        },
        rectangle: function ewRectFromAr(ar) {
            if (ar < 1) {
                return;
            }
            // curve matching formula, with no algebraic relevance to aircraft
            const a = 1.1258;
            const b = -1.1710;
            const c = -0.039159;
            const r = 0.56458;
            return a + b * Math.pow(r, ar) + c * ar;
        },
        delta: function ewDeltaFromAr(ar) {
            if (ar > 6) {
                return;
            }
            // curve matching formula, with no algebraic relevance to aircraft
            const alpha = 1.0001;
            const theta = -1.1702;
            const eta = 0.94288;
            const kappa = 3.0680;
            return alpha + (theta * Math.pow(ar, eta)) /
                    (Math.pow(kappa, eta) + Math.pow(ar, eta));
        }
    };
    const efuse = {
        rectangle: function invewRectFromAr(ar) {
            if (ar < 2 || ar > 14) {
                return;
            }
            // attempting to use a linear/log plot to use straight line solution
            return 1.15 * Math.pow(10, ar / 35);
            // curve matching formula, with no algebraic relevance to aircraft
            const a = -6.6814 * Math.pow(10, 4);
            const b = 5.8320 * Math.pow(10, 5);
            const c = 4.5374 * Math.pow(10, 5);
            const d = -1.8567 * Math.pow(10, 4);
            return (a + b * ar) / (1 + c * ar + d * Math.pow(ar, 2));
        },
        round: function invewRoundFromAr(ar) {
            if (ar < 2 || ar > 20) {
                return;
            }
            return 0.51 * Math.pow(10, ar / 43);
            // curve matching formula, with no algebraic relevance to aircraft
            const a = 5.3869 * Math.pow(10, -1);
            const b = 1.0628;
            const c = -5.9335 * Math.pow(10, -2);
            const y = a * Math.pow(b, ar) * Math.pow(ar, c);
            return y;
        }
    };
    return {
        polar,
        ew,
        efuse
    };
}());
