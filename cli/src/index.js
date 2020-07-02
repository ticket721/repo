const { program } = require('commander');
const repo = require('./repo');
const ci = require('./ci')
const packageJson = require('../../package.json');

program
    .name('t721cli')
    .version(packageJson.version);

repo(program);
ci(program)

program.parse(process.argv);
