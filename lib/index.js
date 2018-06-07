const { promisify } = require('util')

/**
 * Adds a to b
 *
 * @example
 * // returns 5
 * add(2, 5)
 *
 * @param {number} a - The first summand
 * @param {number} b - The second summand
 *
 * @returns {number} Returns the sum.
 */
module.exports.add = async (a, b) => {
  await promisify(setTimeout)(100)
  return a + b
}
