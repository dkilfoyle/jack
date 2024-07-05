const chars = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_~abcdefghijklmnopqrstuvwxyz{|}`;
export const charCodes: Record<string, number> = {};
chars.split("").forEach((c, i) => {
  charCodes[c] = i + 32;
});
