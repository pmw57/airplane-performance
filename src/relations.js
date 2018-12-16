/*jslint browser:true */
/*globals solvePoly, aircraftFormulas, Solver, aircraftSolver */
var formulas = aircraftFormulas(window.CONSTANTS, solvePoly),
    aircraftFormulas = aircraftSolver(Solver, formulas),
    relation = [
        [
            aircraftFormulas.d[12]
        ],
        [ // Lift Coefficient, Airspeed, Wing Loading - CL, V, W/S
            aircraftFormulas[7]
        ],
        [ // Relation 2: Wing Area, Wing Loading, Gross Weight - S, W/S, W
            aircraftFormulas[7],
            aircraftFormulas[14]
        ],
        [ // (3) Relation 3: Wing Area, Effective Span, Effective Aspect Ratio, Effective Chord - S, be, eAR, ce
            aircraftFormulas[14],
            aircraftFormulas.f[9],
            aircraftFormulas[15],
            aircraftFormulas[19]
        ],
        [ // Relation 4: Effective Span, Effective Span Loading, Gross Weight - be, W/be, W
            aircraftFormulas[20],
            aircraftFormulas[21]
        ],
        [ // Relation 5: Drag Area, Maximum Level Speed, Available Thrust Horsepower - AD, Vmax, THPa
            aircraftFormulas[31]
        ],
        [ // (19) Relation 6: Zero-Lift Drag Coefficient, Drag Area, Wing Area
            aircraftFormulas[19]
        ],
        [ // (21) (30) (33) Relation 7: Drag Area, Airspeed for Minimum Sink, Effective Span Loading, Minimum Power Required for Level Flight, Minimum Drag
            aircraftFormulas[21],
            aircraftFormulas[30],
            aircraftFormulas[33]
        ],
        [ // (33) Relation 8: Minimum Sink Rate, Minimum Power Required for Level Flight, Weight
            aircraftFormulas[20]
        ],
        [ // Relation 9: Drag Area, Effective Span, Maximum Lift-to-Drag Ratio
            aircraftFormulas[29]
        ],
        [ // Relation 10: Drag Area, Lift Coefficient at Minimum Sink, Effective Chord
            aircraftFormulas[19]
        ],
        // Power Available relationships
        [ // (38) Relation 11: Weight, Engine Brake Horsepower, Ideal Maximum Rate of Climb
            aircraftFormulas[38]
        ],
        [ // (51) (61) Relation 12: Static Thrust, Engine Brake Horsepower, Reference Propeller Airspeed for 74% Efficiency, Propeller Diameter
            aircraftFormulas[51],
            aircraftFormulas[61]
        ],
        // (64) Relation 13: Propeller Diameter, Propeller Rotational Speed, Propeller Tip Mach Number
        [
            aircraftFormulas[64]
        ]
        // Cross Checks
        // Relation 14: Airspeed for Minimum Sink Rate, Minimum Sink Rate, Maximum Lift-to-Drag
        // Consistency check for Relations 7: VminS, 8: RS,min, and 9: (L/D)max
        // (18) (28) Relation 15: Zero-Lift Drag Coefficient, Lift Coefficient at Minimum Sink, Effective Aspect Ratio, Maximum Lift-to-Drag Ratio
        // Relation 16: Maximum Lift-to-Drag Ratio, Minimum Drag, Gross Weight
    ];
