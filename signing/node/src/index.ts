import test from 'tape';

import {
    AuthorKeypair,
    Crypto,
    CryptoDriverNoble,
    CryptoDriverTweetnacl,
    GlobalCryptoDriver,
    ICryptoDriver,
    ValidationError,
    isErr,
    notErr,
    setGlobalCryptoDriver,
} from 'stone-soup'
import {
    CryptoDriverNode
} from 'stone-soup/node';

const cryptoTests = (cryptoDriver: ICryptoDriver) => {
    const knownKeypair: AuthorKeypair = {
        "address": "@test.barbz37gfsbidaud5hq27x7opnu4p26axgvj737e7lsqjr5ozumxq",
        "secret": "brkb5wo73qvs6q53yb4sxp4xxy6tmdlr3idqjalnqizshutndyeha"
    }
    const msg = 'hello';
    const expectedSig = 'bkd372vxiqdu323dk65tn5s43zr6xpbkk2d7hoxj73pn7f7b4oiyndefybdzjrelnloioqoy2n2zh6gfymhy6drh6d42gwwr7fociqda'; 

    const cryptoDriverName = (cryptoDriver as any).name;

    test(`${cryptoDriverName}: generateAuthorKeypair`, async (t) => {
        setGlobalCryptoDriver(cryptoDriver);
        const newKeypair: AuthorKeypair | ValidationError  = await Crypto.generateAuthorKeypair('test');
        t.equal(isErr(newKeypair), false, 'not an error');
        if (notErr(newKeypair)) {
            t.equal(typeof newKeypair.address, 'string', 'keypair has address');
            t.equal(typeof newKeypair.secret, 'string', 'keypair has secret');
        }
        t.end();
    });


    test(`${cryptoDriverName}: sign`, async (t) => {
        setGlobalCryptoDriver(cryptoDriver);
        let sig = await Crypto.sign(knownKeypair, msg);
        if (isErr(sig)) {
            t.fail('sign() returned an error');
            return;
        }
        t.equal(sig, expectedSig, 'sig should match expected sig');
        t.end();
    });

    test(`${cryptoDriverName}: verify`, async (t) => {
        setGlobalCryptoDriver(cryptoDriver);
        let verifiedGood = await Crypto.verify(knownKeypair.address, expectedSig, msg);
        let verifiedBad = await Crypto.verify(knownKeypair.address, expectedSig, 'some other message');
        t.ok(verifiedGood, 'verified a good signature');
        t.notOk(verifiedBad, 'rejected a bad signature');
        t.end();
    });
}

let drivers = [
    GlobalCryptoDriver,  // TODO: this is CryptoDriverNoble but let's test that the default value works
    CryptoDriverNoble,
    CryptoDriverTweetnacl,
    CryptoDriverNode,
];
for (let driver of drivers) {
    cryptoTests(driver);
}
