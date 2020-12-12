const fs = require('fs');
const process = require('process');
const child_process = require('child_process');

(async () => {

  try {
    // To avoid Math.pow(BigInt(2), BigInt(128)), Math.pow not support BigInt
    const lumosPath = `${__dirname}/node_modules/@ckb-lumos/base/lib/utils.js`
    const data = await fs.promises.readFile(lumosPath, 'utf8')
    const replaced = data.replace('BigInt(2) ** BigInt(128) - BigInt(1)', '2 ** 128 - 1');
    await fs.promises.writeFile(lumosPath, replaced, 'utf8')
  } catch (e) {}

  const packages = await fs.promises.readdir(`${__dirname}/packages`);
  packages.forEach(package => {
    console.log(`\nBuilding *${package}*`)
    const packagePath = `${__dirname}/packages/${package}`
    const scripts = require(`${packagePath}/package.json`).scripts
    if (scripts && scripts.build) {
      process.chdir(packagePath)
      child_process.execSync('yarn build')
    } else {
      console.log('\nPackage does not need to build.')
    }
    console.log('\n==================================')
  })
})();
