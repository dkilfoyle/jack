export const screenBuiltin = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/12/Screen.jack

/**
 * A library of functions for displaying graphics on the screen.
 * The Hack physical screen consists of 512 rows (indexed 0..511, top to bottom)
 * of 256 pixels each (indexed 0..255, left to right). The top left pixel on 
 * the screen is indexed (0,0).
 */
class Screen {
    static bool black;
    static Array screen;
    static int powers_of_two; // in order to use the built-in Math API

    /** Initializes the Screen. */
    function void init() {}

    /** Erases the entire screen. */
    function void clearScreen() {}

    /** Sets the current color, to be used for all subsequent drawXXX commands.
     *  Black is represented by true, white by false. */
    function void setColor(boolean b) {}

    /** Draws the (x,y) pixel, using the current color. */
    function void drawPixel(int x, int y) {}

    /** Draws a line from pixel (x1,y1) to pixel (x2,y2), using the current color. */
    function void drawLine(int x1, int y1, int x2, int y2) {}

    function void drawHorizontalLine(int x1, int x2, int y) {}

    function void drawVerticalLine(int y1, int y2, int x) {}

    /** Draws a filled rectangle whose top left corner is (x1, y1)
     * and bottom right corner is (x2,y2), using the current color. */
    function void drawRectangle(int x1, int y1, int x2, int y2) {}

    /** Draws a filled circle of radius r<=181 around (x,y), using the current color. */
    function void drawCircle(int x, int y, int r) {}
}`;
