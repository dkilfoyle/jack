export const outputBuiltin = `/**
 * A library of functions for writing text on the screen.
 * The Hack physical screen consists of 512 rows of 256 pixels each.
 * The library uses a fixed font, in which each character is displayed 
 * within a frame which is 11 pixels high (including 1 pixel for inter-line 
 * spacing) and 8 pixels wide (including 2 pixels for inter-character spacing).
 * The resulting grid accommodates 23 rows (indexed 0..22, top to bottom)
 * of 64 characters each (indexed 0..63, left to right). The top left 
 * character position on the screen is indexed (0,0). A cursor, implemented
 * as a small filled square, indicates where the next character will be displayed.
 */
class Output {

    // Character map for displaying characters
    static Array charMaps;
    static int charHeight;
    static int cursorX, cursorY;
    static int maxX, maxY;

    /** Initializes the screen, and locates the cursor at the screen's top-left. */
    function void init() {}

    // Initializes the character map array
    function void initMap() {}

    // Creates the character map array of the given character index, using the given values.
    function void create(int index, int a, int b, int c, int d, int e,
                         int f, int g, int h, int i, int j, int k) {}
    
    // Returns the character map (array of size 11) of the given character.
    // If the given character is invalid or non-printable, returns the
    // character map of a black square.
    function Array getMap(char c) {}

    /** Moves the cursor to the j-th column of the i-th row,
     *  and erases the character displayed there. */
    function void moveCursor(int i, int j) {}

    // 16 % 8 = 0
    // 16 / 8 = 2, 16 - (8 * 2);
    function int mod(int x, int y) {}

    /** Displays the given character at the cursor location,
     *  and advances the cursor one column forward. */
    function void printChar(char c) {}

    /** displays the given string starting at the cursor location,
     *  and advances the cursor appropriately. */
    function void printString(String s) {}

    /** Displays the given integer starting at the cursor location,
     *  and advances the cursor appropriately. */
    function void printInt(int i) {}

    /** Advances the cursor to the beginning of the next line. */
    function void println() {}

    /** Moves the cursor one column back. */
    function void backSpace() {}
}`;
