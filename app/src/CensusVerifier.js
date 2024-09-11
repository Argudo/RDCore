'use strict';

var fs = require('fs');          
var process = require('child_process');
var snarkjs = require("snarkjs");

class CensusVerifier{
    static path = "./circuits_build/witness/census_js/"
    static wasm = "./circuits_build/witness/census_js/census.wasm"
    static r1cs = "./circuits_build/r1cs/census.r1cs"
    static wtns = "./circuits_build/witness/census_js/witness.wtns"
    static gen_wtns = "./circuits_build/witness/census_js/generate_witness.js"
    static zkey = "./circuits_build/verification/census.zkey"

    constructor(){
    }

    static async generateProof(root, private_key, sibling){
        const identity_input = [
            ["root", root],
            ["private_key", private_key],
            ["siblings", [sibling, sibling]]
        ];

        const identity_array = {};
        for (const [clave, valor] of identity_input) {
            identity_array[clave] = valor;
        }

        const { proof, public_signals } = await snarkjs.groth16.fullProve(identity_array, `${this.wasm}`, `${this.zkey}`)
        return { proof, public_signals }
    }
}

module.exports = CensusVerifier;