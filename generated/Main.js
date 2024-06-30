// File 
// Class Main
// Class level symbol table
function Main.main(
  // Method Main.main( Symbol Table
  // a:class - local [0]
  // length:number - local [1]
  // i:number - local [2]
  // sum:number - local [3]
  // let i = 0;
  push constant 0
  pop local 2 // i
  // if (i==0)
  push local 2 // i
  push constant 0
  not
  if-goto LIF0_ELSE
  // let sum = 2;
  push constant 2
  pop local 3 // sum
  goto LIF0_END
  label LIF0_ELSE
    // let sum = 3;
    push constant 3
    pop local 3 // sum
  label LIF0_END  
  Return
