const computeNextState = (state, neighbors) => {
  const aliveNeighbors = neighbors.reduce((sum, n) => sum + parseInt(n), 0);
  if (state === "1")
    return aliveNeighbors === 2 || aliveNeighbors === 3 ? "1" : "0";
  return aliveNeighbors === 3 ? "1" : "0";
};

module.exports = { computeNextState };
