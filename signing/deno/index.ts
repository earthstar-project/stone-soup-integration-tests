//import test from 'https://esm.sh/tape@5.4.0?target=deno';

import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.120.0/testing/asserts.ts";
const test = Deno.test;

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

    test(`${cryptoDriverName}: generateAuthorKeypair`, async () => {
        setGlobalCryptoDriver(cryptoDriver);
        const newKeypair: AuthorKeypair | ValidationError  = await Crypto.generateAuthorKeypair('test');
        assertEquals(isErr(newKeypair), false, 'not an error');
        if (notErr(newKeypair)) {
            assertEquals(typeof newKeypair.address, 'string', 'keypair has address');
            assertEquals(typeof newKeypair.secret, 'string', 'keypair has secret');
        }
    });

    test(`${cryptoDriverName}: sign`, async () => {
        setGlobalCryptoDriver(cryptoDriver);
        const sig = await Crypto.sign(knownKeypair, msg);
        if (isErr(sig)) {
            assert(false, 'sign() returned an error');
            return;
        }
        assertEquals(sig, expectedSig, 'sig should match expected sig');
    });

    test(`${cryptoDriverName}: verify`, async () => {
        setGlobalCryptoDriver(cryptoDriver);
        const verifiedGood = await Crypto.verify(knownKeypair.address, expectedSig, msg);
        const verifiedBad = await Crypto.verify(knownKeypair.address, expectedSig, 'some other message');
        assert(verifiedGood, 'verified a good signature');
        assert(!verifiedBad, 'rejected a bad signature');
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
