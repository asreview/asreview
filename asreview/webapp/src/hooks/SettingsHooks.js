import { useEffect, useState } from "react";

const useRowsPerPage = () => {
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRowsPerPage = (rows) => {
    window.localStorage.setItem("rowsPerPage", rows);
    setRowsPerPage(rows);
  };

  useEffect(() => {
    const localRowsPerPage = window.localStorage.getItem("rowsPerPage");
    if (localRowsPerPage !== null && rowsPerPage !== localRowsPerPage) {
      setRowsPerPage(parseInt(localRowsPerPage));
    }
  }, [rowsPerPage]);

  return [rowsPerPage, handleRowsPerPage];
};

const useDarkMode = () => {
  const [mode, setMode] = useState("light");

  const toggleDarkMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    window.localStorage.setItem("themeType", newMode);
    setMode(newMode);
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem("themeType");
    if (localTheme && localTheme !== mode) {
      setMode(localTheme);
    }
  }, [mode]);

  return [mode, toggleDarkMode];
};

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

export { useDarkMode, useFontSize, useRowsPerPage };
