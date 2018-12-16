/*jslint browser:true */
/*globals google */
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
    V1.2 users will note slight variations in output compared to the basic
    version of this program due to different round off error in math
    packages.
*/

//(function () {
    'use strict';

    /*
        --------------------------------------------------------------------
        This section is user variables that can be customized to a particular
        aircraft. See The book for descriptions.
        --------------------------------------------------------------------
    */

    var constants = {},
        defaults = {},
        performance = {
            name: "Thorp T-18 (Default)",
            vel_stall_clean_mph: 67.00, // VS1
            cl_max_clean: 1.53,
            cl_max_flap: 2.10,
            gross_lb: 1500.00,
            useful_load_lb: 600.00,
            wing_span_ft: 20.833,
            bhp: 150.00,
            vel_max_mph: 180.00,
            prop_dia_in: 6 * 12,
            prop_dia_ft: 6,
            prop_max_rpm: 2700.00,
            prop_efficiency: 85 / 100, // %
            chord_length: 4,
            minimum_section_drag_coefficient: 0.005, // between lift coefficient 0.1 to 0.6
            aerodynamic_centre: 0.271
        },
        quantities = {},
        results = {},
        estimate = false;

    // end of user editable custom variables

    // Appendix D
    function fahrenheitToRankin(temperature_f) {
        var fahrenheit_to_rankin = constants.fahrenheit_to_rankin; // from absolute zero

        return temperature_f + fahrenheit_to_rankin;
    }
    // Take the differential form for the vertical momentum equation
    // Δp/Δh = -ρg
    // If density were constant as ρ0 (such as for water)
    // p = p0 - ρ0gh (section D.2)
    function densityRatio(altitude_ft, temperature_sealevel_f) {
        // section D.12: σ = [1-βh/TSL]^(g/Rβ - 1)
        // 1 at sealevel
        var constant = constants.densityRatio,
            lapse_ratio,
            gas_constant_air,
            gravitational_constant,
            temperature_rankine,
            density_ratio;

        if (!constant) {
            lapse_ratio = constants.temperature_lapse_rate;
            gas_constant_air = constants.gas_constant_air; // ft^2/sec^2
            gravitational_constant = constants.gravitational_constant; // g ft/sec^2
            constant = gravitational_constant / (gas_constant_air * lapse_ratio) - 1;
            constants.density_ratio = constant;
        }

        if (altitude_ft < 36240) {
            temperature_sealevel_f = temperature_sealevel_f || constants.average_sealevel_temperature;
            temperature_rankine = fahrenheitToRankin(temperature_sealevel_f);
            density_ratio = Math.pow(1 - lapse_ratio * altitude_ft / temperature_rankine, constant);
        } else if (altitude_ft < 82000) {
            density_ratio = 1.688 * Math.pow(Math.E, -altitude_ft / 20808);
        } else {
            throw new Error('Temperature beyond bounds');
        }

        return density_ratio;
    }
    function airState(altitude_ft, temperature_sealevel_f) {
        temperature_sealevel_f = temperature_sealevel_f || constants.average_sealevel_temperature;

        var ratio = densityRatio(altitude_ft, temperature_sealevel_f),
            density = constants.air_density_slug * ratio,
            temperature = temperature_sealevel_f,
            rankine = fahrenheitToRankin(temperature_sealevel_f);
        return {
            ratio: ratio,
            density: density,
            sealevel: temperature_sealevel_f,
            temperature: temperature,
            rankine: rankine
        };
    }
    function air(altitude_ft, temperature_sealevel_f) {
        var details = constants.air[altitude_ft];

        if (!details) {
            constants.air[altitude_ft] = airState(altitude_ft, constants.average_sealevel_temperature);
            if (constants.average_sealevel_temperature !== temperature_sealevel_f) {
                constants.air[altitude_ft][temperature_sealevel_f] = airState(altitude_ft, temperature_sealevel_f);
            }
            details = constants.air[altitude_ft];
        }

        return details;
    }

    // Appendix F
    function efficiencyFactor(wing_area_ft, wing_efficiency, fuselage_drag_dependence, fuselage_area) {
        // more details page 165-168
        var fuselage_efficiency = fuselage_drag_dependence * fuselage_area / wing_area_ft;

        return 1 / (wing_efficiency + fuselage_efficiency);
    }

    // Appendix I - Reynolds number
    // - moved before Appendix H due to it needing the renyoldsNumber function.
    function viscosity(temperature_f) {
        // μ = 2.270 * (T^(3/2) / T + 198.6) * 10^-8
        var fahrenheit_to_rankin = constants.fahrenheit_to_rankin,
            temperature_rankine = temperature_f + fahrenheit_to_rankin,
            conversionFactor = 2.270 * 1e-8;

        return conversionFactor * Math.pow(temperature_rankine, 3 / 2) / (temperature_rankine + 198.6);
    }
    function reynoldsNumber(airspeed_mph, wing_chord_ft, altitude_ft) {
        altitude_ft = altitude_ft || 0;

        var temperature_f = defaults.temperature_sealevel_f,
            viscosity_slug_ft_sec = viscosity(temperature_f),
            air_density = air(altitude_ft, temperature_f).density,
            mph_to_fps = constants.convert.mph_to_fps,
            airspeed_ft_sec = airspeed_mph * mph_to_fps,
            inertia_forces = air_density * airspeed_ft_sec * wing_chord_ft,
            viscous_forces = viscosity_slug_ft_sec;

        return inertia_forces / viscous_forces;
    }

    // Appendix H
    function momentCoefficient(position) {
        // TODO
        var positions = {};
        positions.position = position;
        positions.dragcoefficient = -0.075;

        // section drag coefficient
        return positions.dragcoefficient;
    }
    function airfoilSection(vel_stall_clean_mph, wing_area_ft, chord_length, minimum_section_drag_coefficient, aerodynamic_centre) {
        // Bernoulli's Equation
        // p1 + 0.5 * p1 * Math.pow(v1) = p2 + 0.5 * p2 * Math.pow(v2)
        // (p1 - p2) / 0.5 * Math.pow(v2) = 1 - Math.pow(v1 / v2, 2)

        // Thorp T-18 has a NACA 63(1)-412 wing section
        // 
        // from 412, 4 and 12 have different meanings
        // 4 relates to the low drag region that extends +/- 0.1 around the lift coefficient of 0.4
        // 12 means maximum thickness of wing is 12 percent of the chord

        // from data on aerodynamic characteristics of wing sections, and
        // assuming chord length = 4 feet and stalling speed = 67, Reynolds number is 2.5*10^6
        var reynolds_number = reynoldsNumber(vel_stall_clean_mph, chord_length),
            drag_area_ft = wing_area_ft * minimum_section_drag_coefficient,
            // TODO
            moment_coefficient = momentCoefficient(aerodynamicCentre, reynolds_number, drag_area_ft);

        return moment_coefficient;

    }
    function liftCoefficient(angle_degrees, type) {
        // TODO
        var coefficients = {
            'dirty': {
                '-3': 0,
                '7': 1.1,
                '12': 1.52
            },
            'dirtyflaps': {
                '-13': 0,
                '11': 2.5
            }
        };

        return coefficients[type][angle_degrees];
    }

    // Appendix J - Equation of state
    function airPressure(altitude_ft, temperature_sealevel_f) {
        // p = ρ/(R*T)

        var air_density = air(altitude_ft, temperature_sealevel_f).density,
            gas_constant_air = constants.gas_constant_air, // R = gas constant of air, ft^2/sec^2
            fahrenheit_to_rankin = constants.fahrenheit_to_rankin,
            temperature_rankine = temperature_sealevel_f + fahrenheit_to_rankin; // from absolute zero

        return air_density * gas_constant_air * temperature_rankine; // slugs/ft^3
    }

    // Power Required relationships

    // Relation 1: Lift Coefficient, Airspeed, Wing Loading - CL, V, W/S
    // 
    function wingLoad(cl_max_clean, vel_stall_clean_mph) {
        // W/S = CL V^2/391
        var constant = (estimate ? 1 / 391 : constants.dynamic_pressure_from_mph);

        return constant * cl_max_clean * Math.pow(vel_stall_clean_mph, 2); // (CL*V^2)/391
    }
    function velocityStallWithFlaps(wing_load_lb_ft, cl_max_flap) {
        var constant = (estimate ? 391 : 1 / constants.dynamic_pressure_from_mph);

        return Math.sqrt(constant * wing_load_lb_ft / cl_max_flap); // w/s*391/clf
    }

    function maxSpeedLiftCoefficient(wing_load_lb_ft, vel_max_mph) {
        // from W/S = CL V^2/391
        // solve for the coefficient
        //   W/S / CL = V^2/391
        //   CL / W/S = 391 / V^2
        //   CL = (W/S * 391) / V^2
        //   CLmaxV = (W/S * 391 / Vmax^2
        var constant = (estimate ? 391 : 1 / constants.dynamic_pressure_from_mph);

        return constant * wing_load_lb_ft / Math.pow(vel_max_mph, 2);
    }

    // Relation 2: Wing Area, Wing Loading, Gross Weight - S, W/S, W
    function wingArea(wing_load, gross_lb) {
        return gross_lb / wing_load;
    }

    // Relation 3: Wing Area, Effective Span, Effective Aspect Ratio, Effective Chord - S, be, eAR, ce
    function wingChord(wing_area_ft, wing_span_ft) {
        return wing_area_ft / wing_span_ft;
    }
    function aspectRatio(wing_area_ft, wing_span_ft) {
        // average chord c = S/b 
        // aspect ratio AR = b/c
        // by substitution
        //   AR = b/(S/b)
        //   AR = b^2 / S
        return Math.pow(wing_span_ft, 2) / wing_area_ft;
    }
    function effectiveAspectRatio(aspect_ratio, plane_efficiency) {
        return aspect_ratio * plane_efficiency;
    }
    function effectiveSpan(wing_span_ft, plane_efficiency) {
        return wing_span_ft * Math.sqrt(plane_efficiency);
    }
    function effectiveChord(wing_area_ft, wing_span_effective) {
        return wing_area_ft / wing_span_effective;
    }

    // Relation 4: Effective Span, Effective Span Loading, Gross Weight - be, W/be, W
    function effectiveSpanLoading(gross_lb, wing_span_effective) {
        // W/be
        return gross_lb / wing_span_effective;
    }

    // Relation 5: Drag Area, Maximum Level Speed, Available Thrust Horsepower - AD, Vmax, THPa
    function availableThrustHorsepower(drag_area_ft, vel_max_mph, density_ratio) {
        // THPa = (AD*Vmax^3)/146625
        // 1/146625 = 1 / (33000 * 391 * 5280/60)

        var constant = (estimate ? 1 / 146625 : constants.availableThrustHorsepower),
            hp,
            fpm,
            sea_level_thrust;

        if (!constant) {
            hp = constants.convert.ft_lb_min_to_horsepower;
            fpm = constants.convert.mph_to_fpm;
            constant = constants.dynamic_pressure_from_mph / hp * fpm;
            constants.availableThrustHorsepower = constant;
        }
        sea_level_thrust = constant * drag_area_ft * Math.pow(vel_max_mph, 3);
        return sea_level_thrust * density_ratio;
    }
    function dragArea_sealevel(vel_max_mph, bhp, prop_efficiency) {
        // AD = THPa*146625/Vmax^3
        prop_efficiency = prop_efficiency || defaults.prop_efficiency;

        var constant = (estimate ? 146625 : constants.dragArea_sealevel),
            thrust_horsepower = bhp * prop_efficiency,
            hp,
            fpm;

        if (!constant) {
            hp = constants.convert.ft_lb_min_to_horsepower;
            fpm = constants.convert.mph_to_fpm;
            constant = 1 / constants.dynamic_pressure_from_mph * hp / fpm;
            constants.dragArea_sealevel = constant;
        }

        return constant * thrust_horsepower / Math.pow(vel_max_mph, 3);
    }
    // Relation 6: Zero-Lift Drag Coefficient, Drag Area, Wing Area
    function zeroLiftDragCoefficient(drag_area_ft, wing_area_ft) {
        //CD,0 = AD / S
        return drag_area_ft / wing_area_ft;
    }

    // Relation 7: Drag Area, Airspeed for Minimum Sink, Effective Span Loading, Minimum Power Required for Level Flight, Minimum Drag
    function minimumSinkRateAirspeed(wing_load_effective, density_ratio, drag_area_ft) {
        // VminS = 11.29 * √(W/be)/(√σ AD^¼)
        // VminS = √391/(3π)^¼ * √(W/be)/(√σ AD^¼)
        var constant = (estimate ? 11.29 : constants.minimumSinkRateAirspeed);

        if (!constant) {
            constant = Math.sqrt(1 / constants.dynamic_pressure_from_mph) / Math.pow(3 * Math.PI, 1 / 4);
            constants.minimumSinkRateAirspeed = constant;
        }

        return constant * Math.sqrt(wing_load_effective) / (Math.sqrt(density_ratio) * Math.pow(drag_area_ft, 1 / 4));
    }
    function minimumRequiredPower(drag_area_ft, wing_load_effective) {
        // THPmin = 0.03921*AD^(1/4)*(W/be^(3/2))
        var constant = (estimate ? 0.03921 : constants.minimumRequiredPower);

        if (!constant) {
            constant = constants.convert.mph_to_fpm * Math.sqrt(1 / constants.dynamic_pressure_from_mph) * 4 / Math.pow(3 * Math.PI, 3 / 4) / 33000;
            constants.minimumRequiredPower = constant;
        }

        return constant * Math.pow(drag_area_ft, 1 / 4) * wing_load_effective * Math.sqrt(wing_load_effective);
    }
    function minimumDrag(drag_area_ft, wing_load_effective) {
        // Dmin = 1.128 * √(AD) * W/be
        var constant = (estimate ? 1.128 : constants.minimumDrag);

        // Dmin = gross_lb / maximum_lift_to_drag_ratio;

        if (!constant) {
            constants.minimumDrag = 2 / Math.sqrt(Math.PI);
            constant = constants.minimumDrag;
        }

        return constant * Math.sqrt(drag_area_ft) * wing_load_effective;
    }

    //Relation 8: Minimum Sink Rate, Minimum Power Required for Level Flight, Weight
    function minimumSinkRate(pwr_min_req_hp, gross_lb) {
        // THP = (W * RS) / 33000
        // RSmin = 33000 * (THP / W)
        var constant = (estimate ? 33000 : constants.convert.ft_lb_min_to_horsepower);

        return constant * pwr_min_req_hp / gross_lb;
    }

    // Relation 9: Drag Area, Effective Span, Maximum Lift-to-Drag Ratio
    function maximumLiftToDragRatio(drag_area_ft, wing_span_effective) {
        // (L/D)max = 0.8862 be/√AD
        // (L/D)max = (√π be) / 2√(AD)
        var constant = (estimate ? 0.8862 : constants.maximumLiftToDragRatio);

        if (!constant) {
            constants.maximumLiftToDragRatio = Math.sqrt(Math.PI) / 2;
            constant = constants.maximumLiftToDragRatio;
        }

        return constant * wing_span_effective / Math.sqrt(drag_area_ft);
    }

    // Relation 10: Drag Area, Lift Coefficient at Minimum Sink, Effective Chord
    function liftCoefficientMinimumSink(drag_area_ft, wing_chord_effective) {
        // CLminS = 3.07 * (√(AD) / ce)
        var constant = (estimate ? 3.07 : constants.liftCoefficientMinimumSink);

        if (!constant) {
            constants.liftCoefficientMinimumSink = Math.sqrt(3 * Math.PI);
            constant = constants.liftCoefficientMinimumSink;
        }

        return constant * Math.sqrt(drag_area_ft) / wing_chord_effective;
    }

    // Power Available relationships
    // Relation 11: Weight, Engine Brake Horsepower, Ideal Maximum Rate of Climb
    function idealRateOfClimb(bhp, gross_lb) {
        // RC,max = 33000 * BHP / W
        var constant = constants.convert.ft_lb_min_to_horsepower;

        return constant * bhp / gross_lb;
    }

    // Relation 12: Static Thrust, Engine Brake Horsepower, Reference Propeller Airspeed for 74% Efficiency, Propeller Diameter
    function propellerEfficiency(velocity, propeller_airspeed) {
        // continuity_equation: m = ρAp Vp = ρA3 V3
        //   m: mass flow rate, ρ: air density, Ap: propeller area, Vp: velocity of air through propeller
        //   A3: streamtube area, V3: slipstream velocity
        var constant = Math.pow(Math.PI / 4, 1 / 3),
            dimensionless_velocity = velocity /  propeller_airspeed,
            cubic1 = Math.pow(1 + Math.sqrt(1 + 2 * Math.PI / 27 * Math.pow(dimensionless_velocity, 3)), 1 / 3),
            cubic2 = Math.pow(-1 + Math.sqrt(1 + 2 * Math.PI / 27 * Math.pow(dimensionless_velocity, 3)), 1 / 3),
            propeller_efficiency = constant * dimensionless_velocity * (cubic1 - cubic2);

        return propeller_efficiency;
    }
    function propellerAirspeed(bhp, prop_dia_ft, altitude_ft, temperature_sealevel_f) {
        // Vprop = 41.8 [BHP/Dp^2] ^ 1/3
        // 3√(173.6 / 0.002377) = 41.8
        // Vprop = [ (33000 60²) / (0.002377 88³) ] * [ BHP / σ Dp² ]^(1/3)

        temperature_sealevel_f = temperature_sealevel_f || constants.average_sealevel_temperature;

        var constant = (estimate ? 173.6 : constants.propellerAirspeed),
            ft_lb_min_to_horsepower;

        if (!constant) {
            ft_lb_min_to_horsepower = constants.convert.ft_lb_min_to_horsepower;
            constants.propellerAirspeed = ft_lb_min_to_horsepower * Math.pow(60, 2) / Math.pow(5280 / 60, 3);
            constant = constants.propellerAirspeed;
        }

        return Math.pow(constant / air(altitude_ft, temperature_sealevel_f).density * bhp / Math.pow(prop_dia_ft, 2), 1 / 3);
    }
    function referencePropellerAirspeed(bhp, prop_dia_ft) {
        var altitude_ft = 0;

        return propellerAirspeed(bhp, prop_dia_ft, altitude_ft);
    }
    function idealStaticThrust(bhp, prop_dia_ft) {
        // Ts = 10.41 [BHP Dp] ^ 2/3
        var constant = (estimate ? 10.41 : constants.ideal_static_thrust);

        if (!constant) {
            constants.ideal_static_thrust = 10.41;
            constant = constants.ideal_static_thrust;
        }

        return constant * Math.pow(bhp * prop_dia_ft, 2 / 3);
    }

    // Relation 13: Propeller Diameter, Propeller Rotational Speed, Propeller Tip Mach Number
    function propellerTipMachNumber(prop_max_rpm, prop_dia_ft) {
        // Mp = RPM/60 Dp/2 τ / 1100

        // - divide by 60 for revolutions per second
        // - change diameter to a radius
        // - TAU (τ) is the full turn of a circle
        var constant = (estimate ? 1 / 21008 : constants.propellerTipMachNumber);

        if (!constant) {
            constants.propellerTipMachNumber = 1 / 60 * 0.5 * Math.TAU / constants.speed_of_sound;
            constant = constants.propellerTipMachNumber;
        }

        return constant * prop_max_rpm * prop_dia_ft;
    }

    // Cross Checks
    // Relation 14: Airspeed for Minimum Sink Rate, Minimum Sink Rate, Maximum Lift-to-Drag
    // Consistency check for Relations 7: VminS, 8: RS,min, and 9: (L/D)max
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

    // Relation 15: Zero-Lift Drag Coefficient, Lift Coefficient at Minimum Sink, Effective Aspect Ratio, Maximum Lift-to-Drag Ratio
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

    // Relation 16: Maximum Lift-to-Drag Ratio, Minimum Drag, Gross Weight
    function liftToDragRatioVariation3(maximum_lift_to_drag_ratio, drag_min, gross_lb) {
        return maximum_lift_to_drag_ratio - gross_lb / drag_min;
    }
    function minimumGlideAngle(maximum_lift_to_drag_ratio) {
        return 360 / Math.TAU / maximum_lift_to_drag_ratio;
    }

    // parametric study - altitude effects
    function powerAltitudeFactor(density_ratio, supercharged) {
        // 
        var c = 0.12,
            density_ratio_factor = 1;

        if (supercharged) {
            if (supercharged.altitude < supercharged.critical_altitude) {
                density_ratio = 1; // return 1
            } else {
                density_ratio_factor = densityRatio(supercharged.critical_altitude);
            }
        }

        return (density_ratio - c) / (density_ratio_factor - c);
    }
    function modifiedDragArea(drag_area_ft, density_ratio, prop_efficiency) {
        // ADm=σADηϕ
        var power_altitude_factor = powerAltitudeFactor(density_ratio);

        return density_ratio * drag_area_ft * prop_efficiency * power_altitude_factor;
    }





    function calculateQuantities(perf) {
        var wing_load_lb_ft = wingLoad(perf.cl_max_clean, perf.vel_stall_clean_mph),
            vel_stall_flaps_mph = velocityStallWithFlaps(wing_load_lb_ft, perf.cl_max_flap), // VS0
            max_speed_lift_coefficient = maxSpeedLiftCoefficient(wing_load_lb_ft, perf.vel_max_mph),
            wing_area_ft = wingArea(wing_load_lb_ft, perf.gross_lb),
            aspect_ratio = aspectRatio(wing_area_ft, perf.wing_span_ft),
            wing_chord_ft = wingChord(wing_area_ft, perf.wing_span_ft),
            plane_efficiency = efficiencyFactor(wing_area_ft, 1 / 0.85, 1.6, 3 * 3), // from Appendix F
            aspect_ratio_effective = effectiveAspectRatio(aspect_ratio, plane_efficiency),
            wing_span_effective = effectiveSpan(perf.wing_span_ft, plane_efficiency),
            wing_load_effective = effectiveSpanLoading(perf.gross_lb, wing_span_effective),
            wing_chord_effective = effectiveChord(wing_area_ft, wing_span_effective),
            drag_area_ft = dragArea_sealevel(perf.vel_max_mph, perf.bhp, perf.prop_efficiency),
            air_density = air(defaults.altitude_ft, constants.temperature_sealevel_f).density,
            density_ratio = densityRatio(defaults.altitude_ft, defaults.temperature_sealevel_f),
            modified_drag_area = modifiedDragArea(drag_area_ft, density_ratio, perf.prop_efficiency),
            available_thrust_horsepower = availableThrustHorsepower(drag_area_ft, perf.vel_max_mph, air_density),
            cd_drag = zeroLiftDragCoefficient(drag_area_ft, wing_area_ft),
            vel_sink_min_ft = minimumSinkRateAirspeed(wing_load_effective, density_ratio, drag_area_ft),
            pwr_min_req_hp = minimumRequiredPower(drag_area_ft, wing_load_effective),
            drag_min = minimumDrag(drag_area_ft, wing_load_effective),
            rate_sink_min_ft = minimumSinkRate(pwr_min_req_hp, perf.gross_lb),
            maximum_lift_to_drag_ratio = maximumLiftToDragRatio(drag_area_ft, wing_span_effective),
            cl_min_sink = liftCoefficientMinimumSink(drag_area_ft, wing_chord_effective),
            rate_climb_ideal = idealRateOfClimb(perf.bhp, perf.gross_lb),
            prop_vel_ref = referencePropellerAirspeed(perf.bhp, perf.prop_dia_ft),
            static_thrust_ideal = idealStaticThrust(perf.bhp, perf.prop_dia_ft),
            prop_tip_mach = propellerTipMachNumber(perf.prop_max_rpm, perf.prop_dia_ft),
            lift_to_drag_min_sink = liftToDragMinimumSink(vel_sink_min_ft, rate_sink_min_ft),
            lift_to_drag_ratio_variation = liftToDragRatioVariation(vel_sink_min_ft, rate_sink_min_ft, maximum_lift_to_drag_ratio),
            lift_coefficient_minimum_sink_variation = liftCoefficientMinimumSinkVariation(aspect_ratio_effective, cd_drag, cl_min_sink),
            lift_to_drag_ratio_variation_2 = liftToDragRatioVariation2(aspect_ratio_effective, cd_drag, maximum_lift_to_drag_ratio),
            lift_to_drag_ratio_variation_3 = liftToDragRatioVariation3(maximum_lift_to_drag_ratio, drag_min, perf.gross_lb),
            minimum_glide_angle = minimumGlideAngle(maximum_lift_to_drag_ratio);
        return {
            wing_load_lb_ft: wing_load_lb_ft,
            vel_stall_flaps_mph: vel_stall_flaps_mph,
            max_speed_lift_coefficient: max_speed_lift_coefficient,
            wing_area_ft: wing_area_ft,
            aspect_ratio: aspect_ratio,
            wing_chord_ft: wing_chord_ft,
            plane_efficiency: plane_efficiency,
            wing_span_effective: wing_span_effective,
            aspect_ratio_effective: aspect_ratio_effective,
            wing_chord_effective: wing_chord_effective,
            wing_load_effective: wing_load_effective,
            drag_area_ft: drag_area_ft,
            air_density: air_density,
            density_ratio: density_ratio,
            modified_drag_area: modified_drag_area,
            available_thrust_horsepower: available_thrust_horsepower,
            cd_drag: cd_drag,
            vel_sink_min_ft: vel_sink_min_ft,
            pwr_min_req_hp: pwr_min_req_hp,
            drag_min: drag_min,
            rate_sink_min_ft: rate_sink_min_ft,
            maximum_lift_to_drag_ratio: maximum_lift_to_drag_ratio,
            cl_min_sink: cl_min_sink,
            rate_climb_ideal: rate_climb_ideal,
            prop_vel_ref: prop_vel_ref,
            prop_tip_mach: prop_tip_mach,
            static_thrust_ideal: static_thrust_ideal,
            lift_to_drag_min_sink: lift_to_drag_min_sink,
            lift_to_drag_ratio_variation: lift_to_drag_ratio_variation,
            lift_coefficient_minimum_sink_variation: lift_coefficient_minimum_sink_variation,
            lift_to_drag_ratio_variation_2: lift_to_drag_ratio_variation_2,
            lift_to_drag_ratio_variation_3: lift_to_drag_ratio_variation_3,
            minimum_glide_angle: minimum_glide_angle
        };
    }

    function nextDeltaAirspeed_alt(v, vel_delta, vel_stall_clean_mph) {
        if (vel_stall_clean_mph) {
            v = Math.max(v, vel_stall_clean_mph);
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

    function calculateStats(v, perf, quantities) {
        var eta = propellerEfficiency(v, quantities.prop_vel_ref) * perf.prop_efficiency,
            rec = reynoldsNumber(v, quantities.wing_chord_ft, defaults.altitude_ft),
            rs = sinkRate(v, quantities.vel_sink_min_ft, quantities.rate_sink_min_ft),
            rc = quantities.rate_climb_ideal * eta - rs;

        return {v: v, rc: rc, eta: eta, rs: rs, rec: rec};
    }

    function getrcmax(stats) {
        return stats.reduce(function (prev, next) {
            return Math.max(prev, next.rc);
        }, 0);
    }

    function performanceParameter(v, stats, useful_load_lb, bhp, vel_stall_flaps_mph) {
        var constant = constants.convert.ft_lb_min_to_horsepower;

        console.log((getrcmax(stats) * useful_load_lb) / (constant * bhp) * (1 - (vel_stall_flaps_mph / v)));
        return (getrcmax(stats) * useful_load_lb) / (constant * bhp) * (1 - (vel_stall_flaps_mph / v));
    }

    function kineticEnergyParameter(v, gross_lb) {
        return gross_lb * Math.pow(v, 2);
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

        form.elements.vel_stall_clean_mph.value = perf.vel_stall_clean_mph.toFixed(1);
        form.elements.cl_max_clean.value = perf.cl_max_clean.toFixed(3);
        form.elements.cl_max_flap.value = perf.cl_max_flap.toFixed(3);
        form.elements.gross_lb.value = perf.gross_lb.toFixed(0);
        form.elements.useful_load_lb.value = perf.useful_load_lb.toFixed(0);
        form.elements.wing_span_ft.value = perf.wing_span_ft.toFixed(2);
        form.elements.bhp.value = perf.bhp.toFixed(0);
        form.elements.vel_max_mph.value = perf.vel_max_mph.toFixed(1);
        form.elements.prop_dia_in.value = perf.prop_dia_in.toFixed(1);
        form.elements.prop_max_rpm.value = perf.prop_max_rpm.toFixed(0);
        form.elements.prop_efficiency.value = perf.prop_efficiency.toFixed(2);
        form.elements.chord_length.value = perf.chord_length.toFixed(0);
        form.elements.minimum_section_drag_coefficient.value = perf.minimum_section_drag_coefficient.toFixed(3);
        form.elements.aerodynamic_centre.value = perf.aerodynamic_centre.toFixed(3);
        form.elements.altitude_ft.value = defaults.altitude_ft.toFixed(0);
    }

    function updateQuantities(quantities) {
        document.getElementById('wing_load_lb_ft').innerHTML = quantities.wing_load_lb_ft.toFixed(3);
        document.getElementById('vel_stall_flaps_mph').innerHTML = quantities.vel_stall_flaps_mph.toFixed(1);
        document.getElementById('max_speed_lift_coefficient').innerHTML = quantities.max_speed_lift_coefficient.toFixed(2);
        document.getElementById('wing_area_ft').innerHTML = quantities.wing_area_ft.toFixed(1);
        document.getElementById('aspect_ratio').innerHTML = quantities.aspect_ratio.toFixed(2);
        document.getElementById('wing_chord_ft').innerHTML = quantities.wing_chord_ft.toFixed(2);
        document.getElementById('aspect_ratio_effective').innerHTML = quantities.aspect_ratio_effective.toFixed(2);
        document.getElementById('plane_efficiency').innerHTML = quantities.plane_efficiency.toFixed(3);
        document.getElementById('wing_span_effective').innerHTML = quantities.wing_span_effective.toFixed(2);
        document.getElementById('wing_chord_effective').innerHTML = quantities.wing_chord_effective.toFixed(2);
        document.getElementById('wing_load_effective').innerHTML = quantities.wing_load_effective.toFixed(2);
        document.getElementById('drag_area_ft').innerHTML = quantities.drag_area_ft.toFixed(2);
        document.getElementById('cd_drag').innerHTML = quantities.cd_drag.toFixed(4);
        document.getElementById('vel_sink_min_ft').innerHTML = quantities.vel_sink_min_ft.toFixed(1);
        document.getElementById('pwr_min_req_hp').innerHTML = quantities.pwr_min_req_hp.toFixed(2);
        document.getElementById('available_thrust_horsepower').innerHTML = quantities.available_thrust_horsepower.toFixed(1);
        document.getElementById('drag_min').innerHTML = quantities.drag_min.toFixed(1);
        document.getElementById('rate_sink_min_ft').innerHTML = quantities.rate_sink_min_ft.toFixed(1);
        document.getElementById('maximum_lift_to_drag_ratio').innerHTML = quantities.maximum_lift_to_drag_ratio.toFixed(2);
        document.getElementById('cl_min_sink').innerHTML = quantities.cl_min_sink.toFixed(2);
        document.getElementById('rate_climb_ideal').innerHTML = quantities.rate_climb_ideal.toFixed(1);
        document.getElementById('prop_vel_ref').innerHTML = quantities.prop_vel_ref.toFixed(1);
        document.getElementById('static_thrust_ideal').innerHTML = quantities.static_thrust_ideal.toFixed(1);
        document.getElementById('prop_tip_mach').innerHTML = quantities.prop_tip_mach.toFixed(4);
        document.getElementById('lift_to_drag_min_sink').innerHTML = quantities.lift_to_drag_min_sink.toFixed(1);
        document.getElementById('lift_to_drag_ratio_variation').innerHTML = quantities.lift_to_drag_ratio_variation;
        document.getElementById('lift_coefficient_minimum_sink_variation').innerHTML = quantities.lift_coefficient_minimum_sink_variation;
        document.getElementById('lift_to_drag_ratio_variation_2').innerHTML = quantities.lift_to_drag_ratio_variation_2;
        document.getElementById('lift_to_drag_ratio_variation_3').innerHTML = quantities.lift_to_drag_ratio_variation_3;
        document.getElementById('minimum_glide_angle').innerHTML = quantities.minimum_glide_angle;
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

    function drawAirspeedPerformance(results) {
        var chartData = [
            ['Airspeed', 'Rate of Climb', 'Prop Efficiency (*1,000)', 'Sink Rate', 'Reynolds No. (/10,000)']
        ],
            calculatedResults = results.calculated,
            result,
            i,
            data,
            ac;

        for (i = 0; i < calculatedResults.length; i += 1) {
            result = calculatedResults[i];
            chartData.push([result.v, result.rc, result.eta * 1000, result.rs, result.rec / 10000]);
        }

        data = google.visualization.arrayToDataTable(chartData);
        ac = new google.visualization.LineChart(document.getElementById('airspeedperformance'));
        ac.draw(data, {
            title : 'Performance metrics based on Airspeed',
            curveType: 'none',
            width: 600,
            height: 400,
            vAxis: {title: "rc, eta, rs, rec"}, // hAxis: { ticks: [5,10,15,20] }
            hAxis: {title: "Airspeed, V (mph)"}

        });
    }

    function updateCharts(results) {
        drawAirspeedPerformance(results);
    }

    function calculateResults(perf, quantities) {
        var v = perf.vel_stall_clean_mph,
            vel_delta = defaults.vel_delta,
            stats = {},
            imax = false,
            rc = 0,
            rcold,
            calculated = [],
            summaries = {};

        do {
            rcold = stats.rc || rc;
            stats = calculateStats(v, perf, quantities);
            if (stats.rc > 0) {
                calculated.push(stats);
                if (!imax) {
                    v = nextDeltaAirspeed_alt(v, vel_delta, perf.vel_stall_clean_mph);
                }
            } else {
                v = finalAirspeed(v, vel_delta, stats.rc, rcold);
                imax = true;
            }
        } while (imax === false || stats.rc <= 0);

        summaries = {
            fp: performanceParameter(v, calculated, perf.useful_load_lb, perf.bhp, quantities.vel_stall_flaps_mph),
            wv2: kineticEnergyParameter(v, perf.gross_lb)
        };

        return {
            calculated: calculated,
            summaries: summaries
        };
    }

    function main(performance) {
        quantities = calculateQuantities(performance);
        window.p = {
            name: "Thorp T-18 (Default)",
            vs0: performance.vel_stall_clean_mph, // VS1
            clmax: performance.cl_max_clean,
            clmaxf: performance.cl_max_flap,
            w: performance.gross_lb,
            wu: performance.useful_load_lb,
            b: performance.wing_span_ft,
            bhp: performance.bhp,
            vmax: performance.vel_max_mph,
            dp: performance.prop_dia_in,
            rpm: performance.prop_max_rpm,
            pe: performance.prop_efficiency
        };
        window.q = {
            ws: quantities.wing_load_lb_ft,
            vs0: quantities.vel_stall_flaps_mph,
            clmaxv: quantities.max_speed_lift_coefficient,
            s: quantities.wing_area_ft,
            ar: quantities.aspect_ratio,
            c: quantities.wing_chord_ft,
            e: quantities.plane_efficiency,
            be: quantities.wing_span_effective,
            ear: quantities.aspect_ratio_effective,
            ce: quantities.wing_chord_effective,
            wbe: quantities.wing_load_effective,
            ad: quantities.drag_area_ft,
            p: quantities.air_density,
            rho: quantities.density_ratio,
            mad: quantities.modified_drag_area,
            thp: quantities.available_thrust_horsepower,
            cd0: quantities.cd_drag,
            vmins: quantities.vel_sink_min_ft,
            thpmin: quantities.pwr_min_req_hp,
            dmin: quantities.drag_min,
            rsmin: quantities.rate_sink_min_ft,
            ldmax: quantities.maximum_lift_to_drag_ratio,
            clmins: quantities.cl_min_sink,
            rcmax: quantities.rate_climb_ideal,
            vprop: quantities.prop_vel_ref,
            mp: quantities.prop_tip_mach,
            ts: quantities.static_thrust_ideal,
            ldmins: quantities.lift_to_drag_min_sink,
            ldmaxv: quantities.lift_to_drag_ratio_variation,
            clminsv: quantities.lift_coefficient_minimum_sink_variation,
            ldmaxv2: quantities.lift_to_drag_ratio_variation_2,
            ldmaxv3: quantities.lift_to_drag_ratio_variation_3,
            dg: quantities.minimum_glide_angle
        };
        updatePerformance(performance);
        updateQuantities(quantities);

        defaults.vel_delta = 10;
        results = calculateResults(performance, quantities);
        updateResults(results);

        defaults.vel_delta = 1;
        results = calculateResults(performance, quantities);
        updateCharts(results);
    }

    document.getElementById('perf').onsubmit = function () {
        var form = document.getElementById('perf'),
            perf = {};

        perf.name = form.elements.name.value || '';
        perf.vel_stall_clean_mph = Number(form.elements.vel_stall_clean_mph.value) || 0;
        perf.cl_max_clean = Number(form.elements.cl_max_clean.value) || 0;
        perf.cl_max_flap = Number(form.elements.cl_max_flap.value) || 0;
        perf.gross_lb = Number(form.elements.gross_lb.value) || 0;
        perf.useful_load_lb = Number(form.elements.useful_load_lb.value) || 0;
        perf.wing_span_ft = Number(form.elements.wing_span_ft.value) || 0;
        perf.bhp = Number(form.elements.bhp.value) || 0;
        perf.vel_max_mph = Number(form.elements.vel_max_mph.value) || 0;
        perf.prop_dia_in = Number(form.elements.prop_dia_in.value) || 0;
        perf.prop_dia_ft = Number(form.elements.prop_dia_in.value / 12) || 0;
        perf.prop_max_rpm = Number(form.elements.prop_max_rpm.value) || 0;
        perf.prop_efficiency = Number(form.elements.prop_efficiency.value) || 0;
        perf.chord_length = Number(form.elements.chord_length.value) || 0;
        perf.minimum_section_drag_coefficient = Number(form.elements.minimum_section_drag_coefficient.value) || 0;
        perf.aerodynamic_centre = Number(form.elements.aerodynamic_centre.value) || 0;
        defaults.altitude_ft = Number(form.elements.altitude_ft.value) || 0;
        main(perf);
        return false;
    };
    document.getElementById('perf').onchange = function () {
        this.onsubmit();
    };

    if (!Math.TAU) {
        Math.TAU = Math.PI * 2;
    }

    defaults = {
        altitude_ft: 0.00,
        temperature_sealevel_f: 58.7,
        prop_efficiency: 80 / 100, // 80% estimate
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
    constants.fahrenheit_to_rankin = 459.67; // from absolute zero
    constants.temperature_lapse_rate = 0.00356; // Rankine per 1000 feet
    constants.gas_constant_air = 1718; // ft^2/sec^2
    constants.air_density_slug = 0.002377;
    constants.air = {};
    constants.speed_of_sound = 1100; // feet per second
    constants.circumference_proportion = Math.TAU;
    // using a unit square of length 1, resulting in a radius of 0.5
    constants.square_length_of_circle_area = Math.sqrt(0.5 * Math.TAU * Math.pow(0.5, 2)); // using triangular area
    constants.dynamic_pressure_from_mph = 0.5 * constants.air_density_slug * Math.pow(constants.convert.mph_to_fps, 2);

    main(performance);
//}());