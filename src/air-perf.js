/*jslint browser:true */
/*globals aircraftFormulas, relation, google */

/*
    --------------------------------------------------------------------
    PROGRAM: index.html Ver: 1.0 Rev: 03/01/2010
    DESCRIPTION: www.neatinfo.com main menu
    BY: Jan Zumwalt - www.zoomaviation.com
    --------------------------------------------------------------------
    COMMENTS: Practical calculation of aircraft performance
    Compiled and ran on the free Pellec C compiler
    http://www.smorgasbordet.com/pellesc/
    --------------------------------------------------------------------
    Ver info:
    V1.3 users will note slight variations in output compared to the basic
    version of this program due to different round off error in math
    packages.
*/

(function (aircraftFormulas) {
    'use strict';

    var constants = {},
        defaults = {},
        planes = {
            thorp: {
                name: "Thorp T-18 (Default)",
                vs1: 67.00, // VS1
                clmax: 1.53,
                clmaxf: 2.10,
                w: 1500.00,
                wu: 600.00,
                b: 20.833,
                bhp: 150.00,
                vmax: 180.00,
                dpin: 6 * 12,
                dp: 6,
                rpm: 2700.00,
                eta: 85 / 100, // %
                cdmin: 0.005, // between lift coefficient 0.1 to 0.6
                aerodynamic_centre: 0.271,
                shape: {
                    wing: 'rectangular',
                    fuselage: 'rectangular'
                },
                sfuse: 3 * 3 // fuselage area estimate
            },
            henry: {
                name: "Henry's aircraft",
                vs1: 30.00, // VS1
                clmax: 1.53,
                clmaxf: 1.53,
                w: 420,
                wu: 240,
                b: 14,
                bhp: 60.00,
                vmax: 180.00,
                dpin: 4.5 * 12,
                dp: 5.5,
                rpm: 2900.00,
                eta: 82 / 100, // %
                cdmin: 0.006, // between lift coefficient 0.1 to 0.6
                aerodynamic_centre: 0.271
            },
        },
        data = planes.thorp,
        results = {},
        estimate = false;

    // end of user editable custom variables

    // Power Required relationships
    function liftToDragMinimumSink(vel_sink_min_ft, rate_sink_min_ft) {
        var mph_to_fpm = constants.convert.mph_to_fpm;

        return mph_to_fpm * vel_sink_min_ft / rate_sink_min_ft;
    }
    function liftToDragRatioVariation(vel_sink_min_ft, rate_sink_min_ft, maximum_lift_to_drag_ratio) {
        // (L/D)max = 101.6 VminS/RSmin

        // VminS = √391/(3π)^(1/4) √(W/be)/(√σ AD^(1/4)) (mph)
        // RSmin = 5280/60 √391 4/(3π)^(3/4) √(W/σ) AD^(1/4)/be^(3/2) (ft/min)
        // (L/D)max = (√π be) / 2√(AD)

        // LDminS = 5280/60 VminS/RSmin 
        // LDminS = √3π/4 be/√AD
        // LDminS/(L/D)max = √3π/4 be/√AD * 2/√π √AD/be
        //                 = 2√3/4 √π/√π be/be √AD/√AD
        //                 = √3/2
        // (L/D)max = 2/√3 5280/60 VminS/RSmin

        var constant = (estimate ? 101.6 : constants.maximumLiftToDragRatio_check),
            maximum_lift_to_drag_ratio_check;

        if (!constant) {
            constant = 2 / Math.sqrt(3) * constants.convert.mph_to_fpm;
            constants.maximumLiftToDragRatio_check = constant;
        }

        maximum_lift_to_drag_ratio_check = constant * vel_sink_min_ft / rate_sink_min_ft;

        return maximum_lift_to_drag_ratio_check - maximum_lift_to_drag_ratio;
    }

    function liftCoefficientMinimumSinkVariation(aspect_ratio_effective, cd_drag, cl_min_sink) {
        // CL,minS = 3.07 sqrt(eAR CD,0)
        var constant = (estimate ? 3.07 : constants.liftCoefficientMinimumSinkVariation),
            lift_coefficient_minimum_sink_variation;

        if (!constant) {
            constant = Math.sqrt(3 * Math.PI);
            constants.liftCoefficientMinimumSinkVariation = constant;
        }

        lift_coefficient_minimum_sink_variation = constant * Math.sqrt(aspect_ratio_effective * cd_drag);

        return lift_coefficient_minimum_sink_variation - cl_min_sink;
    }
    function liftToDragRatioVariation2(aspect_ratio_effective, cd_drag, maximum_lift_to_drag_ratio) {
        var constant = (estimate ? 0.886 : constants.liftToDragRatioVariation2),
            lift_to_drag_ratioVariation_2;

        if (!constant) {
            constant = Math.sqrt(Math.PI) / 2;
            constants.liftToDragRatioVariation2 = constant;
        }

        lift_to_drag_ratioVariation_2 = constant * Math.sqrt(aspect_ratio_effective / cd_drag);

        return lift_to_drag_ratioVariation_2 - maximum_lift_to_drag_ratio;
    }

    function liftToDragRatioVariation3(maximum_lift_to_drag_ratio, drag_min, w) {
        return maximum_lift_to_drag_ratio - w / drag_min;
    }
    function minimumGlideAngle(maximum_lift_to_drag_ratio) {
        return 360 / Math.TAU / maximum_lift_to_drag_ratio;
    }

    function calculateQuantities(data) {
        var density_ratio = relation[0].sigma(defaults.altitude_ft, defaults.temperature_sealevel_f);

        // Power required relationships
        data.wing_load_lb_ft = relation[1].ws(density_ratio, data.clmax, data.vs1);
        data.vel_stall_flaps_mph = relation[1].v(data.wing_load_lb_ft, density_ratio, data.clmaxf); // VS0
        data.max_speed_lift_coefficient = relation[1].cl(data.wing_load_lb_ft, density_ratio, data.vmax);
        // Relation 2
        data.wing_area_ft = relation[2][0].s(data.wing_load_lb_ft, data.w);
        data.aspect_ratio = relation[2][1].solve({b: data.b, s: data.wing_area_ft}).ar;
        // Relation 3
        data.wing_chord_ft = relation[3][0].c(data.aspect_ratio, data.b);
        data.wing_efficiency = relation[3][1].wingEfficiencyFactor(data.aspect_ratio)[data.shape.wing];
        data.wing_efficiency_factor = relation[3][1].solve({e: data.wing_efficiency}).inve;
        data.fuselage_effect = relation[3][1].dragDependenceEffect(data.aspect_ratio)[data.shape.fuselage];
        data.fuselage_efficiency_factor = relation[3][1].solve({fuselageCorrection: data.fuselage_effect, sfuse: data.sfuse, s: data.wing_area_ft}).invefuse;
        data.plane_efficiency_factor = relation[3][1].solve({invew: data.wing_efficiency_factor, invefuse: data.fuselage_efficiency_factor}).inve;
        data.plane_efficiency = relation[3][1].solve({inve: data.plane_efficiency_factor}).e;
        data.aspect_ratio_effective = relation[3][2].solve({ar: data.aspect_ratio, e: data.plane_efficiency}).ear;
        // Relation 4
        data.wing_chord_effective = relation[4][0].solve({c: data.wing_chord_ft, e: data.plane_efficiency}).ce;
        data.wing_span_effective = relation[4][1].solve({b: data.b, e: data.plane_efficiency}).be;
        data.wing_load_effective = relation[4][2].solve({w: data.w, be: data.wing_span_effective}).wbe;
        // Relation 5
        data.drag_area_ft = relation[5][0].solve({vmax: data.vmax, thpa: data.bhp * data.eta, sigma: density_ratio}).ad;
        data.available_thrust_horsepower = relation[5][0].solve({ad: data.drag_area_ft, vmax: data.vmax, sigma: density_ratio}).thpa;
        // Relation 6
        data.cd_drag = relation[6][0].solve({ad: data.drag_area_ft, s: data.wing_area_ft}).cd0;
        // Relation 7
        data.vel_sink_min_ft = relation[7][0].vmins(data.w, data.wing_span_effective, density_ratio, data.drag_area_ft);
        data.drag_min = relation[7][1].dmin(data.drag_area_ft, data.w, data.wing_span_effective);
        data.pwr_min_req_hp = relation[7][2].thpmin(data.drag_area_ft, 1, data.w, data.wing_span_effective);
        // Relation 8
        data.rate_sink_min_ft = relation[8][0].rsmin(data.w, density_ratio, data.drag_area_ft, data.wing_span_effective);
        // Relation 9
        data.maximum_lift_to_drag_ratio = relation[9][0].ldmax(data.wing_span_effective, data.drag_area_ft);
        // Relation 10
        data.cl_min_sink = relation[10][0].clmins(data.drag_area_ft, data.wing_chord_effective);

        // Power available relationships
        // Relation 11
        data.rate_climb_ideal = relation[11][0].rc(data.bhp, data.w, 1, 0);
        // Relation 12
        data.prop_vel_ref = relation[12][0].vprop(data.bhp, density_ratio, data.dp);
        data.static_thrust_ideal = relation[12][1].ts(density_ratio, data.dp, data.bhp);
        // Relation 13
        data.prop_tip_mach = relation[13][0].mp(data.rpm, data.dp);

        // Cross checks
        // Relation 14
        data.lift_to_drag_min_sink = liftToDragMinimumSink(data.vel_sink_min_ft, data.rate_sink_min_ft);
        data.lift_to_drag_ratio_variation = liftToDragRatioVariation(data.vel_sink_min_ft, data.rate_sink_min_ft, data.maximum_lift_to_drag_ratio);
        // Relation 15
        data.lift_coefficient_minimum_sink_variation = liftCoefficientMinimumSinkVariation(data.aspect_ratio_effective, data.cd_drag, data.cl_min_sink);
        data.lift_to_drag_ratio_variation_2 = liftToDragRatioVariation2(data.aspect_ratio_effective, data.cd_drag, data.maximum_lift_to_drag_ratio);
        data.lift_to_drag_ratio_variation_3 = liftToDragRatioVariation3(data.maximum_lift_to_drag_ratio, data.drag_min, data.w);
        // Relation 16
        data.minimum_glide_angle = minimumGlideAngle(data.maximum_lift_to_drag_ratio);

        return data;
    }

    function nextDeltaAirspeed_alt(v, vel_delta, vs1) {
        if (vs1) {
            v = Math.max(v, vs1);
        }

        return Math.floor((v + vel_delta) / vel_delta) * vel_delta;
    }

    function finalAirspeed(v, vel_delta, rc2, rc1) {
        return v - vel_delta * rc2 / (rc2 - rc1);
    }

    function sinkRate(airspeed, minimum_sink_rate_airspeed, rate_sink_min_ft) {
        var dimensionless_airspeed = airspeed / minimum_sink_rate_airspeed,
            dimensionless_sink = (1 / 4) * (Math.pow(dimensionless_airspeed, 4) + 3) / dimensionless_airspeed;

        return dimensionless_sink * rate_sink_min_ft;
    }

    function calculateStats(v, data) {
        var vhat = v / data.prop_vel_ref,
            temperature_f = defaults.temperature_sealevel_f,
            mu = aircraftFormulas.i[1](temperature_f),
            density_ratio = aircraftFormulas.d[12].sigma(defaults.altitude_ft, temperature_f),
            air_density = aircraftFormulas.j[1].rho(density_ratio),
            rec = aircraftFormulas.i[1].rel(air_density, v, mu, data.wing_chord_ft),
            rs = sinkRate(v, data.vel_sink_min_ft, data.rate_sink_min_ft),
            eta = aircraftFormulas[54](vhat) * data.eta,
            rc = data.rate_climb_ideal * eta - rs;
        return {v: v, rc: rc, eta: eta, rs: rs, rec: rec};
    }

    function getrcmax(stats) {
        return stats.reduce(function (prev, next) {
            return Math.max(prev, next.rc);
        }, 0);
    }

    function performanceParameter(v, stats, wu, bhp, vel_stall_flaps_mph) {
        var constant = constants.convert.ft_lb_min_to_horsepower;

        return (getrcmax(stats) * wu) / (constant * bhp) * (1 - (vel_stall_flaps_mph / v));
    }

    function kineticEnergyParameter(v, w) {
        return w * Math.pow(v, 2);
    }

    function clearResults() {
        var table = document.getElementById('results');

        table.tBodies[0].innerHTML = "";
    }

    function insertCell(row, value) {
        var content = document.createTextNode(value);

        row.insertCell(-1).appendChild(content);
    }

    function addNewResult(stats) {
        var table = document.getElementById('results'),
            row = table.tBodies[0].insertRow(-1);

        insertCell(row, stats.v.toFixed(1));
        insertCell(row, stats.rc.toFixed(1));
        insertCell(row, stats.eta.toFixed(4));
        insertCell(row, stats.rs.toFixed(1));
        insertCell(row, stats.rec.toFixed(0));
    }

    function updatePerformance(perf) {
        var form = document.getElementById('perf');

        form.elements.name.value = perf.name;

        form.elements.vs1.value = perf.vs1.toFixed(1);
        form.elements.clmax.value = perf.clmax.toFixed(3);
        form.elements.clmaxf.value = perf.clmaxf.toFixed(3);
        form.elements.w.value = perf.w.toFixed(0);
        form.elements.wu.value = perf.wu.toFixed(0);
        form.elements.b.value = perf.b.toFixed(2);
        form.elements.bhp.value = perf.bhp.toFixed(0);
        form.elements.vmax.value = perf.vmax.toFixed(1);
        form.elements.dpin.value = perf.dpin.toFixed(1);
        form.elements.rpm.value = perf.rpm.toFixed(0);
        form.elements.eta.value = perf.eta.toFixed(2);
        form.elements.cdmin.value = perf.cdmin.toFixed(3);
        form.elements.aerodynamic_centre.value = perf.aerodynamic_centre.toFixed(3);
        form.elements.sfuse.value = perf.sfuse.toFixed(3);
        form.elements.altitude_ft.value = defaults.altitude_ft.toFixed(0);
    }

    function updateQuantities(data) {
        document.getElementById('wing_load_lb_ft').innerHTML = data.wing_load_lb_ft.toFixed(3);
        document.getElementById('vel_stall_flaps_mph').innerHTML = data.vel_stall_flaps_mph.toFixed(1);
        document.getElementById('max_speed_lift_coefficient').innerHTML = data.max_speed_lift_coefficient.toFixed(2);
        document.getElementById('wing_area_ft').innerHTML = data.wing_area_ft.toFixed(1);
        document.getElementById('aspect_ratio').innerHTML = data.aspect_ratio.toFixed(2);
        document.getElementById('wing_chord_ft').innerHTML = data.wing_chord_ft.toFixed(2);
        document.getElementById('aspect_ratio_effective').innerHTML = data.aspect_ratio_effective.toFixed(2);
        document.getElementById('plane_efficiency').innerHTML = data.plane_efficiency.toFixed(3);
        document.getElementById('wing_span_effective').innerHTML = data.wing_span_effective.toFixed(2);
        document.getElementById('wing_chord_effective').innerHTML = data.wing_chord_effective.toFixed(2);
        document.getElementById('wing_load_effective').innerHTML = data.wing_load_effective.toFixed(2);
        document.getElementById('drag_area_ft').innerHTML = data.drag_area_ft.toFixed(2);
        document.getElementById('cd_drag').innerHTML = data.cd_drag.toFixed(4);
        document.getElementById('vel_sink_min_ft').innerHTML = data.vel_sink_min_ft.toFixed(1);
        document.getElementById('pwr_min_req_hp').innerHTML = data.pwr_min_req_hp.toFixed(2);
        document.getElementById('available_thrust_horsepower').innerHTML = data.available_thrust_horsepower.toFixed(1);
        document.getElementById('drag_min').innerHTML = data.drag_min.toFixed(1);
        document.getElementById('rate_sink_min_ft').innerHTML = data.rate_sink_min_ft.toFixed(1);
        document.getElementById('maximum_lift_to_drag_ratio').innerHTML = data.maximum_lift_to_drag_ratio.toFixed(2);
        document.getElementById('cl_min_sink').innerHTML = data.cl_min_sink.toFixed(2);
        document.getElementById('rate_climb_ideal').innerHTML = data.rate_climb_ideal.toFixed(1);
        document.getElementById('prop_vel_ref').innerHTML = data.prop_vel_ref.toFixed(1);
        document.getElementById('static_thrust_ideal').innerHTML = data.static_thrust_ideal.toFixed(1);
        document.getElementById('prop_tip_mach').innerHTML = data.prop_tip_mach.toFixed(4);
        document.getElementById('lift_to_drag_min_sink').innerHTML = data.lift_to_drag_min_sink.toFixed(1);
        document.getElementById('lift_to_drag_ratio_variation').innerHTML = data.lift_to_drag_ratio_variation;
        document.getElementById('lift_coefficient_minimum_sink_variation').innerHTML = data.lift_coefficient_minimum_sink_variation;
        document.getElementById('lift_to_drag_ratio_variation_2').innerHTML = data.lift_to_drag_ratio_variation_2;
        document.getElementById('lift_to_drag_ratio_variation_3').innerHTML = data.lift_to_drag_ratio_variation_3;
        document.getElementById('minimum_glide_angle').innerHTML = data.minimum_glide_angle;
    }

    function updateResults(results) {
        var calculated = results.calculated,
            i;
        clearResults();
        for (i = 0; i < calculated.length; i += 1) {
            addNewResult(calculated[i]);
        }
        document.getElementById('fp').innerHTML = results.summaries.fp.toFixed(4);
        document.getElementById('wv2').innerHTML = results.summaries.wv2.toFixed(2);

    }

    function drawChart(chartData, config, target) {
        var dataTable = google.visualization.arrayToDataTable(chartData),
            ac = new google.visualization.LineChart(document.getElementById(target));
        ac.draw(dataTable, config);
    }

    function drawAirspeedPerformance(results, target) {
        var calculatedResults = results.calculated,
            chartData = [
                ['Airspeed', 'Rate of Climb', 'Prop Efficiency (*1,000)', 'Sink Rate', 'Reynolds No. (/10,000)']
            ],
            result,
            i,
            config;

        for (i = 0; i < calculatedResults.length; i += 1) {
            result = calculatedResults[i];
            chartData.push([
                result.v,
                result.rc,
                result.eta * 1000,
                result.rs,
                result.rec / 10000
            ]);
        }

        config = {
            title : 'Performance metrics based on Airspeed',
            curveType: 'none',
            width: 600,
            height: 400,
            focusTarget: 'category',
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
        drawAirspeedPerformance(results, 'airspeedperformance');
    }

    function calculateResults(data) {
        var v = data.vs1,
            vel_delta = defaults.vel_delta,
            stats = {},
            imax = false,
            rc = 0,
            rcold,
            calculated = [],
            summaries = {};

        do {
            rcold = stats.rc || rc;
            stats = calculateStats(v, data);
            if (stats.rc > 0) {
                calculated.push(stats);
                if (!imax) {
                    v = nextDeltaAirspeed_alt(v, vel_delta, data.vs1);
                }
            } else {
                v = finalAirspeed(v, vel_delta, stats.rc, rcold);
                imax = true;
            }
        } while (imax === false || stats.rc <= 0);

        summaries = {
            fp: performanceParameter(v, calculated, data.wu, data.bhp, data.vel_stall_flaps_mph),
            wv2: kineticEnergyParameter(v, data.w)
        };

        return {
            calculated: calculated,
            summaries: summaries
        };
    }

    function setDebugValues(data) {
        window.d = data;
    }

    function main(data) {
        data = calculateQuantities(data);

        setDebugValues(data);

        updatePerformance(data);
        updateQuantities(data);

        defaults.vel_delta = 10;
        results = calculateResults(data);
        updateResults(results);

        defaults.vel_delta = 1;
        results = calculateResults(data);
        updateCharts(results);
    }

    document.getElementById('perf').onsubmit = function () {
        var form = document.getElementById('perf'),
            perf = {};

        perf.name = form.elements.name.value || '';
        perf.vs1 = Number(form.elements.vs1.value) || 0;
        perf.clmax = Number(form.elements.clmax.value) || 0;
        perf.clmaxf = Number(form.elements.clmaxf.value) || 0;
        perf.w = Number(form.elements.w.value) || 0;
        perf.wu = Number(form.elements.wu.value) || 0;
        perf.b = Number(form.elements.b.value) || 0;
        perf.bhp = Number(form.elements.bhp.value) || 0;
        perf.vmax = Number(form.elements.vmax.value) || 0;
        perf.dpin = Number(form.elements.dpin.value) || 0;
        perf.dp = Number(form.elements.dpin.value / 12) || 0;
        perf.rpm = Number(form.elements.rpm.value) || 0;
        perf.eta = Number(form.elements.eta.value) || 0;
        perf.cdmin = Number(form.elements.cdmin.value) || 0;
        perf.aerodynamic_centre = Number(form.elements.aerodynamic_centre.value) || 0;
        perf.sfuse = Number(form.elements.sfuse.value) || 0;
        defaults.altitude_ft = Number(form.elements.altitude_ft.value) || 0;
        main(perf);
        return false;
    };
    document.getElementById('perf').onchange = function () {
        this.onsubmit();
    };

    defaults = {
        altitude_ft: 0.00,
        temperature_sealevel_f: 58.7,
        eta: 80 / 100, // 80% estimate
        vel_delta: 10.00 // airspeed increment for each iteration
    };
    constants = {};
    constants.convert = {
        mph_to_fps: 5280 / (60 * 60),
        mph_to_fpm: 5280 / 60,
        ft_lb_min_to_horsepower: 550 * 60 // 1 horsepower = 550 foot pounds per second
    };
    constants.average_sealevel_temperature = 58.7; // F
    constants.gravitational_constant = 32.1740; // ft/sec^2
    constants.fahrenheit_to_rankine = 459.67; // from absolute zero
    constants.temperature_lapse_rate = 0.00356; // Rankine per 1000 feet
    constants.universal_gas_constant = 1718; // ft^2/sec^2
    constants.air_density_slug = 0.002377;
    constants.air = {};
    constants.speed_of_sound = 1100; // feet per second
    constants.circumference_proportion = Math.TAU;
    // using a unit square of length 1, resulting in a radius of 0.5
    constants.square_length_of_circle_area = Math.sqrt(0.5 * Math.TAU * Math.pow(0.5, 2)); // using triangular area
    constants.dynamic_pressure_from_mph = 0.5 * constants.air_density_slug * Math.pow(constants.convert.mph_to_fps, 2);

    main(data);
}(window.aircraftFormulas));