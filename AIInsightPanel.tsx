import { motion } from 'framer-motion';
import Card from '../ui/Card';

interface AIInsightPanelProps {
    insights: string[];
}

export default function AIInsightPanel({ insights }: AIInsightPanelProps) {
    if (insights.length === 0) return null;

    return (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 mb-6">
            <div className="flex items-start gap-4">
                <div className="bg-white p-2 rounded-full shadow-sm text-2xl">
                    🤖
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-indigo-900 mb-2">AI 學習教練洞察</h3>
                    <div className="space-y-2">
                        {insights.map((insight, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-2 text-indigo-800 bg-white/60 px-3 py-2 rounded-lg text-sm font-medium"
                            >
                                <span className="text-indigo-500">•</span>
                                <p>{insight}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
