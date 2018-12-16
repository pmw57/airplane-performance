/*jslint browser:true */
/*global
    describe, describe, beforeEach, it, xit, expect,
    aircraftFormulas, relation
*/
(function () {
    "use strict";
    describe("Aircraft formula relations", function () {
        it("uses an appropriate formula for each relation", function () {
            expect(relation[1]).toEqual(aircraftFormulas[7]);
            expect(relation[2]).toEqual(aircraftFormulas[7]);
            expect(relation[3]).toEqual(aircraftFormulas[14]);
        });
    });
}());
