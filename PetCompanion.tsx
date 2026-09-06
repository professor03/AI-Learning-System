import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PET_SPRITES, type PetAction } from '../../lib/petSprites';
import { QUOTES, type Quote } from '../../lib/quotes';
import clsx from 'clsx';

interface Position {
  x: number;
  y: number;
}

type PetMode = 'docked' | 'active';
type PetBehavior = 'wander' | 'sleep' | 'play' | 'cursor' | 'expression';

const getViewport = () => ({
  width: typeof window !== 'undefined' ? window.innerWidth : 360,
  height: typeof window !== 'undefined' ? window.innerHeight : 640,
});



const randomPosition = (): Position => {
  const { width, height } = getViewport();
  return {
    x: Math.max(100, Math.min(width - 200, Math.random() * width)),
    y: Math.max(100, Math.min(height - 200, Math.random() * height)),
  };
};

const clampPosition = (pos: Position, size: { w: number; h: number }, padding = 16): Position => {
  const { width, height } = getViewport();
  const minY = 80; // Height of TopNav + padding
  const maxX = width - padding - size.w;
  const maxY = height - padding - size.h;

  return {
    x: Math.max(padding, Math.min(maxX, pos.x)),
    y: Math.max(minY, Math.min(maxY, pos.y)),
  };
};

const behaviorActions: Record<PetBehavior, PetAction> = {
  wander: 'walk',
  sleep: 'sleep',
  play: 'play',
  cursor: 'jump',
  expression: 'happy',
  // Add fallback for missing keys if necessary
};

// Helper: Get level badge style based on level
const getLevelBadgeStyle = (level: number) => {
  if (level <= 3) {
    // Bronze: Lv.1-3
    return {
      bg: 'bg-gradient-to-br from-orange-600 to-orange-700',
      text: 'text-orange-100',
      border: 'border-orange-300',
      icon: '🥉'
    };
  }
  if (level <= 6) {
    // Silver: Lv.4-6
    return {
      bg: 'bg-gradient-to-br from-gray-400 to-gray-500',
      text: 'text-gray-900',
      border: 'border-gray-200',
      icon: '🥈'
    };
  }
  if (level <= 9) {
    // Gold: Lv.7-9
    return {
      bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
      text: 'text-yellow-900',
      border: 'border-yellow-200',
      icon: '🥇'
    };
  }
  // Diamond: Lv.10+
  return {
    bg: 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500',
    text: 'text-white',
    border: 'border-white',
    icon: '💎'
  };
};

