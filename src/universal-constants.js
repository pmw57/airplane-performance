/*jslint browser:true */

// universal constants
window.CONSTANTS = {
    GRAVITATIONAL_CONSTANT: 32.1740, // ft/sec^2
    UNIVERSAL_GAS_CONSTANT: 1718, // ft^2/sec^2
    AVERAGE_SEALEVEL_FAHRENHEIT: 58.7, // F
    FAHRENHEIT_TO_RANKIN: 459.67, // from absolute zero
    TEMPERATURE_LAPSE_RATE: 0.00356 // Rankine per 1000 feet
};

// standard notation
window.CONSTANTS.G = window.CONSTANTS.GRAVITATIONAL_CONSTANT;
window.CONSTANTS.R = window.CONSTANTS.UNIVERSAL_GAS_CONSTANT;
window.CONSTANTS.TSL = window.CONSTANTS.AVERAGE_SEALEVEL_FAHRENHEIT;
window.CONSTANTS.BETA = window.CONSTANTS.TEMPERATURE_LAPSE_RATE; // Rankine per 1000 feet
