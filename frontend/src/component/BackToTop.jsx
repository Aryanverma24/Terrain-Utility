import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const BackToTop = () => {
  const [visibility, setVisibility] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisibility(true);
      } else {
        setVisibility(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Clean up listener on unmount
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    visibility && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-10 bg-darkGreen text-white p-3 rounded-full z-50 shadow-md"
      >
        <FaArrowUp />
      </button>
    )
  );
};

export default BackToTop;
