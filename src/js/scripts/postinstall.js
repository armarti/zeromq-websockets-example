const { join, relative, dirname } = require('path');
const fs = require('fs');
const {
    JS_WORKSPACE_ROOT,
    PROJECT_ROOT,
} = require('./vars');

const PROJECT_MODULES_DIR = join(PROJECT_ROOT, 'node_modules');
const JS_WORKSPACE_MODULES_DIR = join(JS_WORKSPACE_ROOT, 'node_modules');

function ensureModuleLinked(moduleName) {
    fs.readdir(PROJECT_MODULES_DIR, (err1, projmods) => {
        if(err1) {
            console.error(`Error running fs.readdir on ${PROJECT_MODULES_DIR}: `, err1);
        } else {
            if(!~projmods.indexOf(moduleName)) {
                console.warn(`Couldn't find "${moduleName}" in ${PROJECT_MODULES_DIR}`);
            } else {
                fs.readdir(JS_WORKSPACE_MODULES_DIR, { withFileTypes: true }, (err2, jswsmods) => {
                    if(err2) {
                        console.error(`Error running fs.readdir on ${JS_WORKSPACE_MODULES_DIR}: `, err2);
                    } else {
                        const i = jswsmods.map(d => d.name).indexOf(moduleName);
                        if(!!~i && !jswsmods[i].isSymbolicLink()) {
                            console.info(`"${moduleName}" is present in ${JS_WORKSPACE_MODULES_DIR} but it's not a symbolic link`);
                        } else if(!!~i) {
                            console.info(`"${moduleName}" is already linked in ${JS_WORKSPACE_MODULES_DIR}`);
                        } else {
                            const srcPath = join(PROJECT_MODULES_DIR, moduleName);
                            const dstPath = join(JS_WORKSPACE_MODULES_DIR, moduleName);
                            const relSrcPath = relative(dirname(dstPath), srcPath);
                            console.info(`Linking from "${srcPath}" to "${dstPath}" as "${relSrcPath}"`);
                            fs.symlink(relSrcPath, dstPath, err3 => {
                                if(err3) console.error(`Error linking ${relSrcPath} <= ${dstPath}: `, err3);
                            });
                        }
                    }
                });
            }
        }
    });
}

// if __name__ == '__main__'
if (typeof require !== 'undefined' && require.main === module) {
    [
        'electron-webpack',
        'electron',
    ].map(ensureModuleLinked);
} else {
    module.exports = {
        ensureModuleLinked,
    }
}
