/**
 * Test whether a value is a hex color string (#rgb or #rrggbb).
 *
 * Marker colors arrive either as a predefined "marker-<name>" class or, when a
 * custom color is configured in the backend, as a raw hex value. This helper
 * lets the color consumers tell the two apart.
 *
 * @param {*} value The value to test.
 * @returns {boolean} Whether the value is a hex color.
 */
export const isHexColor = (value) =>
  typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
