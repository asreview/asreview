import { useEffect, useState } from "react";

import { darkTheme, lightTheme, fontSizeOptions } from "../globals.js";

const useDarkMode = () => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleDarkMode = () => {
    if (theme.palette.mode === "light") {
      window.localStorage.setItem("themeType", "dark");
      setTheme(darkTheme);
    } else {
      window.localStorage.setItem("themeType", "light");
      setTheme(lightTheme);
    }
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem("themeType");
    if (theme.palette.mode !== localTheme && localTheme !== null) {
      setTheme(darkTheme);
    }
  }, [theme.palette.mode]);

  return [theme, toggleDarkMode];
};

const useFontSize = () => {
  const [fontSize, setFontSize] = useState(fontSizeOptions[1]);

  const handleFontSizeChange = (size) => {
    window.localStorage.setItem(
      "fontSize",
      JSON.stringify([size.value, size.label])
    );
    setFontSize(size);
  };

  useEffect(() => {
    const localFontSize = JSON.parse(window.localStorage.getItem("fontSize"));
    if (localFontSize !== null && fontSize.value !== localFontSize[0]) {
      setFontSize({
        value: localFontSize[0],
        label: localFontSize[1],
      });
    }
  }, [fontSize]);

  return [fontSize, handleFontSizeChange];
};

const useUndoEnabled = () => {
  const [undoEnabled, setUndoEnabled] = useState(true);

  const toggleUndoEnabled = () => {
    window.localStorage.setItem("undoEnabled", !undoEnabled);
    setUndoEnabled((a) => !a);
  };

  useEffect(() => {
    const localUndoEnabled = window.localStorage.getItem("undoEnabled");
    const localUndoEnabledIsTrue = localUndoEnabled === "true";
    if (undoEnabled !== localUndoEnabledIsTrue && localUndoEnabled !== null) {
      setUndoEnabled(localUndoEnabledIsTrue);
    }
  }, [undoEnabled]);

  return [undoEnabled, toggleUndoEnabled];
};

const useKeyPressEnabled = () => {
  const [keyPressEnabled, setKeyPressEnabled] = useState(false);

  const toggleKeyPressEnabled = () => {
    window.localStorage.setItem("keyPressEnabled", !keyPressEnabled);
    setKeyPressEnabled((a) => !a);
  };

  useEffect(() => {
    const localKeyPressEnabled = window.localStorage.getItem("keyPressEnabled");
    const localKeyPressEnabledIsTrue = localKeyPressEnabled === "true";
    if (
      keyPressEnabled !== localKeyPressEnabledIsTrue &&
      localKeyPressEnabled !== null
    ) {
      setKeyPressEnabled(localKeyPressEnabledIsTrue);
    }
  }, [keyPressEnabled]);

  return [keyPressEnabled, toggleKeyPressEnabled];
};

export { useDarkMode, useFontSize, useUndoEnabled, useKeyPressEnabled };
