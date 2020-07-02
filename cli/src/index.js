const { program } = require('commander');
const repo = require('./repo');
const packageJson = require('../../package.json');

program
    .name('t721cli')
    .version(packageJson.version);

repo(program);

program.parse(process.argv);
