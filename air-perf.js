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
    V1.0 users will note slight variations in output compared to the basic
    version of this program due to different round off error in math
    packages.
*/

/*
    --------------------------------------------------------------------
    This section is user variables that can be customized to a particular
    aircraft. See The book for descriptions.
    --------------------------------------------------------------------
*/
window.altitude_ft = 0.00;
window.air_density_slug = 0.00237; // (sealevel)
window.pi = 3.14159; // Defines the value of Pi as fixed
window.vel_delta = 10.00; // airspeed increment for each iteration

var parameters = {
    name: "Thorp T-18 (Default)",
    vel_stall_clean_mph: 67.00, // VS1
    cl_max_clean: 1.53,
    cl_max_flap: 2.10,
    gross_lb: 1500.00,
    useful_load_lb: 600.00,
    wing_span_ft: 20.833,
    plane_efficiency: 0.744,
    bhp: 150.00,
    vel_max_mph: 180.00,
    prop_dia_in: 6 * 12,
    prop_dia_ft: 6,
    prop_max_rpm: 2700.00
};
// end of user editable custom variables

function calculateQuantities(perf) {
    var wing_load_lb_ft = perf.cl_max_clean * Math.pow(perf.vel_stall_clean_mph, 2) / 391,
        vel_stall_flaps_mph = Math.sqrt(wing_load_lb_ft * 391 / perf.cl_max_flap), // VS0
        wing_area_ft = perf.gross_lb / wing_load_lb_ft,
        wing_aspect = Math.pow(perf.wing_span_ft, 2) / wing_area_ft,
        wing_chord_ft = perf.wing_span_ft / wing_aspect,
        wing_span_effective = perf.wing_span_ft * Math.sqrt(perf.plane_efficiency),
        aspect_ratio_effective = wing_span_effective * wing_span_effective / wing_area_ft,
        wing_chord_effective = wing_area_ft / wing_span_effective,
        wing_load_effective = perf.gross_lb / wing_span_effective,
        drag_area_ft = 0.8 * perf.bhp * 146625 / Math.pow(perf.vel_max_mph, 3),
        cd_drag = drag_area_ft / wing_area_ft,
        vel_sink_min_ft = 11.29 * Math.sqrt(wing_load_effective) /Math.sqrt(Math.sqrt(drag_area_ft)),
        pwr_min_req_hp = 0.03922 * Math.sqrt( Math.sqrt(drag_area_ft)) * wing_load_effective *Math.sqrt(wing_load_effective),
        rate_sink_min_ft = 33000 * pwr_min_req_hp / perf.gross_lb,
        ld_max = 0.8862 * wing_span_effective / Math.sqrt(drag_area_ft),
        drag_min = perf.gross_lb / ld_max,
        cl_min_sink = 3.07 * Math.sqrt(drag_area_ft) / wing_chord_effective,
        rate_climb_ideal = 33000 * perf.bhp / perf.gross_lb,
        prop_tip_mach = perf.prop_max_rpm * perf.prop_dia_ft * 0.05236 / 1100,
        prop_vel_ref = 41.9 * Math.pow(perf.bhp / Math.pow(perf.prop_dia_ft, 2), 1 / 3),
        static_thrust_ideal = 10.41 * Math.pow(perf.bhp * perf.prop_dia_ft, 2 / 3);
    
    return {
        wing_load_lb_ft: wing_load_lb_ft,
        vel_stall_flaps_mph: vel_stall_flaps_mph,
        wing_area_ft: wing_area_ft,
        wing_aspect: wing_aspect,
        wing_chord_ft: wing_chord_ft,
        wing_span_effective: wing_span_effective,
        aspect_ratio_effective: aspect_ratio_effective,
        wing_chord_effective: wing_chord_effective,
        wing_load_effective: wing_load_effective,
        drag_area_ft: drag_area_ft,
        cd_drag: cd_drag,
        vel_sink_min_ft: vel_sink_min_ft,
        pwr_min_req_hp: pwr_min_req_hp,
        rate_sink_min_ft: rate_sink_min_ft,
        ld_max: ld_max,
        drag_min: drag_min,
        cl_min_sink: cl_min_sink,
        rate_climb_ideal: rate_climb_ideal,
        prop_tip_mach: prop_tip_mach,
        prop_vel_ref: prop_vel_ref,
        static_thrust_ideal: static_thrust_ideal
    };
}

function firstDeltaAirspeed(v, vel_delta, vel_stall_clean_mph) {
    v = 0;
    do {
        v = nextDeltaAirspeed(v, vel_delta);
    } while (v <= vel_stall_clean_mph);
    
    return v;
}

