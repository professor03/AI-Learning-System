export interface SearchDocument {
  id: string;
  text: string;
  metadata?: any;
}

export interface SearchResult {
  doc: SearchDocument;
  score: number;
}

export class SearchEngine {
  private docs: Map<string, SearchDocument> = new Map();
  // term -> documentId -> frequency
  private termFrequencies: Map<string, Map<string, number>> = new Map();
  // term -> document count
  private documentFrequencies: Map<string, number> = new Map();
  private totalDocs: number = 0;

  /**
   * 簡單的中文分詞 (Tokenization)
   * 採用 Bigram (雙折詞) 與 Unigram (單字) 策略，對於繁體中文搜尋效果良好
   */
  private tokenize(text: string): string[] {
    const tokens: string[] = [];
    const cleanText = text.replace(/[\s\p{P}]/gu, ''); // 移除標點與空白
    
    if (cleanText.length === 0) return [];
    if (cleanText.length === 1) return [cleanText];

    // Bigrams
    for (let i = 0; i < cleanText.length - 1; i++) {
      tokens.push(cleanText.substring(i, i + 2));
    }
    // Unigrams (用作 fallback)
    for (let i = 0; i < cleanText.length; i++) {
      tokens.push(cleanText[i]);
    }

    return tokens;
  }

  /**
   * 計算文件長度 (用於 Cosine Similarity 歸一化)
   */
  private getDocLength(docId: string): number {
    let lengthSq = 0;
    this.termFrequencies.forEach((docFreqMap, term) => {
      const tf = docFreqMap.get(docId) || 0;
      if (tf > 0) {
        const idf = Math.log(this.totalDocs / (1 + (this.documentFrequencies.get(term) || 0)));
        const tfIdf = tf * idf;
        lengthSq += tfIdf * tfIdf;
      }
    });
    return Math.sqrt(lengthSq) || 1;
  }

  /**
   * 將文件加入索引
   */
  public addDocument(doc: SearchDocument) {
    if (this.docs.has(doc.id)) return; // 避免重複加入
    this.docs.set(doc.id, doc);
    this.totalDocs += 1;

    const tokens = this.tokenize(doc.text);
    const uniqueTokensInDoc = new Set<string>();

    tokens.forEach(token => {
      // 記錄 Term Frequency
      if (!this.termFrequencies.has(token)) {
        this.termFrequencies.set(token, new Map());
      }
      const docFreqMap = this.termFrequencies.get(token)!;
      docFreqMap.set(doc.id, (docFreqMap.get(doc.id) || 0) + 1);

      uniqueTokensInDoc.add(token);
    });

    // 記錄 Document Frequency
    uniqueTokensInDoc.forEach(token => {
      this.documentFrequencies.set(token, (this.documentFrequencies.get(token) || 0) + 1);
    });
  }

  /**
   * 清空索引
   */
  public clear() {
    this.docs.clear();
    this.termFrequencies.clear();
    this.documentFrequencies.clear();
    this.totalDocs = 0;
  }

  /**
   * 搜尋文件 (使用 TF-IDF 與 Cosine Similarity)
   */
  public search(query: string, topK: number = 3): SearchResult[] {
    if (this.totalDocs === 0 || !query.trim()) return [];

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    // 計算 Query 的 TF
    const queryTf = new Map<string, number>();
    queryTokens.forEach(token => {
      queryTf.set(token, (queryTf.get(token) || 0) + 1);
    });

    const scores = new Map<string, number>();

    // 針對 Query 中出現的 Token 計算分數
    queryTf.forEach((qTf, term) => {
      const docFreqMap = this.termFrequencies.get(term);
      if (docFreqMap) {
        const idf = Math.log(this.totalDocs / (1 + (this.documentFrequencies.get(term) || 0)));
        const queryTfIdf = qTf * idf;

        docFreqMap.forEach((docTf, docId) => {
          const docTfIdf = docTf * idf;
          scores.set(docId, (scores.get(docId) || 0) + (queryTfIdf * docTfIdf));
        });
      }
    });

    // 歸一化分數並排序
    const results: SearchResult[] = [];
    scores.forEach((rawScore, docId) => {
      // 在正式的 Cosine Similarity 中，要除以 Document 的向量長度
      // 為了效能，可以預先算好，但在此簡化計算。
      const normalizedScore = rawScore / this.getDocLength(docId); 
      results.push({
        doc: this.docs.get(docId)!,
        score: normalizedScore
      });
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// 建立全域單例 (Singleton)，供整個 App 呼叫
export const globalSearchEngine = new SearchEngine();
