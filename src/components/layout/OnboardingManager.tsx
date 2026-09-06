import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export default function OnboardingManager() {
  const { onboardingStep, setOnboardingStep, setPetMessage, setPetActive, notes } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    if (onboardingStep === 0 && location.pathname === '/') {
      // Step 1: Welcome
      const timer = setTimeout(() => {
        setPetActive(true);
        setPetMessage("👋 歡迎來到 AI 學習助理！我是您的專屬學習夥伴。\n請先點擊左側的「上傳筆記」來建立您的第一份教材吧！");
        setOnboardingStep(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep, location.pathname, setPetActive, setPetMessage, setOnboardingStep]);

  useEffect(() => {
    // Step 2: After uploading a note
    if (onboardingStep === 1 && notes.length > 0 && location.pathname !== '/memory') {
      const timer = setTimeout(() => {
        setPetActive(true);
        setPetMessage("✨ 太棒了！AI 已經為您萃取了知識卡片，快去左邊的「記憶庫」看看吧！");
        setOnboardingStep(2);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep, notes.length, location.pathname, setPetActive, setPetMessage, setOnboardingStep]);

  useEffect(() => {
    // Step 3: When in memory bank
    if (onboardingStep === 2 && location.pathname === '/memory') {
      const timer = setTimeout(() => {
        setPetActive(true);
        setPetMessage("🧠 這裡會存放所有知識卡片！如果想要有系統地複習，您可以去「讀書計畫」讓 AI 為您排程喔！");
        setOnboardingStep(3); // Completed basic onboarding
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep, location.pathname, setPetActive, setPetMessage, setOnboardingStep]);

  return null;
}
