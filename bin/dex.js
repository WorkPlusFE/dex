#!/usr/bin/env node

const commander = require('commander');
const shell = require('shelljs');
const path = require('path');
const { format } = require('date-fns');
const pkg = require('../package.json');
const program = new commander.Command();

let currentProjectPkg = {
  name: 'update',
};
try {
  currentProjectPkg = require(path.join(process.cwd(), '/package.json'));
} catch (error) {
  // nothing
}
const defaultZipName = `${currentProjectPkg.name}-${format(Date.now(), 'yyyyMMdd')}.zip`;

program.exitOverride((err) => {
  if (err.code === 'commander.missingArgument') {
    console.log('');
    program.outputHelp();
  }
  process.exit(err.exitCode);
});

program
  .version(pkg.version, '-v, --version')
  .arguments('<new-version> [old-version] [zip-name]')
  .description('Diff different commits of git and export incremental packages')
  .action((newVersion, oldVersion, name) => {
    if (typeof name === 'undefined') {
      name = defaultZipName;
    }
    if (name.indexOf('.zip') < 0) {
      name += '.zip';
    }
    console.log('');
    const commitIds = oldVersion ? `${newVersion} ${oldVersion}` : newVersion;
    shell.exec(`git diff ${commitIds} --name-only | xargs zip ${name}`);
    console.log(`\n  🆒 Done! your zip file -> ${name}`);
  });

program.parse(process.argv);
