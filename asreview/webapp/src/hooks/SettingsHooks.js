import { useEffect, useState } from "react";

import { fontSizeOptions, getDesignTokens } from "globals.js";

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
  const [theme, setTheme] = useState(getDesignTokens("light"));

  const toggleDarkMode = () => {
    if (theme.palette.mode === "light") {
      window.localStorage.setItem("themeType", "dark");
      setTheme(getDesignTokens("dark"));
    } else {
      window.localStorage.setItem("themeType", "light");
      setTheme(getDesignTokens("light"));
    }
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem("themeType");
    if (theme.palette.mode !== localTheme && localTheme !== null) {
      setTheme(getDesignTokens("dark"));
    }
  }, [theme.palette.mode]);

  return [theme, toggleDarkMode];
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

export { useRowsPerPage, useDarkMode, useFontSize };
