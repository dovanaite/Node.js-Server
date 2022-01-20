const environments = {};

environments.dev = {
    name: 'Server',
    envName: 'dev',
    defaultLang: 'en',
    password: 'demo-password',
}

environments.production = {
    name: 'Serveris',
    envName: 'production',
    defaultLang: 'lt',
    password: 'fretr48t521e4rteye52',
}

environments.test = {
    name: 'Serveris test',
    envName: 'test',
    defaultLang: 'ee',
    password: 'esttoo',
}

// NODE_ENV=production node . -> environments.production
// NODE_ENV=test node . -> environments.test
// NODE_ENV=dev node . -> environments.dev
// NODE_ENV=eeretryt node . -> environments.dev
// node . -> environments.dev

const currectEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : '';
const exportableEnvName = typeof environments[currectEnv] === 'object' ? currectEnv : 'dev';

module.exports = environments[exportableEnvName];