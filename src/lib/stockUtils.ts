import type { KnowledgeAtom, KnowledgeStock, StockStats } from '../types/memory';
import type { LectureNotes } from '../types';

/**
 * Generate a stock icon based on note name/courseName
 */
export function getStockIcon(noteName: string): string {
    const keywords: Record<string, string> = {
        '經濟': '📈', '統計': '📊', '程式': '💻', '程式設計': '💻',
        '資料結構': '🌳', '演算法': '⚡', '數學': '🔢',
        '物理': '⚛️', '化學': '🧪', '生物': '🧬',
        '歷史': '📜', '地理': '🌍', '英文': '📝',
        '會計': '💰', '管理': '📋', '行銷': '📢'
    };

    for (const [keyword, icon] of Object.entries(keywords)) {
        if (noteName.includes(keyword)) return icon;
    }

    return '📚'; // Default icon
}

/**
 * Calculate stock from atoms and note
 */
export function calculateStock(
    note: LectureNotes,
    atoms: KnowledgeAtom[],
    existingStock?: KnowledgeStock
): KnowledgeStock {
    // Filter atoms belonging to this note
    const noteAtoms = atoms.filter(atom => atom.sourceId === note.id);

    // Calculate holdings
    const totalHoldings = noteAtoms.length;
    const masteredHoldings = noteAtoms.filter(a => a.mastery >= 4).length;

    // Calculate performance (average mastery)
    const avgMastery = noteAtoms.length > 0
        ? noteAtoms.reduce((sum, a) => sum + a.mastery, 0) / noteAtoms.length
        : 0;
    const performance = Math.round((avgMastery / 5) * 100);

    // Determine trend (compare with existing data)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (existingStock) {
        if (performance > existingStock.performance) trend = 'up';
        else if (performance < existingStock.performance) trend = 'down';
    }

    // Use courseName if available, otherwise use a default
    const stockName = note.courseName || `課程 ${note.id.slice(0, 8)}`;

    return {
        id: note.id,
        name: stockName,
        sourceId: note.id,
        icon: getStockIcon(stockName),
        totalHoldings,
        masteredHoldings,
        monthlyDividend: existingStock?.monthlyDividend || 0,
        totalEarnings: existingStock?.totalEarnings || 0,
        lastDividendDate: existingStock?.lastDividendDate || 0,
        performance,
        trend
    };
}

/**
 * Calculate dividend from review quality
 */
export function calculateDividend(quality: number): number {
    // Quality: 0, 2, 4, 5
    // Dividend: $0, $20, $40, $50
    return quality * 10;
}

/**
 * Get stock statistics
 */
export function getStockStats(stocks: KnowledgeStock[]): StockStats {
    if (stocks.length === 0) {
        return {
            totalStocks: 0,
            totalValue: 0,
            topPerformer: null,
            monthlyReturn: 0
        };
    }

    const totalValue = stocks.reduce((sum, s) => sum + s.totalEarnings, 0);
    const monthlyReturn = stocks.reduce((sum, s) => sum + s.monthlyDividend, 0);
    const topPerformer = stocks.reduce((best, current) =>
        current.performance > best.performance ? current : best
    );

    return {
        totalStocks: stocks.length,
        totalValue,
        topPerformer,
        monthlyReturn
    };
}