function nextDeltaAirspeed(v, vel_delta) {
    return v + vel_delta;
}

function finalAirspeed(v, vel_delta, rc2, rc1) {
    return v = v - vel_delta * rc2 / (rc2 - rc1);
}

function calculateStats(v, quantities) {
    var sig = Math.pow(1 - altitude_ft / 145800, 4.265),
        rmu = 1,
        t1 = 1 / 3,
        vh = v / quantities.vel_sink_min_ft,
        rsh = 0.25 * (Math.pow(vh, 4) + 3) / vh,
        rs = rsh * quantities.rate_sink_min_ft;
        vt = v / quantities.prop_vel_ref;
        t2 = Math.sqrt(1 + 0.23271 * Math.pow(vt, 3));
        eta = 0.92264 * vt * (Math.pow(1 + t2, t1) - Math.pow(t2 - 1, t1)) * 0.85;
        rec = sig * v * quantities.wing_chord_ft * 9324 / rmu;
        rc = quantities.rate_climb_ideal * eta - rs;

    return {v: v, rc: rc, eta: eta, rs: rs, rec: rec};
}

function getrcmax(stats) {
    var rcmax = 0,
        i;
    for (i = 0; i < stats.length; i += 1) {
        rcmax = Math.max(rcmax, stats[i].rc);
    }
    return rcmax;
}

function calculateSummaries(aircraft, v, stats) {
    var perf = aircraft.parameters,
        quantities = aircraft.quantities;

    return {
        fp: getrcmax(stats) * perf.useful_load_lb / 33000 / perf.bhp * (1 - (quantities.vel_stall_flaps_mph / v)),
        wv2: perf.gross_lb * Math.pow(v, 2)
    };
}

function clearResults() {
    var table = document.getElementById('results');
    var row = table.tBodies[0].innerHTML = "";
}

function insertCell(row, value) {
    var content = document.createTextNode(value);
    row.insertCell(-1).appendChild(content);
}

function addNewResult(stats) {
    var table = document.getElementById('results');
    var row = table.tBodies[0].insertRow(-1);
    insertCell(row, stats.v.toFixed(1));
    insertCell(row, stats.rc.toFixed(1));
    insertCell(row, stats.eta.toFixed(4));
    insertCell(row, stats.rs.toFixed(1));
    insertCell(row, stats.rec.toFixed(0));
}

function updateParameters(perf) {
    var form = document.getElementById('perf');
    form.elements.name.value = perf.name;
    form.elements.vel_stall_clean_mph.value = perf.vel_stall_clean_mph.toFixed(1);
    form.elements.cl_max_clean.value = perf.cl_max_clean.toFixed(3);
    form.elements.cl_max_flap.value = perf.cl_max_flap.toFixed(3);
    form.elements.gross_lb.value = perf.gross_lb.toFixed(0);
    form.elements.useful_load_lb.value = perf.useful_load_lb.toFixed(0);
    form.elements.wing_span_ft.value = perf.wing_span_ft.toFixed(2);
    form.elements.plane_efficiency.value = perf.plane_efficiency.toFixed(3);
    form.elements.bhp.value = perf.bhp.toFixed(0);
    form.elements.vel_max_mph.value = perf.vel_max_mph.toFixed(1);
    form.elements.prop_dia_in.value = perf.prop_dia_in.toFixed(1);
    form.elements.prop_max_rpm.value = perf.prop_max_rpm.toFixed(0);
    form.elements.altitude_ft.value = window.altitude_ft.toFixed(0);
}

document.getElementById('perf').onsubmit = function () {
    var perf = {};
    perf.name = form.elements.name.value;
    perf.bhp = form.elements.bhp.value;
    perf.wing_span_ft = form.elements.wing_span_ft.value;
    perf.prop_dia_ft = form.elements.prop_dia_ft.value;
    perf.prop_dia_in = form.elements.prop_dia_in.value;
    perf.wing_area = form.elements.wing_area.value;
    perf.empty_weight_lb = form.elements.empty_weight_lb.value;
    perf.gross_lb = form.elements.gross_lb.value;
    perf.vel_max_mph = form.elements.vel_max_mph.value;
    perf.vel_stall_clean_mph = form.elements.vel_stall_clean_mph.value;
    perf.rcmax = form.elements.rcmax.value;
    perf.useful_load_lb = form.elements.useful_load_lb.value;
    perf.prop_max_rpm = form.elements.prop_max_rpm.value;
    perf.plane_efficiency = form.elements.plane_efficiency.value;
    main(perf);
    return false;
};

