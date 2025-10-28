function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function calculateIDF(term: string, documents: string[]): number {
  const docsWithTerm = documents.filter((doc) =>
    doc.toLowerCase().includes(term.toLowerCase())
  ).length;

  if (docsWithTerm === 0) return 0;

  return Math.log((documents.length - docsWithTerm + 0.5) / (docsWithTerm + 0.5) + 1);
}

function calculateTermFrequency(term: string, document: string): number {
  const tokens = tokenize(document);
  const termCount = tokens.filter((t) => t === term.toLowerCase()).length;
  return termCount;
}

export function calculateBM25(
  query: string,
  document: string,
  allDocuments: string[],
  k1: number = 1.5,
  b: number = 0.75
): number {
  const queryTerms = tokenize(query);
  const docTokens = tokenize(document);
  const docLength = docTokens.length;

  const avgDocLength =
    allDocuments.reduce((sum, doc) => sum + tokenize(doc).length, 0) / allDocuments.length;

  let score = 0;

  queryTerms.forEach((term) => {
    const idf = calculateIDF(term, allDocuments);
    const tf = calculateTermFrequency(term, document);

    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));

    score += idf * (numerator / denominator);
  });

  return score;
}

export function calculateBM25Normalized(
  query: string,
  document: string,
  allDocuments: string[]
): number {
  const rawScore = calculateBM25(query, document, allDocuments);

  const maxPossibleScore = tokenize(query).length * 8;

  const normalized = Math.min((rawScore / maxPossibleScore) * 100, 100);

  return Math.max(0, normalized);
}
