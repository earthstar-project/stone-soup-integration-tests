import {
    Crypto
} from 'stone-soup'

const keys = Crypto.generateAuthorKeypair('test');

console.log(JSON.stringify(keys, null, 4));
