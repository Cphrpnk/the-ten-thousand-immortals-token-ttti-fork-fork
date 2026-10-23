module {
  // The tokens TTTI-T can be bought with. Each is an ICRC-1/ICRC-2 ledger:
  //   #icp    ryjl3-tyaaa-aaaaa-aaaba-cai  8 decimals  fee 10_000
  //   #ckbtc  mxzaz-hqaaa-aaaar-qaada-cai  8 decimals  fee 10
  //   #ckusdc xevnm-gaaaa-aaaar-qafnq-cai  6 decimals  fee 10_000
  //   #ckusdt cngnf-vqaaa-aaaar-qag4q-cai  6 decimals  fee 10_000
  // Amounts paid in a token are always in that token's base units.
  public type PayToken = {
    #icp;
    #ckbtc;
    #ckusdc;
    #ckusdt;
  };
};
