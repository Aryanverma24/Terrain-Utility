import { useState, useEffect } from "react";

const LandCardSlideshow = ({ land, fullDocs }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Flatten all documents from collections
  const allDocs = fullDocs?.flatMap(collection => collection.documents || []) || [];

  // Filter only LandPhotos
  const landPhotos = [
    land.image, // main image
    ...allDocs.filter(doc => doc.type === "LandPhotos").map(doc => doc.file)
  ].filter(Boolean);

  useEffect(() => {
    if (landPhotos.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev === landPhotos.length - 1 ? 0 : prev + 1));
      }, 3000); // 3s per slide
      return () => clearInterval(interval);
    }
  }, [landPhotos]);

  if (!landPhotos.length) {
    return <img src="/default-image.jpg" alt="land" className="rounded-xl h-44 w-full object-cover mb-3 shadow-md" />;
  }

  return (
    <div className="relative rounded-xl overflow-hidden h-44 w-full shadow-md mb-3">
      <img
        src={`http://localhost:5000/uploads/${landPhotos[currentSlide]}`}
        alt={`Land Photo ${currentSlide + 1}`}
        className="rounded-xl h-44 w-full object-cover transition-transform duration-500"
      />
      {landPhotos.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {landPhotos.map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                currentSlide === idx ? "bg-cyan-400" : "bg-gray-400"
              }`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default LandCardSlideshow;
