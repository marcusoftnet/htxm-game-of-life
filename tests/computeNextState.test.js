const { computeNextState } = require("../lib/conway");

describe("computeNextState", () => {
  // Rule 1: Any live cell with fewer than two live neighbors dies (underpopulation)
  test("live cell with 0 neighbors dies", () => {
    expect(computeNextState("1", Array(8).fill("0"))).toBe("0");
  });

  test("live cell with 1 neighbor dies", () => {
    const neighbors = ["1", ...Array(7).fill("0")];
    expect(computeNextState("1", neighbors)).toBe("0");
  });

  // Rule 2: Any live cell with two or three live neighbors lives
  test("live cell with 2 neighbors lives", () => {
    const neighbors = ["1", "1", ...Array(6).fill("0")];
    expect(computeNextState("1", neighbors)).toBe("1");
  });

  test("live cell with 3 neighbors lives", () => {
    const neighbors = ["1", "1", "1", ...Array(5).fill("0")];
    expect(computeNextState("1", neighbors)).toBe("1");
  });

  // Rule 3: Any live cell with more than three live neighbors dies (overpopulation)
  test("live cell with 4 neighbors dies", () => {
    const neighbors = ["1", "1", "1", "1", ...Array(4).fill("0")];
    expect(computeNextState("1", neighbors)).toBe("0");
  });

  // Rule 4: Any dead cell with exactly three live neighbors becomes alive
  test("dead cell with 3 neighbors becomes alive", () => {
    const neighbors = ["1", "1", "1", ...Array(5).fill("0")];
    expect(computeNextState("0", neighbors)).toBe("1");
  });

  test("dead cell with 2 neighbors stays dead", () => {
    const neighbors = ["1", "1", ...Array(6).fill("0")];
    expect(computeNextState("0", neighbors)).toBe("0");
  });

  test("dead cell with 4 neighbors stays dead", () => {
    const neighbors = ["1", "1", "1", "1", ...Array(4).fill("0")];
    expect(computeNextState("0", neighbors)).toBe("0");
  });
});
