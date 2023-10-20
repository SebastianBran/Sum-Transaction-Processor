const { createHash } = require('crypto')
const { CryptoFactory, createContext } = require('sawtooth-sdk/signing')
const protobuf = require('sawtooth-sdk/protobuf')
const fs = require('fs')
const fetch = require('node-fetch')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding')
const { get } = require('http')

FAMILY_NAME = 'sum'

function hash(v) {
    return createHash('sha512').update(v).digest('hex');
}

class SumClient {
    constructor() {
        const context = createContext('secp256k1');
        const privateKey = context.newRandomPrivateKey();

        this.signer = new CryptoFactory(context).newSigner(privateKey);
        this.publicKey = this.signer.getPublicKey().asHex();
    }


    sumTwoNumbers(name, num1, num2) {
        var action = 'sum';
        var payload = name + ',' + action + ',' + num1 + ',' + num2;
        return this._wrap_and_send(name, payload);
    }

    showSum(name) {
        var address = this._getAddress(name);
        return this._get_from_rest_api(address);
    }

    getUserPriKey(userid) {
        console.log(userid);
        console.log("Current working directory is: " + process.cwd());
        var userprivkeyfile = '/root/.sawtooth/keys/' + userid + '.priv';
        return fs.readFileSync(userprivkeyfile);
    }

    getUserPubKey(userid) {
        console.log(userid);
        console.log("Current working directory is: " + process.cwd());
        var userpubkeyfile = '/root/.sawtooth/keys/' + userid + '.pub';
        return fs.readFileSync(userpubkeyfile);
    }

    _getAddress(add) {
        var pref = hash(FAMILY_NAME).substring(0, 6);
        var addr = hash(add).substring(0, 64);
        return pref + addr;
    }

    _wrap_and_send(name, payload) {
        console.log("Sending transaction to Sawtooth REST API");
        console.log("Payload: " + payload);
        var enc = new TextEncoder('utf8');
        var payloadBytes = enc.encode(payload);
        console.log("Payload Bytes: " + payloadBytes);

        var txnHeaderBytes = this._make_txn_header_bytes(name, payloadBytes);
        var txnBytes = this._make_txn_bytes(txnHeaderBytes, payloadBytes);
        return this._send_to_rest_api(txnBytes);
    }

    _make_txn_header_bytes(name, payloadBytes) {
        var address = this._getAddress(name);

        const transactionHeaderBytes = protobuf.TransactionHeader.encode({
            familyName: FAMILY_NAME,
            familyVersion: '1.0',
            inputs: [address],
            outputs: [address],
            signerPublicKey: this.signer.getPublicKey().asHex(),
            batcherPublicKey: this.signer.getPublicKey().asHex(),
            dependencies: [],
            payloadSha512: hash(payloadBytes),
            nonce: "" + Math.random(),
            payloadBytesSha512: hash(payloadBytes)
        }).finish();

        return transactionHeaderBytes;
    }

    _make_txn_bytes(txnHeaderBytes, payloadBytes) {
        const signature = this.signer.sign(txnHeaderBytes);

        const transaction = protobuf.Transaction.create({
            header: txnHeaderBytes,
            headerSignature: signature,
            payload: payloadBytes
        });

        const transactions = [transaction];

        const batchHeaderBytes = protobuf.BatchHeader.encode({
            signerPublicKey: this.signer.getPublicKey().asHex(),
            transactionIds: transactions.map((txn) => txn.headerSignature),
        }).finish();

        const batchSignature = this.signer.sign(batchHeaderBytes);

        const batch = protobuf.Batch.create({
            header: batchHeaderBytes,
            headerSignature: batchSignature,
            transactions: transactions,
        });

        const batchListBytes = protobuf.BatchList.encode({
            batches: [batch]
        }).finish();

        console.log("Transaction bytes: " + batchListBytes);
        return batchListBytes;
    }

    _send_to_rest_api(batchListBytes) {
        const url = "http://localhost:8008/batches";
        console.log("Sending to URL: " + url);
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
            body: batchListBytes
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                return responseJson;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    _get_from_rest_api(address) {
        console.log("Getting from Sawtooth REST API");
        const geturl = "http://localhost:8008/state/" + address;
        console.log("Getting from URL: " + geturl);
        return fetch(geturl)
            .then((response) => response.json())
            .then((responseJson) => {
                var data = responseJson.data;
                console.log("Data: " + data);
                var decodedData = Buffer.from(data, 'base64').toString();
                console.log("Decoded Data: " + decodedData);
                return decodedData;
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

module.exports.SumClient = SumClient;