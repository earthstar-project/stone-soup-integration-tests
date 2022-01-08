import {
    AuthorKeypair,
    Crypto,
    isErr
} from 'stone-soup'

const log = console.log;
const log2 = (...args: any[]) => console.log('    ', ...args);
const logError = (...args: any[]) => console.log('ERROR:', ...args);
const logJson = (x: any) => log(JSON.stringify(x, null, 4));

const knownKeypair: AuthorKeypair = {
    "address": "@test.barbz37gfsbidaud5hq27x7opnu4p26axgvj737e7lsqjr5ozumxq",
    "secret": "brkb5wo73qvs6q53yb4sxp4xxy6tmdlr3idqjalnqizshutndyeha"
}

const run = async () => {
    log('crypto tests: signatures and keypairs');
    log();
    log('generating new keypair');
    const newKeypair = await Crypto.generateAuthorKeypair('test');
    logJson(newKeypair);

    log();
    log('signing known message with known keypair:');
    let msg = 'hello';
    let sig = await Crypto.sign(knownKeypair, msg);
    let expectedSig = 'bkd372vxiqdu323dk65tn5s43zr6xpbkk2d7hoxj73pn7f7b4oiyndefybdzjrelnloioqoy2n2zh6gfymhy6drh6d42gwwr7fociqda'; 
    if (isErr(sig)) {
        logError('sign returned an error', sig);
        return false;
    }
    log2(sig);
    if (sig !== expectedSig) {
        logError('sig !== expected sig');
        return false;
    }

    log();
    log('testing signature verification, good and bad');
    let verifiedGood = await Crypto.verify(knownKeypair.address, sig as string, msg);
    let verifiedBad = await Crypto.verify(knownKeypair.address, sig as string, 'some other message');
    if (verifiedGood === false) {
        logError('did not verify a good signature');
        return false;
    }
    if (verifiedBad === true) {
        logError('verified a bad signature');
        return false;
    }
    return true;
}
let main = async () => {
    let success = await run();
    if (success) {
        log();
        log('SUCCESS');
        log();
        process.exit(0);
    } else {
        log();
        log('FAILURE');
        log();
        process.exit(1);
    }
}
main();
