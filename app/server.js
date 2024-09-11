var express = require('express') 
var fs = require('fs');           
var snarkjs = require('snarkjs');
const circomlib = require('circomlibjs');

var CensusVerifier = require('./src/CensusVerifier.js');
var Identity = require('./src/Identity.js');

var app = express()    

var bodyparser = require('body-parser')
var jsonparser = bodyparser.json()

var port = process.env.PORT || 8080  // establecemos nuestro puerto

app.get('/', function(req, res) {
  res.json({ mensaje: '¡Hola Mundo!' })   
})

app.get('/create-keys', async function(req, res) {
    const identity = new Identity()
    await identity.generateKeys()
    res.json({ identity: identity })  
})

app.get('/generate-proof', jsonparser, async function(req, res) {
    //const { root, private_key, sibling  } = req.body
    //console.log('[New Witness] root: ' + root + ' private_key: ' + private_key + ' sibling: ' + sibling)

    // TEMPORARY KEY GENERATION
    const identity = new Identity()
    await identity.generateKeys()

    var poseidon_key = await identity.getPublicKey("POSEIDON")
    var poseidon = await Promise.resolve(circomlib.buildPoseidon())
    let root = poseidon.F.toString(poseidon([poseidon_key, poseidon_key]))
    // END TEMPORARY CODE

    await({proof, public_signals} = await CensusVerifier.generateProof(root, identity.getPrivateKey(), poseidon_key))

    res.json({ proof: proof, public_signals: public_signals })  
})

// iniciamos nuestro servidor
app.use(bodyparser.json())
app.listen(port)
console.log('API escuchando en el puerto ' + port)