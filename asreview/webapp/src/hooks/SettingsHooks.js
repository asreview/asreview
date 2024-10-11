import { useState } from "react";

const useFontSize = (value = 1) => {
  let localFontSize = parseInt(window.localStorage.getItem("fontSize"));
  localFontSize =
    localFontSize === 0 ||
    localFontSize === 1 ||
    localFontSize === 2 ||
    localFontSize === 3
      ? localFontSize
      : value;

  const [fontSize, setFontSize] = useState(localFontSize);

  const handleFontSizeChange = (size) => {
    window.localStorage.setItem("fontSize", size);
    setFontSize(size);
  };

  return [fontSize, handleFontSizeChange];
};

export { useFontSize };
