var express = require('express') 
var fs = require('fs');           
var snarkjs = require('snarkjs');
const circomlib = require('circomlibjs');

var CensusVerifier = require('./src/CensusVerifier.js');
var Identity = require('./src/Identity.js');

var app = express()    

var bodyparser = require('body-parser')
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

// Server start
app.use(bodyparser.json())
app.listen(port)
console.log('API escuchando en el puerto ' + port)