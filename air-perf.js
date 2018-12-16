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
window.vel_delta = 1.00; // airspeed increment for each iteration

window.useMaxClean = false;

var performanceData = [
   {
      name: "Thorp T-18 (Default)",
      bhp: 150.00,
      wing_span_ft: 20 + 10 / 12,
      prop_dia_ft: 5,
      prop_dia_in: 5 * 12,
      wing_area: 86,
      empty_weight_lb: 900.00,
      gross_lb: 1500.00,
      vel_max_mph: 180.00,
      vel_stall_clean_mph: 67.00, // VS1
      rcmax: 2000,
      useful_load_lb: 600.00,
      prop_max_rpm: 2700.00,
      cl_max_clean: 1.53,
      cl_max_flap: 2.10,
      plane_efficiency: 0.744
   },
   {
      name: "Aerocar Imp",
      bhp: 0.00,
      wing_span_ft: 20.83,
      prop_dia_ft: 72 / 12,
      prop_dia_in: 72.00,
      wing_area: 86,
      empty_weight_lb: 600.00,
      gross_lb: 1500.00,
      vel_max_mph: 180.00,
      vel_stall_clean_mph: 67.00, // VS1
      rcmax: 2000,
      useful_load_lb: 600.00,
      prop_max_rpm: 2700.00,
      cl_max_clean: 1.53,
      cl_max_flap: 2.10,
      plane_efficiency: 0.744,
   },
   {
      name: "Thorp T-18 Tiger",
      bhp: 180.00,
      wing_span_ft: 20 + 10 / 12,
      prop_dia_ft: 5 + 3 / 12,
      prop_dia_in: 5 * 12 + 3,
      wing_area: 86,
      empty_weight_lb: 900.00,
      gross_lb: 1506.00,
      vel_max_mph: 200.00,
      vel_stall_clean_mph: 65.00, // VS1
      // rcmax: 2000,
      prop_max_rpm: 2700.00,
      useful_load_lb: 600.00,
      cl_max_clean: 1.53,
      cl_max_flap: 2.10,
      plane_efficiency: 0.744
   },
];
// end of user editable custom variables

function wing_load(cl_max_clean, vel_stall_clean_mph) {
   var load = cl_max_clean * Math.pow(vel_stall_clean_mph, 2) / 391;
   return load; // lb per ft
}

function vel_stall_flaps(wing_load_lb_ft, cl_max_flap) {
   var stall_speed = Math.sqrt(wing_load_lb_ft * 391 / cl_max_flap); // VS0
   return stall_speed; // mph
}

function wing_area(gross_lb, wing_load_lb_ft) {
   return gross_lb / wing_load_lb_ft;
}

function climb_max(wing_area, gross_lb, vel_stall_clean_mph) {
   var wing_load_lb_ft = gross_lb / wing_area;
   return wing_load_lb_ft * 391 / Math.pow(vel_stall_clean_mph, 2);
}

