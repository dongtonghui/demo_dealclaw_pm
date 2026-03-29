import { useRef, useCallback, useEffect, useState } from "react";

export interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

export interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isDragging: boolean;
}

export function useSwipeGesture(config: SwipeConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefault = true,
  } = config;

  const touchRef = useRef<TouchState | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isDragging: true,
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current?.isDragging) return;
    
    if (preventDefault) {
      // 防止页面滚动当水平滑动时
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchRef.current.startX);
      const dy = Math.abs(touch.clientY - touchRef.current.startY);
      
      if (dx > dy && (onSwipeLeft || onSwipeRight)) {
        e.preventDefault();
      }
    }
  }, [preventDefault, onSwipeLeft, onSwipeRight]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current?.isDragging) return;

    const touch = e.changedTouches[0];
    const { startX, startY, startTime } = touchRef.current;
    
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const dt = Date.now() - startTime;
    
    // 快速滑动阈值（时间小于 300ms）
    const isQuickSwipe = dt < 300;
    const actualThreshold = isQuickSwipe ? threshold / 2 : threshold;
    
    // 判断主要滑动方向
    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    
    if (isHorizontal) {
      if (Math.abs(dx) > actualThreshold) {
        if (dx > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (dx < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      if (Math.abs(dy) > actualThreshold) {
        if (dy > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (dy < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    touchRef.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}

// 长按 Hook
export function useLongPress(
  onLongPress: () => void,
  onClick?: () => void,
  delay: number = 500
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(() => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const end = useCallback(() => {
    clear();
    if (!isLongPressRef.current && onClick) {
      onClick();
    }
  }, [clear, onClick]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: end,
  };
}

// 双击 Hook
export function useDoubleTap(
  onDoubleTap: () => void,
  onSingleTap?: () => void,
  delay: number = 300
) {
  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(() => {
    setTapCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (tapCount === 1) {
      timerRef.current = setTimeout(() => {
        setTapCount(0);
        onSingleTap?.();
      }, delay);
    } else if (tapCount === 2) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setTapCount(0);
      onDoubleTap();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [tapCount, onDoubleTap, onSingleTap, delay]);

  return handleTap;
}

// 捏合缩放 Hook
export function usePinch(
  onPinch: (scale: number) => void,
  onPinchEnd?: () => void
) {
  const initialDistanceRef = useRef<number | null>(null);
  const scaleRef = useRef(1);

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current) {
      const distance = getDistance(e.touches);
      const scale = distance / initialDistanceRef.current;
      scaleRef.current = scale;
      onPinch(scale);
    }
  }, [onPinch]);

  const onTouchEnd = useCallback(() => {
    initialDistanceRef.current = null;
    scaleRef.current = 1;
    onPinchEnd?.();
  }, [onPinchEnd]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

// 滚动方向检测 Hook
export function useScrollDirection(threshold: number = 10) {
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateDirection = () => {
      const scrollY = window.scrollY;
      const diff = scrollY - lastScrollY.current;

      if (Math.abs(diff) > threshold) {
        setDirection(diff > 0 ? "down" : "up");
      }

      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateDirection);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return direction;
}

// 阻止弹性滚动 Hook (iOS)
export function usePreventBounce(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const preventBounce = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const scrollable = target.closest('[data-scrollable="true"]');
      
      if (!scrollable) {
        e.preventDefault();
        return;
      }

      const el = scrollable as HTMLElement;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight;

      if ((atTop && e.touches[0].clientY > 0) || 
          (atBottom && e.touches[0].clientY < 0)) {
        e.preventDefault();
      }
    };

    element.addEventListener("touchmove", preventBounce, { passive: false });
    return () => element.removeEventListener("touchmove", preventBounce);
  }, [ref]);
}