function updateQuantities(quantities) {
    document.getElementById('wing_load_lb_ft').innerHTML = quantities.wing_load_lb_ft.toFixed(3);
    document.getElementById('vel_stall_flaps_mph').innerHTML = quantities.vel_stall_flaps_mph.toFixed(1);
    document.getElementById('wing_area_ft').innerHTML = quantities.wing_area_ft.toFixed(1);
    document.getElementById('wing_aspect').innerHTML = quantities.wing_aspect.toFixed(2);
    document.getElementById('wing_chord_ft').innerHTML = quantities.wing_chord_ft.toFixed(2);
    document.getElementById('aspect_ratio_effective').innerHTML = quantities.aspect_ratio_effective.toFixed(2);
    document.getElementById('wing_span_effective').innerHTML = quantities.wing_span_effective.toFixed(2);
    document.getElementById('wing_chord_effective').innerHTML = quantities.wing_chord_effective.toFixed(2);
    document.getElementById('wing_load_effective').innerHTML = quantities.wing_load_effective.toFixed(2);
    document.getElementById('drag_area_ft').innerHTML = quantities.drag_area_ft.toFixed(2);
    document.getElementById('cd_drag').innerHTML = quantities.cd_drag.toFixed(4);
    document.getElementById('vel_sink_min_ft').innerHTML = quantities.vel_sink_min_ft.toFixed(1);
    document.getElementById('pwr_min_req_hp').innerHTML = quantities.pwr_min_req_hp.toFixed(2);
    document.getElementById('drag_min').innerHTML = quantities.drag_min.toFixed(1);
    document.getElementById('rate_sink_min_ft').innerHTML = quantities.rate_sink_min_ft.toFixed(1);
    document.getElementById('ld_max').innerHTML = quantities.ld_max.toFixed(2);
    document.getElementById('cl_min_sink').innerHTML = quantities.cl_min_sink.toFixed(2);
    document.getElementById('rate_climb_ideal').innerHTML = quantities.rate_climb_ideal.toFixed(1);
    document.getElementById('prop_vel_ref').innerHTML = quantities.prop_vel_ref.toFixed(1);
    document.getElementById('static_thrust_ideal').innerHTML = quantities.static_thrust_ideal.toFixed(1);
    document.getElementById('prop_tip_mach').innerHTML = quantities.prop_tip_mach.toFixed(4);
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

function updateCharts(aircraft, results) {
    function drawVisualization() {
        var perfs = aircraft.parameters,
            quantities = aircraft.quantities,
            chartData = [
            ['Airspeed', 'Rate of Climb', 'Prop Efficiency (*1,000)', 'Sink Rate', 'Reynolds No. (/10,000)']
        ],
            calculatedResults = results.calculated,
            result,
            i,
            v;
        
        for (i = 0; i < calculatedResults.length; i += 1) {
            result = calculatedResults[i];
            chartData.push([result.v, result.rc, result.eta*1000, result.rs, result.rec/10000]);
        }

        var data = google.visualization.arrayToDataTable(chartData);
        var ac = new google.visualization.LineChart(document.getElementById('visualization'));
        ac.draw(data, {
            title : 'Performance metrics based on Airspeed',
            curveType: 'none',
            width: 600,
            height: 400,
            vAxis: {title: "rc, eta, rs, rec"},
            hAxis: {title: "Airspeed, V (mph)"}
        });
    }
  
    google.setOnLoadCallback(drawVisualization);
}

function main(aircraft) {
    var perf = aircraft.parameters;
    var quantities = aircraft.quantities;

    var v = perf.vel_stall_clean_mph;
    var stats = {};
    var imax = false;
    var rc = 0;
    var rcold;

    var results = {
         calculated: [],
        summaries: {},
    };

    var firstAirspeed = true;
    do {
        rcold = stats.rc || rc;
        stats = calculateStats(v, quantities);
        if (stats.rc > 0) {
            results.calculated.push(stats);
            if (!imax) {
                if (firstAirspeed) {
                    v = firstDeltaAirspeed(v, vel_delta, perf.vel_stall_clean_mph);
                } else {
                    v = nextDeltaAirspeed(v, vel_delta);
                }
            }
        } else {
            v = finalAirspeed(v, vel_delta, stats.rc, rcold);
            imax = true;
        }
        firstAirspeed = false;
    } while (imax === false || stats.rc <= 0);
    
    results.summaries = calculateSummaries(aircraft, v, results.calculated);

    return results;
}


var aircraft = {
    parameters: parameters,
    quantities: calculateQuantities(parameters)
};
updateParameters(parameters);
var results = main(aircraft);
updateQuantities(aircraft.quantities);
updateResults(results);

window.vel_delta = 1;
var results = main(aircraft);
updateCharts(aircraft, results);
