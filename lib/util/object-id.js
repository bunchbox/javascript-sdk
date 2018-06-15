/**
 * Generates an ObjectId
 * @return {string} the generated ObjectId
 */
module.exports = () => {
  return (
    ((new Date().getTime() / 1000) | 0).toString(16) +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16))
      .toLowerCase()
  )
}
