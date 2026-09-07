export type State = 'New' | 'Learning' | 'Review' | 'Relearning';
export type Rating = 'Again' | 'Hard' | 'Good' | 'Easy';

export interface Card {
  due: number; // timestamp
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: State;
  last_review: number | null; // timestamp
}

// FSRS v4 Default Parameters (Weights trained on millions of reviews)
const w = [
  0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 
  0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61
];

export const createEmptyCard = (now = Date.now()): Card => ({
  due: now,
  stability: 0,
  difficulty: 0,
  elapsed_days: 0,
  scheduled_days: 0,
  reps: 0,
  lapses: 0,
  state: 'New',
  last_review: null,
});

/**
 * 核心演算法：根據 DSR 認知模型計算下一次的複習狀態
 * @param card 當前的記憶卡片狀態
 * @param rating 學生給予的評分 (Again, Hard, Good, Easy)
 * @param now 當前的時間戳 (Date.now())
 */
export const calculateNextReview = (card: Card, rating: Rating, now: number): Card => {
  const newCard = { ...card };
  newCard.last_review = now;
  newCard.reps += 1;

  // Calculate elapsed days since last review
  newCard.elapsed_days = card.last_review !== null ? Math.max(0, (now - card.last_review) / 86400000) : 0;

  const ratingValue = { Again: 1, Hard: 2, Good: 3, Easy: 4 }[rating];

  if (card.state === 'New') {
    // 1. 初始化難度 (Difficulty)
    newCard.difficulty = Math.min(10, Math.max(1, w[4] - Math.exp(w[5] * (ratingValue - 1)) + 1));
    
    // 2. 初始化穩定度 (Stability)
    newCard.stability = w[ratingValue - 1]; // w[0] to w[3]
    
    // 3. 狀態轉換
    if (rating === 'Again' || rating === 'Hard') {
      newCard.state = 'Learning';
      newCard.scheduled_days = 0; // 當天稍後需再次複習
    } else {
      newCard.state = 'Review';
      newCard.scheduled_days = Math.round(newCard.stability);
    }
  } else {
    // 針對已存在的卡片更新 DSR 模型
    
    // 1. 更新難度 (Difficulty)
    const next_d = card.difficulty - w[6] * (ratingValue - 3);
    newCard.difficulty = Math.min(10, Math.max(1, card.difficulty + w[7] * (next_d - card.difficulty)));
    
    // 2. 計算可回憶率 (Retrievability)
    const retrievability = Math.pow(1 + newCard.elapsed_days / (9 * Math.max(0.01, card.stability)), -1);

    if (rating === 'Again') {
      newCard.lapses += 1;
      newCard.state = 'Relearning';
      
      // 遺忘後的穩定度懲罰 (Stability Penalty)
      newCard.stability = w[11] * Math.pow(card.difficulty, -w[12]) * 
                          (Math.pow(card.stability + 1, w[13]) - 1) * 
                          Math.exp(w[14] * (1 - retrievability));
      newCard.scheduled_days = 0;
    } else {
      newCard.state = 'Review';
      
      // 成功回憶後的穩定度增長 (Stability Growth)
      let stability_growth = 0;
      if (rating === 'Hard') {
        stability_growth = w[15] * Math.exp(w[8]) * 
                           (11 - card.difficulty) * 
                           Math.pow(card.stability, -w[9]) * 
                           (Math.exp((1 - retrievability) * w[10]) - 1);
      } else if (rating === 'Good') {
        stability_growth = Math.exp(w[8]) * 
                           (11 - card.difficulty) * 
                           Math.pow(card.stability, -w[9]) * 
                           (Math.exp((1 - retrievability) * w[10]) - 1);
      } else if (rating === 'Easy') {
        stability_growth = w[16] * Math.exp(w[8]) * 
                           (11 - card.difficulty) * 
                           Math.pow(card.stability, -w[9]) * 
                           (Math.exp((1 - retrievability) * w[10]) - 1);
      }
      
      newCard.stability = card.stability + stability_growth;
      newCard.scheduled_days = Math.max(1, Math.round(newCard.stability));
    }
  }

  // 設定下次複習時間
  if (newCard.scheduled_days === 0) {
    // 學習中或重新學習中，設定 5 分鐘後複習
    newCard.due = now + 5 * 60 * 1000;
  } else {
    // 已經進入長期記憶，設定天數
    newCard.due = now + newCard.scheduled_days * 86400000;
  }

  return newCard;
};
