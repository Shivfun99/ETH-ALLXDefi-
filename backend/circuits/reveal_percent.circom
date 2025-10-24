pragma circom 2.1.6;

template IsBoolean() {
    signal input in;
    signal output out;
    out <== in;
    out * (1 - out) === 0;
}

template MulDiv100() {
    signal input a;
    signal input pct;
    signal output out;
    signal prod;
    prod <== a * pct;

    signal rem;
    component bits[7];
    signal partial[7];
    for (var i = 0; i < 7; i++) {
        bits[i] = IsBoolean();
        bits[i].in <== 0;
        partial[i] <== bits[i].out * (1 << i);
    }
    signal sum;
    sum <== partial[0] + partial[1] + partial[2] + partial[3] + partial[4] + partial[5] + partial[6];
    rem <== sum;

    signal q;
    q <== (prod - rem) / 100;
    out <== q;

    prod === out * 100 + rem;
}

template PercentReveal() {
    signal input totalWei;
    signal input shownWei;
    signal input amountPct;
    signal input txPct;
    signal output outTotalWei;
    signal output outShownWei;
    signal output outAmountPct;
    signal output outTxPct;

    component md = MulDiv100();
    md.a <== totalWei;
    md.pct <== amountPct;

    shownWei === md.out;

    outTotalWei <== totalWei;
    outShownWei <== shownWei;
    outAmountPct <== amountPct;
    outTxPct <== txPct;
}

component main = PercentReveal();
