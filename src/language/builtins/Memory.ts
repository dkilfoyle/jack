export const memoryBuiltin = `/**
 * This library provides two services: direct access to the computer's main
 * memory (RAM), and allocation and recycling of memory blocks. The Hack RAM
 * consists of 32,768 words, each holding a 16-bit binary number.
 */
class Memory {
    static Array ram;
    static Array heap;
    static int freelist;

    /** Initializes the class. */
    function void init() {}

    /** Returns the RAM value at the given address. */
    function int peek(int address) {}

    /** Sets the RAM value at the given address to the given value. */
    function void poke(int address, int value) {}

    /** Finds an available RAM block of the given size and returns
     *  a reference to its base address. */
    function int alloc(int size) {}

    /** De-allocates the given object (cast as an array) by making
     *  it available for future allocations. */
    function void deAlloc(Array o) {}
}`;
