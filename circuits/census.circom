pragma circom  2.1.6;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/babyjub.circom";

template MTVerifier(node_depth){
    signal input root;
    signal input private_key;
    signal input siblings[node_depth];
    signal output valid;
    signal output generated_root;

    var hxPK;
    var public_key;

    component babyjub = BabyPbk();
    babyjub.in <== private_key;

    component GenPK = GenPubKey();
    GenPK.x <== babyjub.Ax;
    GenPK.y <== babyjub.Ay;
    hxPK = GenPK.out;

    var left;
    var right;
    var partial_root;
    left  = hxPK;
    right = siblings[0];

    log("\n[Circuit Identity]\n\tCx: " , babyjub.Ax, "\n\tCy: ", babyjub.Ay);
    log("\tPublic Key: ", hxPK);

    component MTHash = SMTHash2();
    component hash[node_depth];
    MTHash.L <== left;
    MTHash.R <== right;
    partial_root = MTHash.out;
    log("Generated node 0: ",partial_root);
    for (var i = 1; i < node_depth; i++) {
        hash[i] = SMTHash2();
        hash[i].L <== partial_root;
        hash[i].R <== siblings[i];
        partial_root = hash[i].out;
        log("Generated node", i, ": ",partial_root);
    }

    generated_root <== partial_root;
    
    component CheckRoot = IsEqual();
    CheckRoot.in[0] <== partial_root;
    CheckRoot.in[1] <== root;

    valid <== CheckRoot.out;
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

component main {public [root]} = MTVerifier(1);