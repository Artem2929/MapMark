/**
 * Utility function to combine class names
 * @param {...(string|object|array)} classes - Class names to combine
 * @returns {string} Combined class names
 */
export function classNames(...classes) {
  return classes
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.keys(cls).filter(key => cls[key]).join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

/**
 * Create BEM class name generator
 * @param {string} block - Block name
 * @returns {function} BEM class generator
 */
export function createBEM(block) {
  return (element, modifier) => {
    let className = block;
    if (element) className += `__${element}`;
    if (modifier) className += `--${modifier}`;
    return className;
  };
}