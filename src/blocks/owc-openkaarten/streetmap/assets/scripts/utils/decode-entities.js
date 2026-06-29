/**
 * Decode HTML entities in a string.
 *
 * WordPress REST responses often deliver already-encoded titles (e.g. `&amp;`,
 * `&#039;`). Vue's `{{ }}` interpolation escapes HTML but does not decode such
 * entities, so without this they would render literally. A detached <textarea>
 * is used because it decodes entities without executing or rendering any markup.
 *
 * @param {string} [str] The (possibly entity-encoded) string.
 * @returns {string} The decoded string.
 */
export const decodeEntities = (str = '') => {
  if (typeof str !== 'string' || str === '') return str;

  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
};
