// File 
// Class Main
// Class level symbol table
function Main.main 0
  // Method Main.main Symbol Table
  // Output.printInt(1 + (2 * 3))
  // TODO: ? handling of this
  push constant 1
  push constant 2
  push constant 3
  call Math.multiply 2
  add
  call Output.printInt 1
  pop temp 0
  push constant 0
  Return
