'use strict';

const buildEddsa = require("circomlibjs").buildEddsa;
const createBlakeHash = require("blake-hash");
const utils = require("ffjavascript").utils;
const scalar = require("ffjavascript").Scalar;
const { PrivateKey } = require('babyjubjub');;
const circomlib = require('circomlibjs');

const fromHexString = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

class Identity{
    constructor(){
    }

    async generateKeys(){
        this.eddsa = await buildEddsa();
        this.poseidon = await Promise.resolve(circomlib.buildPoseidon());

        let hex_string = PrivateKey.getRandObj().hexString

        this.private_key = fromHexString(hex_string)
        this.public_key = this.eddsa.prv2pub(this.private_key);
        this.circuit_private_key = this.eddsa.pruneBuffer(createBlakeHash("blake512").update(Buffer.from(hex_string, "hex")).digest().slice(0,32));
    }

    async getPublicKey(){
        var F = this.eddsa.F;
        return {
            x: F.toString(this.public_key[0]), 
            y: F.toString(this.public_key[1])
        };
    }

    async getPublicKeyHash(){
        var public_key = await this.getPublicKey("EDDSA")
        return this.poseidon.F.toString(this.poseidon([public_key.x, public_key.y]));
    }

    getPrivateKey(){
        return scalar.shr(utils.leBuff2int(this.circuit_private_key), 3);
    }
}

module.exports = Identity;