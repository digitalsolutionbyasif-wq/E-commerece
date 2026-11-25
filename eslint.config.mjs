import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '.gmp_cache/**/*', 'functions/**/*'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
