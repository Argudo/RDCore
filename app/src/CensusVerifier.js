'use strict';

const fs = require('fs');
const snarkjs = require("snarkjs");

class CensusVerifier {
  static DEPTHS = [1, 2, 3, 4, 5, 6, 7];
  static BASE_PATH = "./circuits_build";

  static getCircuitFiles(depth) {
    return {
      wasm: `${this.BASE_PATH}/witness/census_${depth}_js/census_${depth}.wasm`,
      zkey: `${this.BASE_PATH}/verification/census_${depth}.zkey`,
      vkey: `${this.BASE_PATH}/verification/census_${depth}_vkey.json`,
    };
  }

  static async generateProof(root, private_key, siblings) {
    const requiredDepth = siblings.length;
    const chosenDepth = this.DEPTHS.find(d => d >= requiredDepth);

    if (!chosenDepth) {
      throw new Error(`No hay circuitos disponibles para profundidad ${requiredDepth}`);
    }

    const paddedSiblings = siblings.slice();
    while (paddedSiblings.length < chosenDepth) {
      paddedSiblings.push("0");
    }

    const input = {
      root: BigInt(root).toString(),
      private_key: BigInt(private_key).toString(),
      siblings: paddedSiblings.map(x => BigInt(x).toString())
    };

    console.log(`[DEBUG] Generando prueba para profundidad ${chosenDepth}`);
    console.log(`[DEBUG] Input:`, input);

    const { wasm, zkey } = this.getCircuitFiles(chosenDepth);
    console.log(`[DEBUG] Archivos: wasm=${wasm}, zkey=${zkey}`);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasm, zkey);
    console.log(`[DEBUG] Prueba generada con éxito`);

    return { proof, publicSignals, depth: chosenDepth };
  }

  static async verifyProof(proof, public_signals, depth) {
    console.log(`[DEBUG] Verificando prueba para profundidad ${depth}`);

    if (!this.DEPTHS.includes(depth)) {
      throw new Error(`Profundidad ${depth} no soportada`);
    }

    const { vkey } = this.getCircuitFiles(depth);
    console.log(`[DEBUG] vkey: ${vkey}`);

    const vkeyJson = JSON.parse(fs.readFileSync(vkey));
    const valid = await snarkjs.groth16.verify(vkeyJson, public_signals, proof);

    valid? console.log(`[DEBUG] Prueba válida`) : console.log(`[DEBUG] Prueba inválida`);
    return valid;
  }
}

module.exports = CensusVerifier;
