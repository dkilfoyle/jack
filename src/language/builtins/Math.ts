export const mathBuiltin = `class Math {
    static int powers_of_two;

    /** Initializes the library. */
    function void init() {}

    function boolean bit(int x, int n) {}

    function int two_to_the(int power) {}

    /** Math.abs(int x): Returns the absolute value of x.
     * @param {int} x - input value
     * @return {int} abs(x)
    */
    function int abs(int x) {}

    /** Returns the product of x and y.
     *  When a Jack compiler detects the multiplication operator '*' in the
     *  program's code, it handles it by invoking this method. In other words,
     *  the Jack expressions x*y and multiply(x,y) return the same value.
     */
    function int multiply(int x, int y) {}

    /** Returns the integer part of x/y.
     *  When a Jack compiler detects the multiplication operator '/' in the
     *  program's code, it handles it by invoking this method. In other words,
     *  the Jack expressions x/y and divide(x,y) return the same value.
     */
    function int divide(int x, int y) {}

    function int pow(int x, int n) {}

    /** Returns the integer part of the square root of x. */
    function int sqrt(int x) {}

    /** Returns the greater number. */
    function int max(int a, int b) {}

    /** Returns the smaller number. */
    function int min(int a, int b) {}
}`;
