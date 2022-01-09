import {
    AuthorKeypair,
    Crypto,
    CryptoDriverNoble,
    CryptoDriverTweetnacl,
    GlobalCryptoDriver,
    ICryptoDriver,
    isErr,
    setGlobalCryptoDriver,
} from 'stone-soup'
import {
    CryptoDriverNode
} from 'stone-soup/node';


const log = console.log;
const log2 = (...args: any[]) => console.log('    ', ...args);
const logError = (...args: any[]) => console.log('ERROR:', ...args);
const logJson = (x: any) => log(JSON.stringify(x, null, 4));

const knownKeypair: AuthorKeypair = {
    "address": "@test.barbz37gfsbidaud5hq27x7opnu4p26axgvj737e7lsqjr5ozumxq",
    "secret": "brkb5wo73qvs6q53yb4sxp4xxy6tmdlr3idqjalnqizshutndyeha"
}

const run = async (cryptoDriver: ICryptoDriver) => {
    setGlobalCryptoDriver(cryptoDriver);
    const cryptoDriverName = (GlobalCryptoDriver as any).name;
    log(`crypto tests: signatures and keypairs using ${cryptoDriverName}`);
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
    log2('signature is correct');

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
    let drivers = [
        GlobalCryptoDriver,  // TODO: this is CryptoDriverNoble but let's test that the default value works
        CryptoDriverNoble,
        CryptoDriverTweetnacl,
        CryptoDriverNode,
    ];
    let allSuccess = true;
    for (let driver of drivers) {
        let success = await run(driver);
        if (success) {
            log();
            log('SUCCESS');
            log();
        } else {
            log();
            log('FAILURE');
            log();
            allSuccess = false;
        }
    }
    process.exit(allSuccess ? 0 : 1);
}
main();