const PetCompanion = () => {
  const { selectedPet, petTrigger, isPetActive, setPetActive, petHealth, petHunger, petXP, petLevel, feedPet, petMood } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);

  // Handle Resize for isMobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // State
  const [mode, setMode] = useState<PetMode>('docked');
  const [dockPosition, setDockPosition] = useState<Position>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    // Mobile: Top-Right (near avatar 'A')
    if (width < 768) {
      return { x: width - 80, y: 20 };
    }
    // Desktop: Top-Left default
    return { x: 20, y: 80 };
  });
  const [activePosition, setActivePosition] = useState<Position>(dockPosition);
  const [behavior, setBehavior] = useState<PetBehavior>('sleep');
  const [frameIndex, setFrameIndex] = useState(0);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  // Refs
  const autoReturnTimer = useRef<number | null>(null);

  // Sync with global active state
  useEffect(() => {
    if (isPetActive) {
      wakeUp(undefined, false); // Don't trigger recursive setPetActive
    } else {
      setMode('docked');
    }
  }, [isPetActive]);

  // Load saved dock position
  useEffect(() => {
    const saved = localStorage.getItem('pet-dock-position');
    if (saved) {
      try {
        setDockPosition(JSON.parse(saved));
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Save dock position
  useEffect(() => {
    localStorage.setItem('pet-dock-position', JSON.stringify(dockPosition));
  }, [dockPosition]);

  // Handle external triggers (Task completion, Pomodoro)
  useEffect(() => {
    if (petTrigger > 0) {
      setPetActive(true); // Activate globally
      wakeUp('expression');
    }
  }, [petTrigger, setPetActive]);

  // Handle global message trigger
  const { petMessage } = useAppStore();
  useEffect(() => {
    if (petMessage) {
      setPetActive(true);
      wakeUp('expression', false);
    }
  }, [petMessage]);

  // Auto-return logic
  const resetAutoReturn = () => {
    if (autoReturnTimer.current) clearTimeout(autoReturnTimer.current);
    autoReturnTimer.current = window.setTimeout(() => {
      setBehavior('sleep');
      setTimeout(() => setMode('docked'), 1000); // Wait for sleep anim
    }, 10000); // 10 seconds (User request)
  };

  const wakeUp = (specificBehavior: PetBehavior = 'expression', updateGlobal = true) => {
    setMode('active');
    setBehavior(specificBehavior);
    setActivePosition(dockPosition); // Start from dock
    resetAutoReturn();

    if (updateGlobal && !isPetActive) {
      setPetActive(true);
    }

    // Trigger wandering after a short delay if it's a normal wake up
    if (specificBehavior === 'expression') {
      const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setCurrentQuote(randomQuote);

      // Move after showing quote for a bit
      setTimeout(() => {
        setCurrentQuote(null);
        setBehavior('wander');
        setActivePosition(randomPosition());
      }, 3000);
    } else if (specificBehavior === 'wander') {
      setTimeout(() => {
        setActivePosition(randomPosition());
      }, 100);
    }
  };

  // Effect to manage auto-return on state changes
  useEffect(() => {
    resetAutoReturn();
    return () => {
      if (autoReturnTimer.current) window.clearTimeout(autoReturnTimer.current);
    };
  }, [mode, behavior, activePosition]);

  // Animation Loop
  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrameIndex((prev) => prev + 1);
    }, behavior === 'sleep' ? 1000 : 200);
    return () => window.clearInterval(interval);
  }, [behavior]);

  // Draggable Logic
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    hasDragged.current = false;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      hasDragged.current = true;
    }

    const rawPos = {
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    };

    const currentSize = mode === 'docked'
      ? (isMobile ? 48 : 64)
      : 128;

    const newPos = clampPosition(rawPos, { w: currentSize, h: currentSize });

    // Update appropriate position based on mode
    if (mode === 'docked') {
      setDockPosition(newPos);
    } else {
      setActivePosition(newPos);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  // Render
  const frames = PET_SPRITES[selectedPet][behaviorActions[behavior]] ?? [];
  const spriteMarkup = frames[frameIndex % Math.max(frames.length, 1)];

  const currentPos = mode === 'docked' ? dockPosition : activePosition;

  // Global visibility check
  // On Mobile: Respect isPetActive (can be hidden)
  // On Desktop: Always show Smart Dock (cannot be completely hidden, as per "Smart Dock" mode)
  if (isMobile && !isPetActive) return null;

  return (
    <div className={clsx(
      "pointer-events-none z-50 overflow-hidden fixed inset-0"
    )}>
      {/* Pet Container */}
      <div
        className={clsx(
          "pointer-events-auto absolute transition-all duration-500 ease-out flex flex-col items-center justify-center group",
          isDragging ? "cursor-grabbing" : "cursor-pointer hover:scale-110"
        )}
        style={{
          transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
          width: mode === 'docked' ? (isMobile ? '48px' : '64px') : '128px',
          height: mode === 'docked' ? (isMobile ? '48px' : '64px') : '128px',
          opacity: isDragging ? 0.9 : 1,
          touchAction: 'none', // Prevent scrolling while dragging
        }}
        onPointerDown={handlePointerDown}
        onClick={() => {
          if (!hasDragged.current) {
            if (mode === 'docked') wakeUp();
            else {
              setBehavior('expression');
              const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
              setCurrentQuote(randomQuote);
              resetAutoReturn();
            }
          }
        }}
      >
        {/* Smart Dock Bubble (Visible only when docked) */}
        <div className={clsx(
          "absolute inset-0 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-lg transition-all duration-500",
          mode === 'docked' ? "opacity-100 scale-100 group-hover:bg-white/50 group-hover:shadow-xl" : "opacity-0 scale-50"
        )}>
          {/* Inner Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent" />
        </div>

        {/* Sprite */}
        <div
          className={clsx(
            "relative transition-all duration-500",
            mode === 'docked' ? (isMobile ? "w-8 h-8" : "w-10 h-10") : "w-32 h-32",
            petMood === 'sad' && "grayscale brightness-75 hover:animate-shake"
          )}
          dangerouslySetInnerHTML={{ __html: spriteMarkup ?? '' }}
        />

        {/* Stats Bars (Active Only) */}
        {mode === 'active' && (
          <div className="absolute -bottom-12 w-36 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Health Bar */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-red-500">HP</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-white/50">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${petHealth}%` }}
                />
              </div>
            </div>
            {/* Hunger Bar */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-orange-500">飢餓</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-white/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${petHunger > 70 ? 'bg-red-500' : petHunger > 40 ? 'bg-orange-400' : 'bg-green-400'
                    }`}
                  style={{ width: `${petHunger}%` }}
                />
              </div>
            </div>
            {/* XP Bar */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-blue-500">XP</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-white/50">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(petXP / (petLevel * 100)) * 100}%` }}
                />
              </div>
            </div>
            {/* Feed Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const result = feedPet();
                // Show message in console or toast (can enhance later)
                console.log(result.message);
              }}
              className="mt-1 px-2 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-[10px] font-bold rounded-full hover:from-green-500 hover:to-green-600 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1"
            >
              <span>🍖</span>
              <span>餵食</span>
            </button>
          </div>
        )}

        {/* Level Badge (Active Only) */}
        {mode === 'active' && (() => {
          const badgeStyle = getLevelBadgeStyle(petLevel);
          return (
            <div className={`absolute -top-2 -right-2 ${badgeStyle.bg} ${badgeStyle.text} text-xs font-bold px-2 py-1 rounded-full border-2 ${badgeStyle.border} shadow-lg flex items-center gap-1`}>
              <span>{badgeStyle.icon}</span>
              <span>Lv.{petLevel}</span>
            </div>
          );
        })()}

        {/* Quote Bubble (Active Only) */}
        {(currentQuote || petMessage) && mode === 'active' && (() => {
          // Smart Positioning Logic
          const isTop = currentPos.y < 200; // Increased threshold
          const { width } = getViewport();

          // Horizontal Clamping
          // Bubble width is w-48 (12rem = 192px)
          // Pet center is currentPos.x + 64 (half of 128)
          const petCenter = currentPos.x + 64;
          const isLeftEdge = petCenter < 100;
          const isRightEdge = petCenter > width - 100;

          // Default: Top-Left relative to pet (to avoid Level Badge at Top-Right)
          let horizontalClass = "right-1/2 translate-x-1/4";

          if (isRightEdge) horizontalClass = "right-full translate-x-4";
          if (isLeftEdge) horizontalClass = "left-full -translate-x-4";

          // Vertical Positioning
          // Default above
          let verticalClass = "bottom-full mb-2";

          if (isTop) {
            verticalClass = "top-0 mt-0";
          }

          return (
            <div className={clsx(
              "absolute w-48 bg-white/90 backdrop-blur rounded-2xl p-3 shadow-xl border border-white/60 text-center animate-fade-in pointer-events-none z-50",
              horizontalClass,
              verticalClass
            )}>
              <p className="text-xs font-medium text-gray-700 mb-1">
                {petMessage ? `"${petMessage}"` : `"${currentQuote?.text}"`}
              </p>
              {!petMessage && <p className="text-[10px] text-primary-600">— {currentQuote?.author}</p>}
            </div>
          );
        })()}

        {/* Zzz Animation (Docked & Sleep) */}
        {mode === 'docked' && (
          <div className="absolute -top-1 -right-1 text-[10px] text-blue-400 font-bold animate-pulse bg-white/80 px-1 rounded-full shadow-sm group-hover:hidden">
            Zzz
          </div>
        )}

        {/* Wake Up Hint (Docked & Hover) */}
        {mode === 'docked' && !isMobile && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white bg-black/50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            點擊喚醒
          </div>
        )}

        {/* Close Button (Mobile Active Mode Only) */}
        {mode === 'active' && isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPetActive(false);
              setMode('docked');
            }}
            className="absolute -top -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg active:scale-95 transition-all"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default PetCompanion;
