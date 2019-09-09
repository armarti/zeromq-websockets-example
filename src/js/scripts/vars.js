const { resolve, join } = require('path');

const JS_WORKSPACE_ROOT = resolve(join(__dirname, '..'));
const JS_WORKSPACE_MODULES_DIR = join(JS_WORKSPACE_ROOT, 'node_modules');
const PROJECT_ROOT = resolve(join(JS_WORKSPACE_ROOT, '../..'));
const PROJECT_MODULES_DIR = join(PROJECT_ROOT, 'node_modules');
const GIT_MODULES_DIR = join(PROJECT_ROOT, 'modules');
const CPP_WORKSPACE_ROOT = join(PROJECT_ROOT, 'src/cpp');

module.exports = {
    JS_WORKSPACE_ROOT,
    JS_WORKSPACE_MODULES_DIR,
    PROJECT_ROOT,
    PROJECT_MODULES_DIR,
    GIT_MODULES_DIR,
    CPP_WORKSPACE_ROOT,
};
