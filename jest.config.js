export default {
  verbose: false,
  transformIgnorePatterns: ['<rootDir>/node_modules'],
  modulePathIgnorePatterns: ['tinytick/package.json'], // tests use ./dist
  transform: {'^.+\\.(mjs|js|jsx|ts|tsx)?$': 'babel-jest'},
};
