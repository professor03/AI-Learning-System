/** Same-origin API; provider credentials exist only in the Node service. */
export const model = {
  async generateContent(prompt: string) {
    let response: Response;
    try {
      response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(65_000),
      });
    } catch {
      throw new Error('AI 服務無法連線或逾時，請確認服務已啟動後再試。');
    }
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || `AI 服務錯誤（${response.status}）`);
    if (typeof payload?.text !== 'string' || !payload.text.trim()) {
      throw new Error('AI 未回傳有效內容，請重試。');
    }
    return { response: { text: () => payload.text as string } };
  },
};
