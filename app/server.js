var express = require('express');
var fs = require('fs');
var snarkjs = require('snarkjs');
const circomlib = require('circomlibjs');
var BIroot = require('extra-bigint').root;
var CensusVerifier = require('./src/CensusVerifier.js');
var Identity = require('./src/Identity.js');

var app = express();
var bodyparser = require('body-parser');
var jsonparser = bodyparser.json();
var port = process.env.PORT || 4321;

app.use(bodyparser.json());

app.get('/', function(req, res) {
  res.json({ mensaje: '¡Hola Mundo!' });
});

app.get('/create-keys', async function(req, res) {
  const identity = new Identity();
  await identity.generateKeys();
  res.json({ private_key: identity.getPrivateKey().toString(), public_hash: (await identity.getPublicKeyHash()).toString() });
});

app.get('/calculate-parent-node', async function(req, res) {
  const poseidon = await circomlib.buildPoseidon();
  const root = poseidon.F.toString(poseidon([req.query.node_1, req.query.node_2]));
  res.json({ root: root });
});

app.post('/generate-proof', async (req, res) => {
  try {
    const { root, private_key, siblings } = req.body;
    const { proof, publicSignals, depth } = await CensusVerifier.generateProof(root, private_key, siblings);
    res.json({ proof, public_signals: publicSignals, depth });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/verify-proof', jsonparser, async function(req, res) {
  try {
    const { proof, public_signals, depth } = req.body;
    const valid = await CensusVerifier.verifyProof(proof, public_signals, depth);
    res.json({ valid: valid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/generate-keycode/:hash', async function(req, res) {
  let result = "";
  let modulo = BigInt(req.params.hash);
  let n = 13n;
  console.log(`Modulo: ${modulo}`);

  do {
    let i = BigInt(BIroot(modulo, n));
    modulo = modulo - pow(i, n);

    if (modulo < 4n) {
      result += `${i}`;
    } else if (i != 0n) {
      result += `${i}-`;
    }

    if (n > 1n) {
      n -= 2n;
    }
  } while (modulo >= 4n);

  let hex = "";
  let parse = result.split('-');
  for (let i = 0; i < parse.length; i++) {
    parse[i] = BigInt(parse[i]);
    if (i + 1 == parse.length) {
      hex += parse[i].toString(36);
    } else {
      hex += parse[i].toString(36) + '-';
    }
  }

  n = 13n;
  parse = hex.split('-');
  let recuperation = BigInt(convert(parse[parse.length - 1], 36));
  for (let i = 0; i <= parse.length - 2; i++) {
    recuperation += BigInt(pow(BigInt(convert(parse[i], 36)), n));
    if (n > 1n) {
      n -= 2n;
    }
  }

  let valid = recuperation == BigInt(req.params.hash);

  console.log(`Recuperation: ${recuperation} [${valid}]`);

  res.json({ valid: valid, keycode: hex, hash: recuperation.toString() });
});

function pow(value, exp) {
  let result = value;
  for (let i = 1; i < exp; i++) {
    result *= value;
  }
  return result;
}

function convert(value, radix) {
  return [...value.toString()].reduce((r, v) => r * BigInt(radix) + BigInt(parseInt(v, radix)), 0n);
}

app.listen(port, () => {
  console.log('API escuchando en el puerto ' + port);
});