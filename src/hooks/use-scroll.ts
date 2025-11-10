import { useEffect, useState } from "react";

/**
 * 用于监听页面滚动状态，判断滚动距离是否超过指定阈值，最终返回一个布尔值表示滚动状态。
 */
export const useScroll = (threshold = 10) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
};
