var alt=0,
    delv=10,
    ldmax,
    mp;

// VALUES FOR INPUT PARAMETERS (THORP T-18 SAMPLE CALCULATION)
var bhp=150;
var b = 20.833;
var dp=72;
var w=1500;
var vmax=180;
var vs1=67;
var wu=600;
var rpm=2700;
var clmax=1.53;
var clmaxf=2.1;
var e=0.744;

// BEGIN CALCULATION
var ws=clmax*vs1*vs1/391;
var vs0=Math.sqrt(ws*391/clmaxf);
var s=w/ws;
var ar=b*b/s;
console.log(ar, b, s);
var c=b/ar;
var be=b*Math.sqrt(e);
var ear=be*be/s;
var ce=s/be;
var wbe=w/be;
var ad=0.8*bhp*146625/(Math.pow(vmax, 3));
var cd0=ad/s;
var ad2=Math.sqrt(ad);
var ad4=Math.sqrt(ad2);
var vmins=11.29*Math.sqrt(wbe)/ad4;
var thpm=0.03922*ad4*wbe*Math.sqrt(wbe);
var rsmin=33000*thpm/w;
var ldmax=0.8862*be/ad2;
var dmin=w/ldmax;
var clmins=3.07*ad2/ce;
var rcstar=33000*bhp/w;
var dpf=dp/12;
var vtip=rpm*dpf*0.05236;
var mp=vtip/1100;
var vprop=41.9*Math.pow(bhp/dpf/dpf, 1/3);
var ts=10.41*Math.pow(bhp*dpf, 2/3);

function showInputParameters(vs1,clmax,clmaxf,w,wu,b,e,bhp,vmax,dp,rpm,alt) {
    var form = document.getElementById('perf');
    form.elements.vs1.value = vs1;
    form.elements.clmax.value = clmax;
    form.elements.clmaxf.value = clmaxf;
    form.elements.w.value = w;
    form.elements.wu.value = wu;
    form.elements.b.value = b;
    form.elements.e.value = e;
    form.elements.bhp.value = bhp;
    form.elements.vmax.value = vmax;
    form.elements.dp.value = dp;
    form.elements.rpm.value = rpm;
    form.elements.alt.value = alt;
}
showInputParameters(vs1,clmax,clmaxf,w,wu,b,e,bhp,vmax,dp,rpm,alt);

function outputQuantities(ws,vs0,s,ar,c,ear,be,ce,wbe,ad,cd0,vmins,thpm,dmin,rsmin,ldmax,clmins,rcstar,vprop,ts ,mp) {
    document.getElementById('wing_load_lb_ft').innerHTML = ws.toFixed(3);
    document.getElementById('vel_stall_flaps_mph').innerHTML = vs0.toFixed(1);
    document.getElementById('wing_area_ft').innerHTML = s.toFixed(1);
    document.getElementById('wing_aspect').innerHTML = ar.toFixed(2);
    document.getElementById('wing_chord_ft').innerHTML = c.toFixed(2);
    document.getElementById('aspect_ratio_effective').innerHTML = ear.toFixed(2);
    document.getElementById('wing_span_effective').innerHTML = be.toFixed(2);
    document.getElementById('wing_chord_effective').innerHTML = ce.toFixed(2);
    document.getElementById('wing_load_effective').innerHTML = wbe.toFixed(2);
    document.getElementById('drag_area_ft').innerHTML = ad.toFixed(2);
    document.getElementById('cd_drag').innerHTML = cd0.toFixed(4);
    document.getElementById('vel_sink_min_ft').innerHTML = vmins.toFixed(1);
    document.getElementById('pwr_min_req_hp').innerHTML = thpm.toFixed(2);
    document.getElementById('drag_min').innerHTML = dmin.toFixed(1);
    document.getElementById('rate_sink_min_ft').innerHTML = rsmin.toFixed(1);
    document.getElementById('ld_max').innerHTML = ldmax.toFixed(2);
    document.getElementById('cl_min_sink').innerHTML = clmins.toFixed(2);
    document.getElementById('rate_climb_ideal').innerHTML = rcstar.toFixed(1);
    document.getElementById('prop_vel_ref').innerHTML = vprop.toFixed(1);
    document.getElementById('static_thrust_ideal').innerHTML = ts .toFixed(1);
    document.getElementById('prop_tip_mach').innerHTML = mp.toFixed(4);
}
outputQuantities(ws,vs0,s,ar,c,ear,be,ce,wbe,ad,cd0,vmins,thpm,dmin,rsmin,ldmax,clmins,rcstar,vprop,ts ,mp);

function clearResults() {
   var table = document.getElementById('results');
   var row = table.tBodies[0].innerHTML = "";
}

function updateResults(v, rc, eta, rs, rec) {
   var table = document.getElementById('results');
   var row = table.tBodies[0].insertRow(-1);
   insertCell(row, v.toFixed(1));
   insertCell(row, rc.toFixed(1));
   insertCell(row, eta.toFixed(4));
   insertCell(row, rs.toFixed(1));
   insertCell(row, rec.toFixed(0));
}

function insertCell(row, value) {
   var content = document.createTextNode(value);
   row.insertCell(-1).appendChild(content);
}

function showSummary(fp,wv2) {
    // f /30h  performance rating parameter,16x,5hfp = ,f6.4/
    // f 26h  kinetic energy parameter,19x,6hwv2 = ,e10.3
    // f ,8h lb mph2/)
}

function increaseVelocity(v, delv, vs1) {
    do {
        v=v+delv;
    } while (v <= vs1);

    return v;
}

var imax = false;
var istal=1;
var sig=Math.pow(1-alt/145800, 4.265);
var t=518.7-0.00356*alt;
var rmu=1;
var t1=1/3;
var rcmax=0;
var v=vs1;
var rc=0;

var rc1, vh, rsh, rs, vt, t2, eta, rc2, rec;

clearResults();

while (true) {
    rc1=rc;
    vh=v/vmins;
    rsh=0.25*(Math.pow(vh, 4)+3)/vh;
    rs=rsh*rsmin;
    vt=v/vprop;
    t2=Math.sqrt(1+0.23271*Math.pow(vt, 3));
    eta=0.92264*vt*(Math.pow(1+t2,t1)-Math.pow(t2-1,t1))*0.85;
    rc=rcstar*eta-rs;
    rcmax = Math.max(rc, rcmax);
    rc2=rc;
    if(rc <= 0) {
        imax = true;
        v = v - delv * rc2 / (rc2 - rc1);
    } else {
        rec = sig * v * c * 9324 / rmu;
        updateResults(v, rc, eta, rs, rec);

        if(imax === true) {
            break;
        }
        if(istal === 1) {
            v=0;
            istal=0;
        }
        v = increaseVelocity(v, delv, vs1);
    }
}

var wv2=w*v*v;
var fp=rcmax*wu/33000/bhp*(1-(vs0/v));

document.getElementById('fp').innerHTML = fp.toFixed(4);
document.getElementById('wv2').innerHTML = wv2.toFixed(2);
