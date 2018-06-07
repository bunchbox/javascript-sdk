export default {
  ava: {
    files: ['lib/**/*.js'],
    sources: ['**/*.{js,jsx}'],
    cache: true,
    concurrency: 4,
    failFast: false,
    failWithoutAssertions: true,
    tap: true,
    compileEnhancements: false,
    require: []
  }
}
