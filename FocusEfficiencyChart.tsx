import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import Card from '../ui/Card';

interface FocusEfficiencyChartProps {
    data: { date: string; minutes: number }[];
}

export default function FocusEfficiencyChart({ data }: FocusEfficiencyChartProps) {
    return (
        <Card className="p-6 h-full">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-xl">⚡</span> 專注效率趨勢 (近7日)
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(val) => val.slice(5)} // Show MM-DD
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="minutes" radius={[6, 6, 0, 0]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.minutes >= 50 ? '#8b5cf6' : entry.minutes >= 25 ? '#a78bfa' : '#e2e8f0'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
