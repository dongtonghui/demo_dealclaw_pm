import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwipeableItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  className?: string;
}

const SWIPE_THRESHOLD = 80;

export function SwipeableItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className,
}: SwipeableItemProps) {
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const leftBgOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const rightBgOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const leftIconScale = useTransform(x, [-SWIPE_THRESHOLD - 20, -SWIPE_THRESHOLD], [1.2, 1]);
  const rightIconScale = useTransform(x, [SWIPE_THRESHOLD, SWIPE_THRESHOLD + 20], [1, 1.2]);

  const handleDragEnd = () => {
    const currentX = x.get();
    
    if (currentX < -SWIPE_THRESHOLD && onSwipeLeft) {
      // Trigger left action
      animate(x, -SWIPE_THRESHOLD, { type: "spring", stiffness: 300, damping: 30 });
      setTimeout(() => {
        onSwipeLeft();
        animate(x, 0, { type: "spring", stiffness: 500, damping: 50 });
      }, 200);
    } else if (currentX > SWIPE_THRESHOLD && onSwipeRight) {
      // Trigger right action
      animate(x, SWIPE_THRESHOLD, { type: "spring", stiffness: 300, damping: 30 });
      setTimeout(() => {
        onSwipeRight();
        animate(x, 0, { type: "spring", stiffness: 500, damping: 50 });
      }, 200);
    } else {
      // Snap back
      animate(x, 0, { type: "spring", stiffness: 500, damping: 50 });
    }
    
    setIsDragging(false);
  };

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex">
        {/* Left Action Background */}
        {leftAction && (
          <motion.div
            style={{ opacity: leftBgOpacity }}
            className={cn(
              "flex-1 flex items-center justify-end pr-4",
              leftAction.color
            )}
          >
            <motion.div style={{ scale: leftIconScale }} className="text-white">
              {leftAction.icon}
            </motion.div>
          </motion.div>
        )}
        
        {/* Right Action Background */}
        {rightAction && (
          <motion.div
            style={{ opacity: rightBgOpacity }}
            className={cn(
              "flex-1 flex items-center justify-start pl-4",
              rightAction.color
            )}
          >
            <motion.div style={{ scale: rightIconScale }} className="text-white">
              {rightAction.icon}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Draggable Content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: rightAction ? -SWIPE_THRESHOLD - 20 : 0, right: leftAction ? SWIPE_THRESHOLD + 20 : 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        className={cn(
          "relative z-10 bg-background",
          isDragging && "cursor-grabbing"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Pull to Refresh Component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && startYRef.current > 0) {
      const diff = e.touches[0].clientY - startYRef.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.5, 100));
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    startYRef.current = 0;
  };

  return (
    <div className="relative">
      {/* Refresh Indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ height: `${pullDistance}px` }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
        >
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${pullDistance}px)` }}
        className={cn("transition-transform", className)}
      >
        {children}
      </div>
    </div>
  );
}

// Touch Feedback Button
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ripple?: boolean;
}

export function TouchButton({ children, ripple = true, className, ...props }: TouchButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }
    props.onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      {...props}
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden tap-highlight-transparent active:scale-[0.98] transition-transform",
        className
      )}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
          }}
        />
      ))}
      {children}
    </button>
  );
}
