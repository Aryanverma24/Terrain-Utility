export const verifyHashChain = (historyArray) => {
  for (let i = 1; i < historyArray.length; i++) {
    if (historyArray[i].previousHash !== historyArray[i - 1].currentHash) {
      return false;
    }
  }
  return true;
};