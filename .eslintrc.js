module.exports = {
  "extends": "eslint:recommended",
  "rules": {
    // enable additional rules
    "indent": ["error", 4],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],

    // override configuration set by extending "eslint:recommended"
    "no-empty": "warn",
    "no-cond-assign": ["error", "always"],

    // disable rules from base configurations
    "for-direction": "off",
    "no-irregular-whitespace": "off",
    "no-unused-vars": "off",
  },
};