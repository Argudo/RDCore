
pragma circom  2.1.6;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/babyjub.circom";

template MTVerifier(nLevels){
    signal input root;
    signal input privateKey;
    signal input siblings[nLevels];
    signal output valid;
    signal output outGenRoot;

    var hxPK;
    var publicKey;

    component babyjub = BabyPbk();
    babyjub.in <== privateKey;

    component genPK = GenPubKey();
    genPK.x <== babyjub.Ax;
    genPK.y <== babyjub.Ay;
    hxPK = genPK.out;

    var left;
    var right;
    var genRoot;
    left  = hxPK;
    right = siblings[0];

    log("\n[Circuit Identity]\n\tCx: " , babyjub.Ax, "\n\tCy: ", babyjub.Ay);
    log("\tPublic Key: ", hxPK);

    component mtHash = SMTHash2();
    component hash[nLevels];
    mtHash.L <== left;
    mtHash.R <== right;
    genRoot = mtHash.out;
    log("Generated node 0: ",genRoot);
    for (var i = 1; i < nLevels; i++) {
        hash[i] = SMTHash2();
        hash[i].L <== genRoot;
        hash[i].R <== siblings[i];
        genRoot = hash[i].out;
        log("Generated node", i, ": ",genRoot);
    }

    outGenRoot <== genRoot;
    
    component checkRoot = IsEqual();
    checkRoot.in[0] <== genRoot;
    checkRoot.in[1] <== root;

    valid <== checkRoot.out;
}


/*
    This component is used to create the 2 nodes.
    Hash2 = H(Hl | Hr)
*/
template SMTHash2() {
    signal input L;
    signal input R;
    signal output out;

    component h = Poseidon(2);   // Constant
    h.inputs[0] <== L;
    h.inputs[1] <== R;

    out <== h.out;
}

template GenPubKey(){
    signal input x;
    signal input y;
    signal output out;

    component h = Poseidon(2); 
    h.inputs[0] <== x;
    h.inputs[1] <== y;

    out <== h.out;
}

component main {public [root]} = MTVerifier(2);