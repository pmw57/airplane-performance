/*jslint browser:true */
/*global aircraftFormulas, CONSTANTS, solvePoly, aircraftSolver, Solver,
    relation, google */

(function (aircraftFormulas) {
    "use strict";
    var formulas = aircraftFormulas(CONSTANTS, solvePoly);
    var solvedFormulas = aircraftSolver(Solver, formulas);

    var constants = {};
    var defaults = {};
    var craft = {
        thorp: {
            name: "Thorp T-18 (Default)",
            h: 0,
            // vs0 = (vs1, clmax, clmaxf) => vs1 * sqrt(clmax / clmaxf)
            // vs1 = (vs0, clmaxf, clmax) => vs0 * sqrt(clmaxf / clmax)
            vs1: 67.00,
            b: 20 + 10 / 12,
            clmax: 1.52,
            clmaxf: 2.10,
            w: 1506.00,
            we: 900.00,
            bhp: 150.00,
            vmax: 180.00,
            dp: 6,
            rpm: 2700.00,
            eta: 85 / 100,
            wing_shape: "rectangular",
            // fuselage_shape: "rectangular",
            sfuse: 3 * 3,
            ad: 3
        },
        henry: {
            name: "Henry's aircraft",
            h: 0,
            vs1: 30.00,
            clmax: 1.53,
            clmaxf: 1.53,
            w: 420,
            wu: 240,
            b: 14,
            bhp: 60.00,
            vmax: 180.00,
            dp: 5.5,
            rpm: 2900.00,
            eta: 82 / 100,
            wing_shape: "tapered",
            // fuselage_shape: "rectangular",
            sfuse: 3 * 3
        }
    };
    var rounding = {
        fixed: {
            ws: 3,
            vs0: 1,
            vs1: 1,
            cl: 2,
            we: 0,
            s: 1,
            b: 2,
            ar: 2,
            c: 2,
            ewing: 2,
            efuse: 2,
            e: 3,
            ear: 2,
            ce: 2,
            be: 2,
            wbe: 2,
            ad: 2,
            thpa: 1,
            cd0: 4,
            vmins: 1,
            dmin: 1,
            thpmin: 2,
            rsmin: 1,
            rs: 1,
            rc: 1,
            ldmax: 2,
            clmins: 2,
            vprop: 1,
            ts: 1,
            mp: 4
        }
    };
    var data = craft.thorp;
    var results = {};
    var form = document.querySelector(".perf");
    var checkbox = {};

    function fixed(fieldName) {
        var checkboxSelector = "[type=checkbox][rel=" + fieldName + "]";
        var el = form.querySelector(checkboxSelector) || {};
        return el.checked;
    }

    function calculateQuantities(data, form) {
        data.f = defaults.temperature_sealevel_f;

        // TODO
        // Have the solver search all formulas for a potential solution
        const props = [
            {field: "sigma", relation: 0, part: 0},
            {field: "vs0", relation: 1, part: 0},
            {field: "ws", relation: 1, part: 1},
            {field: "clmaxv", relation: 1, part: 0},
            {field: "wu", relation: 2, part: 0},
            {field: "s", relation: 2, part: 0},
            {field: "ar", relation: 2, part: 1},
            {field: "c", relation: 3, part: 1},
            {field: "e", relation: 3, part: 2},
            {field: "ew", relation: 3, part: 0},
            {field: "ear", relation: 3, part: 3},
            {field: "ce", relation: 3, part: 4},
            {field: "be", relation: 4, part: 0},
            {field: "wbe", relation: 4, part: 1},
            {field: "thpa", relation: 5, part: 0},
            // {field: "cd0", relation: 6, part: 0},
            // {field: "vmins", relation: 7, part: 0},
            // {field: "dmin", relation: 7, part: 1},
            // {field: "thpmin", relation: 7, part: 2},
            // {field: "rsmin", relation: 8, part: 0},
            // {field: "rs", relation: 8, part: 1},
            // {field: "rc", relation: 8, part: 2},
            // {field: "ldmax", relation: 9, part: 0},
            // {field: "clmins", relation: 10, part: 0},
            // {field: "vprop", relation: 12, part: 0},
            // {field: "ts", relation: 12, part: 1},
            // {field: "mp", relation: 13, part: 0},
            // {field: "cl", relation: 1, part: 0}
        ];
        props.forEach(function (calc) {
            var formula = relation[calc.relation][calc.part];
            var field = calc.field;
            if (!fixed(field, form)) {
                data[field] = formula.solve(data)[field];
                console.log(field, data[field]);
            }
        });

        return data;
    }

    function nextDeltaAirspeed_alt(v, vel_step, vNext) {
        if (vNext) {
            v = Math.max(v, vNext);
        }

        return Math.floor((v + vel_step) / vel_step) * vel_step;
    }

    function finalAirspeed(v, vel_step, rc2, rc1) {
        var final = v - vel_step * rc2 / (rc2 - rc1);
        return final;
    }

    function sinkRate(airspeed, minimum_sink_rate_airspeed, rsmin) {
        var dimensionless_airspeed = airspeed / minimum_sink_rate_airspeed;
        var dimensionless_sink = (1 / 4) *
            (Math.pow(dimensionless_airspeed, 4) + 3) / dimensionless_airspeed;

        return dimensionless_sink * rsmin;
    }

    function calculateStats(v, data) {
        var vhat = v / data.vprop;
        var temperature_f = defaults.temperature_sealevel_f;
        var mu = solvedFormulas.i[1](temperature_f);
        var density_ratio = solvedFormulas.d[12].sigma(data.h, temperature_f);
        var air_density = solvedFormulas.j[1].rho(density_ratio);
        var rec = solvedFormulas.i[1].rel(air_density, v, mu, data.c);
        var rs = sinkRate(v, data.vmins, data.rsmin);
        var eta = solvedFormulas[54](vhat) * data.eta;
        var rc = data.rc * eta - rs;
        return {v: v, rc: rc, eta: eta, rs: rs, rec: rec};
    }

    function getrcmax(stats) {
        return stats.reduce(function (prev, next) {
            return Math.max(prev, next.rc);
        }, 0);
    }

    function performanceParameter(v, stats, wu, bhp, vs0) {
        var factor = constants.convert.ft_lb_min_to_horsepower;

        return (getrcmax(stats) * wu) / (factor * bhp) * (1 - (vs0 / v));
    }

    function kineticEnergyParameter(v, w) {
        return w * Math.pow(v, 2);
    }

    function clearResults() {
        var table = document.getElementById("results");

        table.tBodies[0].innerHTML = "";
    }

    function insertCell(row, value) {
        var content = document.createTextNode(value);

        row.insertCell(-1).appendChild(content);
    }

    function addNewResult(stats) {
        var table = document.getElementById("results");
        var row = table.tBodies[0].insertRow(-1);

        insertCell(row, stats.v.toFixed(1));
        insertCell(row, stats.rc.toFixed(1));
        insertCell(row, stats.eta.toFixed(4));
        insertCell(row, stats.rs.toFixed(1));
        insertCell(row, stats.rec.toFixed(0));
    }

    function formatValue(data, key) {
        var value = data[key];

        if (rounding.fixed[key]) {
            value = value.toFixed(rounding.fixed[key]);
        }

        return value;
    }

    function getFieldsFromCheckboxes(checkboxes) {
        var fields = [];

        Array.prototype.forEach.call(checkboxes, function (checkbox) {
            var fieldName = checkbox.getAttribute("rel");

            fields.push(form.elements[fieldName]);
        });

        return fields;
    }

    function getCheckedFields(form) {
        var checked = form.querySelectorAll("[type=checkbox]:checked");
        return getFieldsFromCheckboxes(checked);
    }
    function getUncheckedFields(form) {
        var unchecked = form.querySelectorAll("[type=checkbox]:not(:checked)");
        return getFieldsFromCheckboxes(unchecked);
    }

    function updatePerformance(data, form) {
        var fields = getCheckedFields(form);

        fields.forEach(function (field) {
            var fieldName = field.name || field.id;
            var value = formatValue(data, fieldName);
            field.value = value;
            field.disabled = false;
        });
    }

    function updateQuantities(data, form) {
        var fields = getUncheckedFields(form);

        fields.forEach(function (field) {
            var fieldName = field.name || field.id;
            if (!data[fieldName]) {
                return;
            }
            var value = formatValue(data, fieldName);
            field.value = value;
            field.disabled = true;
        });
    }

    function updateResults(results) {
        var calculated = results.calculated;
        var fp = document.getElementById("fp");
        var wv2 = document.getElementById("wv2");
        clearResults();
        calculated.forEach(function (result) {
            addNewResult(result);
        });
        fp.innerHTML = results.summaries.fp.toFixed(4);
        wv2.innerHTML = results.summaries.wv2.toFixed(2);

    }

    function drawChart(chartData, config, targetId) {
        var target = document.getElementById(targetId);
        var dataTable = google.visualization.arrayToDataTable(chartData);
        var ac = new google.visualization.LineChart(target);
        ac.draw(dataTable, config);
    }

    function drawAirspeedPerformance(results, target) {
        var calculatedResults = results.calculated;
        var chartData = [
            ["Airspeed", "Rate of Climb", "Prop Efficiency (*1,000)", "Sink Rate", "Reynolds No. (/10,000)"]
        ];

        calculatedResults.forEach(function (result) {
            chartData.push([
                result.v,
                result.rc,
                result.eta * 1000,
                result.rs,
                result.rec / 10000
            ]);
        });

        var config = {
            title : "Performance metrics based on Airspeed",
            curveType: "none",
            width: 600,
            height: 400,
            focusTarget: "category",
            hAxis: {
                title: "Airspeed, V (mph)"
            },
            vAxis: {
                title: "rc, eta, rs, rec"
            }
        };
        drawChart(chartData, config, target);
    }

    function updateCharts(results) {
        drawAirspeedPerformance(results, "airspeedperformance");
    }

    function calculateResults(data) {
        var v = data.vs1;
        var vel_step = defaults.vel_step;
        var stats = {};
        var rc_last;
        var calculated = [];
        var summaries = {};

        // initial airspeed
        stats = calculateStats(v, data);

        // subsequent airspeeds
        do {
            calculated.push(stats);
            v = nextDeltaAirspeed_alt(v, vel_step, data.vs1);
            stats = calculateStats(v, data);
        } while (stats.rc > 0);

        // final airspeed
        rc_last = calculated[calculated.length - 1].rc || 0;
        v = finalAirspeed(v, vel_step, stats.rc, rc_last);
        stats = calculateStats(v, data);
        calculated.push(stats);

        summaries = {
            fp: performanceParameter(
                v, calculated, data.wu, data.bhp, data.vs0
            ),
            wv2: kineticEnergyParameter(v, data.w)
        };

        return {
            calculated: calculated,
            summaries: summaries
        };
    }

    function main(data, form) {
        data = calculateQuantities(data, form);
        window.d = data;
        updatePerformance(data, form);
        updateQuantities(data, form);

        defaults.vel_step = 10;
        results = calculateResults(data);
        updateResults(results);

        defaults.vel_step = 1;
        results = calculateResults(data);
        updateCharts(results);
    }

    function getElementValue(el) {
        var value = el.value;

        if (el.getAttribute("type") === "text") {
            value = value || "";
        }
        if (el.getAttribute("type") === "number") {
            value = Number(value) || 0;
        }

        return value;
    }

    function checkedFormElements(form) {
        var elements = getCheckedFields(form);
        var checkedFields = {};
        elements.forEach(function (el) {
            checkedFields[el.name] = getElementValue(el);
        });
        return checkedFields;
    }

    function checkOther() {
        var select = this;
        var option = select.options[select.selectedIndex];
        var field = form.elements[select.getAttribute("rel")];
        const selector = "input[rel=" + select.getAttribute("rel") + "]";
        if (option.value === "other") {
            field.removeAttribute("disabled");
            checkbox.enable(document.querySelector(selector));
        } else {
            field.setAttribute("disabled", "disabled");
            checkbox.disable(document.querySelector(selector));
        }
    }

    checkbox = {
        enable: function (checkbox) {
            checkbox.checked = true;
        },
        disable: function (checkbox) {
            checkbox.checked = false;
        },
        toggle: function (checkbox) {
            checkbox.checked = !checkbox.checked;
        }
    };

    document.querySelector("select[name=wing_shape]").onchange = checkOther;
    const efuse = document.querySelector("select[name=efuse]");
    if (efuse) {
        efuse.onchange = checkOther;
    }
    document.querySelector(".perf").onsubmit = function () {
        data = checkedFormElements(form);
        main(data, form);
        form.currentCraft = form.elements.name.value;
        return false;
    };
    document.querySelector(".perf").onchange = function () {
        this.onsubmit();
    };
    document.querySelector(".showall").onclick = function (evt) {
        evt = evt || window.event;
        var targ = evt.target || evt.srcElement;
        var showAll = this.querySelector("input");
        var allCheckboxes = document.querySelectorAll(
            ".perf input[type=checkbox]");

        if (targ.nodeName !== "INPUT") {
            checkbox.toggle(showAll);
        }
        Array.prototype.forEach.call(allCheckboxes, function (checkbox) {
            if (showAll.checked) {
                checkbox.classList.add("active");
            } else {
                checkbox.classList.remove("active");
            }
        });
    };

    defaults = {
        temperature_sealevel_f: 58.7,
        eta: 80 / 100, // 80% estimate
        vel_step: 10.00, // airspeed increment for each iteration
        showAll: true
    };
    constants = {
        convert: {
            mph_to_fpm: 5280 / 60,
            // 1 horsepower = 550 foot pounds per second
            ft_lb_min_to_horsepower: 550 * 60
        }
    };

    function upto(target, from) {
        var el = from.parentNode;
        while (el.nodeName !== "BODY" && el.nodeName !== target) {
            el = el.parentNode;
        }
        return el;
    }

    function setDefaultCheckbox(data, form) {
        var key;
        var el;
        var p;
        for (key in data) {
            if (data.hasOwnProperty(key)) {
                el = form.elements[key];
                p = upto("P", el);
                el = p.querySelector("[type=checkbox]");
                if (el) {
                    checkbox.enable(el);
                }
            }
        }
    }

    if (!!document.querySelector(".showall").checked !== defaults.showAll) {
        document.querySelector(".showall").click();
    }

    setDefaultCheckbox(data, form);
    main(data, form);
}(window.aircraftFormulas));
