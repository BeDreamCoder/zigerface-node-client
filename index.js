var sign = require('./src/sign');

var account = sign.createAccount();
console.log("account: ", account);

var address = sign.addressFromPrivateKey(account.private_key);
console.log("address: ", address);

console.log("isValidAddress: ", sign.isValidAddress("i3c97f146e8de9807ef723538521fcecd5f64c79a"));
console.log("isValidPrivate: ", sign.isValidPrivate('bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9'));

var sig = sign.signTX("token", "transfer", ["i4230a12f5b0693dd88bb35c79d7e56a68614b199", "ZIG", "100000000000"],
    "test", "44f0918cc44abbabcbcb3461cbffa2bc0f163f5f5a2cdb5ab183f38ea5e920bd", "100000000000",
    'bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9');
console.log("sign: ", sig);