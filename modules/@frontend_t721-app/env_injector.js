const fs = require('fs');

let output = `var injectedEnv = {`;

for (const varName of Object.keys(process.env)) {
    if (varName.indexOf('REACT_APP_') === 0) {
        output = `${output}
    "${varName}":"${process.env[varName]}",`
    }
}

output = `${output}
};`;

const indexHtml = fs.readFileSync('./build/index.html');

const replacedIndexHtml = indexHtml.toString().replace('console.log("// {{ ENV }} //")', output);

console.log(replacedIndexHtml);
