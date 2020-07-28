module.exports = {
  apps : [{
      name: 'global',
      script: 'yarn watch',
      cwd: 'modules/@common_global'
  }, {
      name: 'sdk',
      script: 'yarn watch',
      cwd: 'modules/@common_sdk'
  }, {
      name: 'core',
      script: 'yarn watch',
      cwd: 'modules/@frontend_core'
  }, {
      name: 'flib',
      script: 'yarn watch',
      cwd: 'modules/@frontend_flib-react'
  }]
};
