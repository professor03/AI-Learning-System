const puppeteer = require('puppeteer');

(async () => {
  console.log("正在啟動 Chrome 瀏覽器...");
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  
  // 監聽網路請求 (Network Interception)
  console.log("開始監聽前端與後端 (Gemini API) 的傳輸訊息...");
  
  page.on('request', request => {
    if (request.url().includes('generativelanguage.googleapis.com')) {
      console.log('\n[Request 🔼] 發送給 Gemini API:');
      console.log('URL:', request.url().split('?')[0]); // 隱藏 API Key
      console.log('Payload:', request.postData()?.substring(0, 500) + '...');
    }
  });

  page.on('response', async response => {
    if (response.url().includes('generativelanguage.googleapis.com')) {
      console.log('\n[Response 🔽] 來自 Gemini API 的回傳:');
      console.log('Status:', response.status());
      try {
        const text = await response.text();
        console.log('Body:', text.substring(0, 500) + '...');
      } catch (e) {
        console.log('Body: <無法讀取或已讀取>');
      }
    }
  });

  await page.goto('http://localhost:5173');
  console.log("成功進入應用程式 (http://localhost:5173)！");
  
  // 尋找並點擊測驗或學習相關按鈕
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const quizBtn = buttons.find(b => b.textContent.includes('測驗') || b.textContent.includes('知識銀行'));
    if (quizBtn) {
      quizBtn.click();
      console.log("已自動點擊測驗/銀行按鈕");
    }
  });

  console.log("等待 15 秒讓網路請求完成，您可以直接在彈出的實體視窗中觀看或親自操作...");
  await new Promise(r => setTimeout(r, 15000));
  
  console.log("測試結束，關閉瀏覽器。");
  await browser.close();
})();
