import { useState, useEffect, useCallback, useRef } from "react";

// 检测用户是否偏好减少动画
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    
    mediaQuery.addEventListener("change", listener);
    setReducedMotion(mediaQuery.matches);
    
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return reducedMotion;
}

// 根据设备性能调整动画
export function useAnimationConfig() {
  const reducedMotion = useReducedMotion();
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    // 检测设备性能（简单启发式）
    const checkPerformance = () => {
      // 如果是低内存设备或连接节省数据模式
      const connection = (navigator as any).connection;
      if (connection) {
        const saveData = connection.saveData;
        const effectiveType = connection.effectiveType;
        setIsLowPower(saveData || ["2g", "slow-2g"].includes(effectiveType));
      }
    };

    checkPerformance();
  }, []);

  const getTransition = useCallback((
    normal: object,
    reduced?: object
  ) => {
    if (reducedMotion) return reduced || {};
    return normal;
  }, [reducedMotion]);

  const getDuration = useCallback((normal: number, fast?: number) => {
    if (reducedMotion) return 0;
    if (isLowPower) return fast || normal * 0.5;
    return normal;
  }, [reducedMotion, isLowPower]);

  return {
    reducedMotion,
    isLowPower,
    getTransition,
    getDuration,
    // 预设的动画配置
    spring: reducedMotion ? { type: "tween", duration: 0 } : { type: "spring", stiffness: 300, damping: 30 },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: reducedMotion ? { duration: 0 } : { duration: 0.2 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: reducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: reducedMotion ? { duration: 0 } : { duration: 0.2 },
    },
  };
}

// 懒加载 Hook
export function useLazyLoad<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        setHasLoaded(true);
        observer.disconnect();
      }
    }, {
      rootMargin: "50px",
      threshold: 0.01,
      ...options,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible, hasLoaded };
}

// 虚拟列表计算 Hook
export function useVirtualList({
  itemCount,
  itemHeight,
  overscan = 5,
}: {
  itemCount: number;
  itemHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = itemCount * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
  const endIndex = Math.min(itemCount, startIndex + visibleCount);
  const visibleItems = endIndex - startIndex;
  const offsetY = startIndex * itemHeight;

  return {
    containerRef,
    handleScroll,
    virtualItems: {
      startIndex,
      endIndex,
      visibleItems,
      offsetY,
      totalHeight,
    },
  };
}

// 防抖 Hook
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

// 节流 Hook
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  ) as T;
}

// 记忆化计算 Hook
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList,
  maxAge: number = 5000
): T {
  const [value, setValue] = useState<T>(factory);
  const lastUpdateRef = useRef(Date.now());
  const depsRef = useRef(deps);

  useEffect(() => {
    const now = Date.now();
    const depsChanged = !deps.every((dep, i) => dep === depsRef.current[i]);
    const expired = now - lastUpdateRef.current > maxAge;

    if (depsChanged || expired) {
      setValue(factory());
      lastUpdateRef.current = now;
      depsRef.current = deps;
    }
  }, [deps, factory, maxAge]);

  return value;
}

