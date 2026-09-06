import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useMemoryStore } from '../store/useMemoryStore';

export function usePetSystem() {
    const {
        petHealth,
        petHunger,
        petLevel,
        updatePetStats,
        setPetMessage,
        isPetActive
    } = useAppStore();

    const { atoms } = useMemoryStore();
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        // Heartbeat: Run every 60 seconds
        timerRef.current = window.setInterval(() => {
            const now = Date.now();
            // 計算 FSRS 逾期未複習的卡片數量
            const overdueCount = atoms.filter(atom => atom.nextReview < now).length;

            // 肚子餓的速度與「逾期卡片數量」成正比！逾期越多，餓得越快 (最高 +10)
            const hungerPenalty = Math.min(10, 2 + Math.floor(overdueCount / 5));
            const newHunger = Math.min(100, petHunger + hungerPenalty);

            // Health decreases if hungry or if there are too many overdue cards
            let newHealth = petHealth;
            if (newHunger > 80 || overdueCount > 10) {
                const healthPenalty = overdueCount > 10 ? 10 : 5;
                newHealth = Math.max(0, petHealth - healthPenalty);
                
                if (isPetActive) {
                    if (overdueCount > 10) {
                        setPetMessage(`主人... 累積了 ${overdueCount} 張卡片未複習... 我好痛苦 🤕`);
                    } else {
                        setPetMessage("我好餓... 肚子咕嚕咕嚕叫... 🍖");
                    }
                }
            } else if (newHunger < 20 && petHealth < 100 && overdueCount === 0) {
                // Heal if well fed and NO overdue cards
                newHealth = Math.min(100, petHealth + 2);
            }

            updatePetStats({
                hunger: newHunger,
                health: newHealth
            });

        }, 60000); // 1 minute

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [petHealth, petHunger, isPetActive, updatePetStats, setPetMessage, atoms]);

    // Evolution Check
    useEffect(() => {
        if (petLevel === 5) {
            // Trigger evolution event (future)
        }
    }, [petLevel]);
}
