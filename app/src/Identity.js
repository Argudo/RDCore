'use strict';

const buildEddsa = require("circomlibjs").buildEddsa;
const createBlakeHash = require("blake-hash");
const utils = require("ffjavascript").utils;
const scalar = require("ffjavascript").Scalar;
const babyjubjub = require('babyjubjub');
const circomlib = require('circomlibjs');

const fromHexString = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

class Identity{
    constructor(){
    }

    async generateKeys(){
        let eddsa = await buildEddsa();
        let hex_string = babyjubjub.PrivateKey.getRandObj().hexString

        this.poseidon = await Promise.resolve(circomlib.buildPoseidon());

        this.private_key = fromHexString(hex_string)
        this.public_key = eddsa.prv2pub(this.private_key);

        this.circuit_private_key = eddsa.pruneBuffer(createBlakeHash("blake512").update(Buffer.from(hex_string, "hex")).digest().slice(0,32));
    }

    async getPublicKey(type){
        if(type == "EDDSA"){
            return {x: this.public_key[0], y: this.public_key[1]};
        }else if(type == "POSEIDON"){
            var eddsa = await this.getPublicKey("EDDSA")
            return this.poseidon.F.toString(this.poseidon([eddsa.x, eddsa.y]));
        }
    }

    getPrivateKey(){
        return scalar.shr(utils.leBuff2int(this.circuit_private_key), 3);
    }
}

module.exports = Identity;