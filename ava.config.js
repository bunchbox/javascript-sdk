export default {
  files: ['test/**/*.js', '!test/tapes/*.js'],
  sources: ['lib/**/*.js'],
  cache: true,
  concurrency: 4,
  failFast: false,
  failWithoutAssertions: true,
  tap: true,
  compileEnhancements: true
}
