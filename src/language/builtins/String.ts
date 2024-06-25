export const stringBuiltin = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/12/String.jack

/**
 * Represents character strings. In addition for constructing and disposing
 * strings, the class features methods for getting and setting individual
 * characters of the string, for erasing the string's last character,
 * for appending a character to the string's end, and more typical
 * string-oriented operations.
 */
class String {
    field Array str;
    field int length;
    field int capacity;

    /** constructs a new empty string with a maximum length of maxLength
     *  and initial length of 0. */
    constructor String new(int maxLength) {}

    /** Disposes this string. */
    method void dispose() {}

    /** Returns the current length of this string. */
    method int length() {}

    /** Returns the character at the j-th location of this string. */
    method char charAt(int j) {}

    /** Sets the character at the j-th location of this string to c. */
    method void setCharAt(int j, char c) {}

    /** Appends c to this string's end and returns this string. */
    method String appendChar(char c) {}

    /** Erases the last character from this string. */
    method void eraseLastChar() {}

    /** Returns the integer value of this string,
     *  until a non-digit character is detected. */
    method int intValue() {}

    /** Sets this string to hold a representation of the given value. */
    method void setInt(int val) {}

    /** Returns the new line character. */
    function char newLine() {}

    /** Returns the backspace character. */
    function char backSpace() {}

    /** Returns the double quote (") character. */
    function char doubleQuote() {}
}`;
