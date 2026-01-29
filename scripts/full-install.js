const fs = require('fs');
const { execSync } = require('child_process');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;
const packageName = packageJson.name;
const vsixFile = `${packageName}-${version}.vsix`;

console.log(`Removing ${vsixFile}...`);

try {
  execSync(`rimraf "${vsixFile}"`, { stdio: 'inherit' });
  console.log('Successfully removed old package');
} catch (error) {
  console.log('No old package to remove or removal failed');
}

console.log('Creating new package...');
execSync('vsce package', { stdio: 'inherit' });

console.log(`Installing ${vsixFile}...`);
execSync(`code --install-extension "${vsixFile}"`, { stdio: 'inherit' });

console.log('Full install completed successfully!');
