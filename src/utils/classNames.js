/**
 * Utility function to combine CSS class names
 * @param {...(string|object|array)} classes - Class names to combine
 * @returns {string} Combined class names
 */
export function classNames(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, condition]) => condition)
          .map(([className]) => className)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

/**
 * BEM utility for creating BEM class names
 * @param {string} block - Block name
 * @param {string} [element] - Element name
 * @param {string|object} [modifier] - Modifier name or object with modifiers
 * @returns {string} BEM class name
 */
export function bem(block, element, modifier) {
  let className = block;
  
  if (element) {
    className += `__${element}`;
  }
  
  if (modifier) {
    if (typeof modifier === 'string') {
      className += `--${modifier}`;
    } else if (typeof modifier === 'object') {
      const modifiers = Object.entries(modifier)
        .filter(([, condition]) => condition)
        .map(([mod]) => `${className}--${mod}`)
        .join(' ');
      
      if (modifiers) {
        className += ` ${modifiers}`;
      }
    }
  }
  
  return className;
}

/**
 * Create a BEM class generator for a specific block
 * @param {string} block - Block name
 * @returns {function} BEM generator function
 */
export function createBEM(block) {
  return (element, modifier) => bem(block, element, modifier);
}

// Example usage:
// const btnClass = createBEM('btn');
// btnClass() // 'btn'
// btnClass(null, 'primary') // 'btn--primary'
// btnClass('icon') // 'btn__icon'
// btnClass('icon', 'large') // 'btn__icon--large'