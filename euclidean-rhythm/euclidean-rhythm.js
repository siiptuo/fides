function euclideanRhythm(k, n) {
  if (n <= 0) throw new Error("n must be positive");
  if (k < 0) throw new Error("k must not be negative");
  if (k > n) throw new Error("k must be less than or equal to n");
  if (k == 0) return new Array(n).fill(0);
  if (k == n) return new Array(n).fill(1);
  let A = new Array(k).fill([1]);
  let B = new Array(n - k).fill([0]);
  do {
    [A, B] =
      A.length < B.length
        ? [A.map((x, i) => x.concat(B[i])), B.slice(A.length)]
        : [
            A.slice(0, B.length).map((x, i) => x.concat(B[i])),
            A.slice(B.length)
          ];
  } while (B.length > 1);
  return [...A, ...B].flat();
}

function distanceSequence(rhythm) {
  const result = [];
  for (let i = 0; i < rhythm.length; i++) {
    if (rhythm[i]) {
      result.push(1);
    } else {
      result[result.length - 1] += 1;
    }
  }
  return result;
}

function subsets(rhythm) {
  const result = [];
  for (let i = 0; i < rhythm.length; i++) {
    if (rhythm[i]) {
      result.push(i);
    }
  }
  return result;
}

module.exports = { euclideanRhythm, distanceSequence, subsets };
