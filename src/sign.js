/**
 * Created by zhangtailin on 2018/6/11.
 */

var ethUtils = require('ethereumjs-util');
var settingsConfig = require('./config');
var Wallet = require('./wallet').Wallet;
var Long = require('long');

let chaincode = require('../protos/chaincode.json');
let protobufRoot = require('protobufjs').Root;
let root = protobufRoot.fromJSON(chaincode);
var SignContent = root.lookupType('SignContent');
var ChaincodeSpec = root.lookupType('ChaincodeSpec');

var createAccount = function () {
    Wallet.generate();
    return {"address": Wallet.getAddress(), "public_key": Wallet.getPubKey(), "private_key": Wallet.getPriKey()};
};

var addressFromPrivateKey = function (prikey) {
    var pubkey = ethUtils.privateToAddress(Buffer.from(prikey, "hex"));
    return settingsConfig.AddressPrefix + pubkey.toString("hex");
};

function signTX(ccId, fcn, arg, msg, txId, feeLimit, priKey) {
    var args = [];
    var senderAddress = ethUtils.privateToAddress(new Buffer(priKey, "hex"));
    var senderSpec = {
        sender: Buffer.from(settingsConfig.AddressPrefix + senderAddress.toString("hex")),
        feeLimit: Buffer.from(feeLimit),
        msg: Buffer.from(msg),
        txId: Buffer.from(txId)
    };

    args.push(Buffer.from(fcn ? fcn : 'invoke', 'utf8'));
    for (var i = 0; i < arg.length; i++) {
        args.push(Buffer.from(arg[i], 'utf8'));
    }

    var invokeSpec = {
        type: ChaincodeSpec.Type.GOLANG,
        chaincodeId: {
            name: ccId
        },
        input: {
            args: args
        }
    };
    var signContent = {
        chaincodeSpec: invokeSpec,
        senderSpec: senderSpec
    };

    var encodeMessage = SignContent.encode(SignContent.create(signContent)).finish();
    var signHash = ethUtils.sha256(Buffer.from(encodeMessage));
    var sigrsv = ethUtils.ecsign(signHash, new Buffer(priKey, "hex"));

    return Buffer.concat([
        ethUtils.setLengthLeft(sigrsv.r, 32),
        ethUtils.setLengthLeft(sigrsv.s, 32),
        ethUtils.toBuffer(sigrsv.v - 27)
    ]).toString("hex");
};

var isValidAddress = function (address) {
    if (typeof address !== 'string') {
        return false;
    }
    let new_address = address;
    if (address.slice(0, 1) === settingsConfig.AddressPrefix) {
        new_address = ethUtils.addHexPrefix(address.slice(1));
    } else if (address.slice(0, 2) !== '0x') {
        new_address = ethUtils.addHexPrefix(address);
    }
    // return ethUtils.isValidAddress(ethUtils.addHexPrefix(address));
    return ethUtils.isValidAddress(new_address);
};

var isValidPrivate = function (prikey) {
    return ethUtils.isValidPrivate(Buffer.from(prikey, "hex"));
};

module.exports.createAccount = createAccount;
module.exports.addressFromPrivateKey = addressFromPrivateKey;
module.exports.signTX = signTX;
module.exports.isValidAddress = isValidAddress;
module.exports.isValidPrivate = isValidPrivate;
