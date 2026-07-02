export function computeRecallAtK(expected: string[], retrieved: string[], k: number): number {
  if (expected.length === 0) return 1;
  const topK = retrieved.slice(0, k);
  const hits = expected.filter(id => topK.includes(id)).length;
  return hits / expected.length;
}

export function computeMRR(expected: string[], retrieved: string[], k: number): number {
  const topK = retrieved.slice(0, k);
  for (let i = 0; i < topK.length; i++) {
    if (expected.includes(topK[i])) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

export function computeNDCGAtK(expected: string[], retrieved: string[], k: number): number {
  const topK = retrieved.slice(0, k);
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    if (expected.includes(topK[i])) {
      dcg += 1 / Math.log2(i + 2);
    }
  }
  let idcg = 0;
  for (let i = 0; i < Math.min(expected.length, k); i++) {
    idcg += 1 / Math.log2(i + 2);
  }
  return idcg === 0 ? 0 : dcg / idcg;
}

export function computeContextPrecision(expected: string[], retrieved: string[], k: number): number {
  if (expected.length === 0) return 0;
  const topK = retrieved.slice(0, k);
  let hits = 0;
  let precisionSum = 0;
  for (let i = 0; i < topK.length; i++) {
    if (expected.includes(topK[i])) {
      hits++;
      precisionSum += hits / (i + 1);
    }
  }
  return hits === 0 ? 0 : precisionSum / hits;
}
