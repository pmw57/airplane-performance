/*globals aircraftFormulas */
var relation = [
    undefined,
    aircraftFormulas[7],  // Lift Coefficient, Airspeed, Wing Loading - CL, V, W/S
    aircraftFormulas[14]  // Relation 2: Wing Area, Wing Loading, Gross Weight - S, W/S, W
    // Relation 3: Wing Area, Effective Span, Effective Aspect Ratio, Effective Chord - S, be, eAR, ce
    // Relation 4: Effective Span, Effective Span Loading, Gross Weight - be, W/be, W
    // Relation 5: Drag Area, Maximum Level Speed, Available Thrust Horsepower - AD, Vmax, THPa
    // Relation 6: Zero-Lift Drag Coefficient, Drag Area, Wing Area
    // Relation 7: Drag Area, Airspeed for Minimum Sink, Effective Span Loading, Minimum Power Required for Level Flight, Minimum Drag
    // Relation 8: Minimum Sink Rate, Minimum Power Required for Level Flight, Weight
    // Relation 9: Drag Area, Effective Span, Maximum Lift-to-Drag Ratio
    // Relation 10: Drag Area, Lift Coefficient at Minimum Sink, Effective Chord

    // Power Available relationships
    // Relation 11: Weight, Engine Brake Horsepower, Ideal Maximum Rate of Climb
    // Relation 12: Static Thrust, Engine Brake Horsepower, Reference Propeller Airspeed for 74% Efficiency, Propeller Diameter
    // Relation 13: Propeller Diameter, Propeller Rotational Speed, Propeller Tip Mach Number

    // Cross Checks
    // Relation 14: Airspeed for Minimum Sink Rate, Minimum Sink Rate, Maximum Lift-to-Drag
    // Consistency check for Relations 7: VminS, 8: RS,min, and 9: (L/D)max
    // Relation 15: Zero-Lift Drag Coefficient, Lift Coefficient at Minimum Sink, Effective Aspect Ratio, Maximum Lift-to-Drag Ratio
    // Relation 16: Maximum Lift-to-Drag Ratio, Minimum Drag, Gross Weight
];
relation.d = aircraftFormulas.d[12];
