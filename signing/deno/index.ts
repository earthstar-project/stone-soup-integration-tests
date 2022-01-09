import test from 'https://esm.sh/tape@5.4.0?target=deno';

//import {
//  assert,
//  assertEquals,
//} from "https://deno.land/std@0.120.0/testing/asserts.ts";
//const test = Deno.test;

import {
    AuthorKeypair,
    Crypto,
    CryptoDriverNoble,
//    CryptoDriverTweetnacl,  // this was removed from the stone-soup esm-first branch?
    GlobalCryptoDriver,
    ICryptoDriver,
    ValidationError,
    isErr,
    notErr,
    setGlobalCryptoDriver,
} from '../../../stone-soup-deno/mod.ts';
//} from 'https://cdn.pika.dev/stone-soup@7.0.2';   // does not work
//} from 'https://cdn.skypack.dev/stone-soup@7.0.2?dts';   // does not work
//} from 'https://esm.sh/stone-soup@7.0.2?target=deno';   // does not work

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
        const sig = await Crypto.sign(knownKeypair, msg);
        if (isErr(sig)) {
            t.fail('sign() returned an error');
            return;
        }
        t.equal(sig, expectedSig, 'sig should match expected sig');
        t.end();
    });

    test(`${cryptoDriverName}: verify`, async (t) => {
        setGlobalCryptoDriver(cryptoDriver);
        const verifiedGood = await Crypto.verify(knownKeypair.address, expectedSig, msg);
        const verifiedBad = await Crypto.verify(knownKeypair.address, expectedSig, 'some other message');
        t.ok(verifiedGood, 'verified a good signature');
        t.notOk(verifiedBad, 'rejected a bad signature');
        t.end();
    });
}

const drivers = [
    GlobalCryptoDriver,  // TODO: this is CryptoDriverNoble but let's test that the default value works
    CryptoDriverNoble,
//    CryptoDriverTweetnacl,
];
for (const driver of drivers) {
    cryptoTests(driver);
}

test.onFailure(() => {
    console.log('FAIL');
    Deno.exit(2);
});