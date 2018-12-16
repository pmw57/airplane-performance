<!--Define JavaScript functions.-->

function PolyReSolve(dataForm){				// Function for inputting and solving a Real Polynomial

var dataFormElements = dataForm.elements; 	// Reference to the form elements array.
var vecDim = dataForm.elements.length;   		// Number of coefficients
var errCodeOutFlag;						// Flag to indicate if Error Code should be output
vecDim--;
var coeffVec = new Array(vecDim);  			//  Vector of the coefficients of the polynomial

if (vecDim == 3){
  errCodeOutFlag = 99;						// If polynomial is a quadratic, do not output error code
} // End if (vecDim == 3)

var POLYDEGREE = vecDim;				//  Degree of the polynomial accepted by this script
POLYDEGREE--;

var tempx = 0.0;							//  Dummy double variable

for (var i = 0; i < vecDim; i++) {
  tempx = parseFloat(dataFormElements[i].value);
  if (!isNaN(tempx)){ // Field contains a valid number; otherwise ignore
    coeffVec[i] = tempx;
  }//End if !isNaN
  else {
    alert("Invalid input for data field " + (i + 1) + ".");
    return;
  }
} // End for i loop

// ****************************  At this point,
// ****************************  POLYDEGREE is the degree of the polynomial for which roots are to be found, and
// ****************************  coeffVec contains the coefficients of the polynomial

// Check for leading zeros.
 
 while ((coeffVec[0] == 0) && (POLYDEGREE > 0)){
   for (var i = 0; i < POLYDEGREE; i++) {
     coeffVec[i] = coeffVec[i + 1];
   } // End for i
   POLYDEGREE--;
 } // End while (coeffVec[0] == 0)

 if (POLYDEGREE == 0 ){
   alert("Polynomial degree is 0. No further action taken.");
   return;
 }
 
var zeror = new Array(POLYDEGREE);   // Vector of real components of roots
var zeroi = new Array(POLYDEGREE);   // Vector of imaginary components of roots

var degreePar = new Object();    // degreePar is a dummy variable for passing the parameter Degree by reference

degreePar.Degree = POLYDEGREE;

for (var i = 0; i < POLYDEGREE; i++) {
  zeroi[i] = zeror[i] = 0;
}// End for i loop

rpSolve(degreePar, coeffVec, zeror, zeroi);
POLYDEGREE = degreePar.Degree;

complexVecOut(errCodeOutFlag, POLYDEGREE, zeror, zeroi);

return;
}  //End of PolyReSolve

// end of JavaScript-->