function main(perf) {
   var wing_load_lb_ft;
   if (useMaxClean) {
      wing_load_lb_ft = wing_load(perf.cl_max_clean, perf.vel_stall_clean_mph);
   } else {
      wing_load_lb_ft = perf.gross_lb / perf.wing_area;
   }
   var vel_stall_flaps_mph = vel_stall_flaps(wing_load_lb_ft, perf.cl_max_flap);
   var wing_area_ft = wing_area(perf.gross_lb, wing_load_lb_ft);
   var wing_aspect = Math.pow(perf.wing_span_ft, 2) / wing_area_ft;
   var wing_chord_ft = perf.wing_span_ft / wing_aspect;
   var wing_span_effective = perf.wing_span_ft * Math.sqrt(perf.plane_efficiency);
   var wing_chord_effective = wing_area_ft / wing_span_effective;
   var wing_load_effective = perf.gross_lb / wing_span_effective;
   var drag_area_ft = 0.8 * perf.bhp * 146625 / Math.pow(perf.vel_max_mph, 3);

   var cd_drag = drag_area_ft / wing_area_ft;
   var vel_sink_min_ft = 11.29 * Math.sqrt(wing_load_effective) /Math.sqrt(Math.sqrt(drag_area_ft));
   var pwr_min_req_hp = 0.03922 * Math.sqrt( Math.sqrt(drag_area_ft)) * wing_load_effective *Math.sqrt(wing_load_effective);
   var rate_sink_min_ft = 33000 * pwr_min_req_hp / perf.gross_lb;
   var ld_max = 0.8862 * wing_span_effective / Math.sqrt(drag_area_ft);
   var drag_min = perf.gross_lb / ld_max;
   var cl_min_sink = 3.07 * Math.sqrt(drag_area_ft) / wing_chord_effective;
   var rate_climb_ideal = 33000 * perf.bhp / perf.gross_lb;
   var prop_tip_mach = perf.prop_max_rpm * perf.prop_dia_ft * 0.05236 / 1100;
   var prop_vel_ref = 41.9 * Math.pow(perf.bhp / Math.pow(perf.prop_dia_ft, 2), 1.0 / 3);
   var static_thrust_ideal = 10.41 * Math.pow(perf.bhp * perf.prop_dia_ft, 2.0 / 3);
   
   document.getElementById('wing_load_lb_ft').innerHTML = wing_load_lb_ft.toFixed(2);
   document.getElementById('vel_stall_flaps_mph').innerHTML = vel_stall_flaps_mph.toFixed(2);
   document.getElementById('wing_area_ft').innerHTML = wing_area_ft.toFixed(2);
   document.getElementById('wing_aspect').innerHTML = wing_aspect.toFixed(2);
   document.getElementById('wing_chord_ft').innerHTML = wing_chord_ft.toFixed(2);
   document.getElementById('wing_span_effective').innerHTML = wing_span_effective.toFixed(2);
   document.getElementById('wing_chord_effective').innerHTML = wing_chord_effective.toFixed(2);
   document.getElementById('wing_load_effective').innerHTML = wing_load_effective.toFixed(2);
   document.getElementById('drag_area_ft').innerHTML = drag_area_ft.toFixed(2);
   document.getElementById('cd_drag').innerHTML = cd_drag.toFixed(2);
   document.getElementById('vel_sink_min_ft').innerHTML = vel_sink_min_ft.toFixed(2);
   document.getElementById('pwr_min_req_hp').innerHTML = pwr_min_req_hp.toFixed(2);
   document.getElementById('rate_sink_min_ft').innerHTML = rate_sink_min_ft.toFixed(2);
   document.getElementById('ld_max').innerHTML = ld_max.toFixed(2);
   document.getElementById('drag_min').innerHTML = drag_min.toFixed(2);
   document.getElementById('cl_min_sink').innerHTML = cl_min_sink.toFixed(2);
   document.getElementById('rate_climb_ideal').innerHTML = rate_climb_ideal.toFixed(2);
   document.getElementById('prop_tip_mach').innerHTML = prop_tip_mach.toFixed(2);
   document.getElementById('prop_vel_ref').innerHTML = prop_vel_ref.toFixed(2);
   document.getElementById('static_thrust_ideal').innerHTML = static_thrust_ideal.toFixed(2);

   var eta = 1;
   var fp = 0;
   var rc = 1;
   var rc1 = 0;
   var rc2 = 0;
   var rcmax = 0;
   var rec = 0;
   var rsh = 0;
   var rmu = 1;
   var rs = 0;
   var sig = Math.pow(1 - altitude_ft / 145800, 4.265);
   // var t = 518.7 - 0.00356 * altitude_ft;
   var t1 = 1.0 / 3;
   var t2 = 0;
   var v = perf.vel_stall_clean_mph;
   var vh = 0;
   var vmax = 0;
   var vt = 0;
   var wv2 = 0;

   clearResults();

   while (rc > 0) {
      vh = v / vel_sink_min_ft;
      rsh = 0.25 * (Math.pow(vh, 4) + 3) / vh;
      rs = rsh * rate_sink_min_ft;
      vt = v / prop_vel_ref;
      t2 = Math.sqrt(1 + .23271 * Math.pow(vt, 3));
      eta = 0.92264 * vt * (Math.pow( 1 + t2,t1) - Math.pow(t2 - 1, t1)) * 0.85;
      rc = rate_climb_ideal * eta - rs;
      rc2 = rc;
      rec = sig * v * wing_chord_ft * 9324 / rmu;
      if (rc > 0) {
         rcmax = Math.max(rc, rcmax);
         vmax = Math.max(v, vmax);
         updateResults(v.toFixed(1), rc.toFixed(1), eta.toFixed(2), rs.toFixed(1), rec.toFixed(0));
         v = v + vel_delta * rc2 / (rc2 - rc1);
      }
   }

   fp = rcmax * perf.useful_load_lb / 33000 / perf.bhp * (1 - (vel_stall_flaps_mph / vmax));
   
   wv2 = perf.gross_lb * Math.pow(v, 2);
   
   document.getElementById('fp').innerHTML = fp.toFixed(4);
   document.getElementById('wv2').innerHTML = wv2.toFixed(2);
   document.getElementById('rcmax').innerHTML = rcmax.toFixed(2);
   document.getElementById('vmax').innerHTML = vmax.toFixed(2);
   document.getElementById('useful_load_lb').innerHTML = perf.useful_load_lb.toFixed(2);
}

function clearResults() {
   var table = document.getElementById('results');
   var row = table.tBodies[0].innerHTML = "";
}

function updateResults(v, rc, eta, rs, rec) {
   var table = document.getElementById('results');
   var row = table.tBodies[0].insertRow(-1);
   insertCell(row, rec);
   insertCell(row, rs);
   insertCell(row, eta);
   insertCell(row, rc);
   insertCell(row, v);
}

function insertCell(row, value) {
   var content = document.createTextNode(value);
   row.insertCell().appendChild(content);
}

function loadperf(perf) {
   var form = document.getElementById('perf');
   form.elements.name.value = perf.name;
   form.elements.bhp.value = perf.bhp;
   form.elements.wing_span_ft.value = perf.wing_span_ft;
   form.elements.prop_dia_ft.value = perf.prop_dia_ft;
   form.elements.prop_dia_in.value = perf.prop_dia_in;
   form.elements.wing_area.value = perf.wing_area;
   form.elements.empty_weight_lb.value = perf.empty_weight_lb;
   form.elements.gross_lb.value = perf.gross_lb;
   form.elements.vel_max_mph.value = perf.vel_max_mph;
   form.elements.vel_stall_clean_mph.value = perf.vel_stall_clean_mph;
   form.elements.rcmax.value = perf.rcmax;
   form.elements.useful_load_lb.value = perf.useful_load_lb;
   form.elements.prop_max_rpm.value = perf.prop_max_rpm;
   form.elements.cl_max_clean.value = perf.cl_max_clean;
   form.elements.cl_max_flap.value = perf.cl_max_flap;
   form.elements.plane_efficiency.value = perf.plane_efficiency;
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
   perf.cl_max_clean = form.elements.cl_max_clean.value;
   perf.cl_max_flap = form.elements.cl_max_flap.value;
   perf.plane_efficiency = form.elements.plane_efficiency.value;
   main(perf);
   return false;
};

loadperf(performanceData[0]);
main(performanceData[0]);