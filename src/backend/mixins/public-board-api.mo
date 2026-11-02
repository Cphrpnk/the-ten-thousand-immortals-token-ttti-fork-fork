import PublicBoardLib "../lib/public-board";
import Types "../types/public-board";

// PTM-4: the public board (cycles reserve in months, permanent liquidity and
// creator holdings). Read only, no state of its own.
mixin (boardContext : PublicBoardLib.BoardContext) {
  // Public, any caller: the cycles reserve (balance, reserve ICP, months of
  // measured consumption covered times 100, one-year target, fill), the
  // permanent liquidity (locked shares and value per pool, set-aside amounts,
  // journal count and latest entries) and the creator holdings (per token,
  // including TTTI-T transfer fees held in the fee collector account).
  public query func getPublicBoard() : async Types.PublicBoard {
    PublicBoardLib.currentBoard(boardContext);
  };
};
