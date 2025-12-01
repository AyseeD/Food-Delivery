import { useState, useRef, useEffect } from "react";
import "../styles/CategorySlider.css";

export default function CategorySlider({
  categories,
  onSelectCategory,
  autoplay = true,
  intervalMs = 2200,     // scroll range
  stepPx = 220,          
  pauseOnHover = true,
}) {
  const [selected, setSelected] = useState("All");
  const sliderRef = useRef(null);
  const hoverRef = useRef(false);
  const userInteractingRef = useRef(false);
  const timerRef = useRef(null);

  const handleSelect = (category) => {
    setSelected(category);
    onSelectCategory(category);
  };

  const scrollLeft = () => {
    userInteractingRef.current = true;
    sliderRef.current?.scrollBy({ left: -stepPx, behavior: "smooth" });
    setTimeout(() => (userInteractingRef.current = false), 2000);
  };

  const scrollRight = () => {
    userInteractingRef.current = true;
    sliderRef.current?.scrollBy({ left: stepPx, behavior: "smooth" });
    setTimeout(() => (userInteractingRef.current = false), 2000);
  };

  const autoStep = () => {
    const el = sliderRef.current;
    if (!el) return;
    const atEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;
    if (atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: stepPx, behavior: "smooth" });
    }
  };

  // Auto-play 
  useEffect(() => {
    if (!autoplay) return;

    const start = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (hoverRef.current) return;
        if (userInteractingRef.current) return;
        if (document.hidden) return;
        const prefersReduced =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;
        autoStep();
      }, intervalMs);
    };

    start();

  
    const onVisibility = () => {
      if (document.hidden) {
        clearInterval(timerRef.current);
      } else {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [autoplay, intervalMs, stepPx]);

  return (
    <div
      className="category-slider-wrapper"
      onMouseEnter={() => pauseOnHover && (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      <button className="arrow-btn left" onClick={scrollLeft} aria-label="Scroll left">
        ←
      </button>

      <div className="category-slider" ref={sliderRef}>
        {[{ name: "All", img_url: "/images/all.png" }, ...categories].map((category, index) => (
          <button
            key={index}
            className={`category-card ${selected === category.name ? "active" : ""}`}
            onClick={() => handleSelect(category.name)}
          >
            <div className="category-image-wrapper">
              <img
                src={category.img_url}
                alt={category.name}
                className="category-image"
              />
            </div>
            <p>{category.name}</p>
          </button>
        ))}
      </div>

      <button className="arrow-btn right" onClick={scrollRight} aria-label="Scroll right">
        →
      </button>
    </div>
  );
}
