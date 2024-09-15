var express = require('express') 
var fs = require('fs');           
var snarkjs = require('snarkjs');
const circomlib = require('circomlibjs');

var BIroot = require('extra-bigint').root;
//var BigFloat = require('bigfloat').BigFloat32;

var CensusVerifier = require('./src/CensusVerifier.js');
var Identity = require('./src/Identity.js');

var app = express()    

var bodyparser = require('body-parser');
const { hash } = require('crypto');
const e = require('express');
var jsonparser = bodyparser.json()

var port = process.env.PORT || 8080 

app.get('/', function(req, res) {
  res.json({ mensaje: '¡Hola Mundo!' })   
})

app.get('/create-keys', async function(req, res) {
    const identity = new Identity()
    await identity.generateKeys()
    res.json({ identity: identity })  
})

app.get('/generate-proof', jsonparser, async function(req, res) {
    // TEMPORARY KEY GENERATION
    const identity = new Identity()
    await identity.generateKeys()

    var public_key_hash = await identity.getPublicKeyHash()
    var poseidon = await Promise.resolve(circomlib.buildPoseidon())
    let root = poseidon.F.toString(poseidon([public_key_hash, public_key_hash]))
    // END TEMPORARY CODE

    await({proof, publicSignals} = await CensusVerifier.generateProof(root, identity.getPrivateKey(), public_key_hash))

    res.json({ proof: proof, public_signals: publicSignals })  
})

app.get('/verify-proof', jsonparser, async function(req, res) {
    // const proof = req.body.proof
    // const publicSignals = req.body.publicSignals

    // TEMPORARY KEY GENERATION
    const identity = new Identity()
    await identity.generateKeys()

    var public_key_hash = await identity.getPublicKeyHash()
    var poseidon = await Promise.resolve(circomlib.buildPoseidon())
    let root = poseidon.F.toString(poseidon([public_key_hash, public_key_hash]))

    await({proof, publicSignals} = await CensusVerifier.generateProof(root, identity.getPrivateKey(), public_key_hash))
    // END TEMPORARY CODE

    const valid = await CensusVerifier.verifyProof(proof, publicSignals)
    res.json({ valid: valid })  
})

app.get('/generate-keycode', jsonparser, async function(req, res) {
    // TEMPORARY KEY GENERATION
    const identity = new Identity()
    await identity.generateKeys()

    let public_key_hash = await identity.getPublicKeyHash()
    let poseidon = await Promise.resolve(circomlib.buildPoseidon())
    let root = poseidon.F.toString(poseidon([public_key_hash, public_key_hash]))
    // END TEMPORARY CODE

    let result = "";
    let modulo = BigInt(root);
    let n = 13n;
    console.log(`Modulo: ${modulo}`);
    
    do {
        let i = BigInt(BIroot(modulo, n));
        modulo = modulo - pow(i, n);

        if(modulo < 4){
            result += `${i}`
        }
        else if(i != 0){ 
            result += `${i}-` 
        };

        if(n > 1n){n -= 2n;}
    } while (modulo >= 4);

    // HEXADECIMAL CONVERSION
    let hex = ""
    let parse = result.split('-'); 
    for(let i = 0; i < parse.length; i++){
        parse[i] = BigInt(parse[i]);
        if(i+1 == parse.length){
            hex += parse[i].toString(36);
        } 
        else {
        hex += parse[i].toString(36) + '-'; 
        }
    }

    // REVERSE PROCESS
    n = 13;
    parse = hex.split('-'); 
    let recuperation = BigInt(convert(parse[parse.length-1], 36));
    for(let i = 0; i <= parse.length-2; i++){
        recuperation += BigInt(pow(BigInt(convert(parse[i], 36)), n));
        if(n > 1){
            n -= 2;
        }
    }

    let valid = recuperation == BigInt(root);

    console.log(`Recuperation: ${recuperation} [${recuperation == BigInt(root)}]`);

    res.json({ valid:  valid, keycode: hex, hash: recuperation.toString() })
})

function pow(value, exp){
    let result = value
    console.log(`Value: ${value}, Exp: ${exp}`);
    for(let i = 1; i < exp; i++){
        result *= value;
    }
    return result;
}

function convert(value, radix) {
    return [...value.toString()]
        .reduce((r, v) => r * BigInt(radix) + BigInt(parseInt(v, radix)), 0n);
}

// Server start
app.use(bodyparser.json())
app.listen(port)
console.log('API escuchando en el puerto ' + port)