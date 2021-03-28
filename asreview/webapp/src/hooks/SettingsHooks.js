import { useEffect, useState } from 'react'
import brown from '@material-ui/core/colors/brown';


const useDarkMode = () => {

  let lightTheme = {
    palette: {
      type: "light",
      primary: brown,
    },
    overrides: {
      debug: {
        color: "#1E824C",
      },
      MuiLink: {
        root: {
          color: "#DC004E",
        },
      },
    },
  };

  let darkTheme = {
    palette: {
      type: "dark",
      primary: brown,
    },
    overrides: {
      debug: {
        color: "#65A665",
      },
      MuiLink: {
        root: {
          color: "#F48FB1",
        },
      },
    },
  }

  const [theme, setTheme] = useState(lightTheme);

  const toggleDarkMode = () => {

    if (theme.palette.type === "light") {
      window.localStorage.setItem("themeType", "dark")
      setTheme(darkTheme)
    } else {
      window.localStorage.setItem("themeType", "light")
      setTheme(lightTheme)
    }
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem("themeType");
    if (theme.palette.type !== localTheme && localTheme !== null) {
      setTheme(darkTheme)
    }
  }, [darkTheme, theme.palette.type]);

  console.log(theme);

  return [theme, toggleDarkMode]
};


const useTextSize = () => {

  const [textSize, setTextSize] = useState("normal");

  const handleTextSizeChange = (event) => {

    window.localStorage.setItem("textSize", event.target.value)
    setTextSize(event.target.value);
  };

  useEffect(() => {
    const localTextSize = window.localStorage.getItem("textSize");
    if (textSize !== localTextSize && localTextSize !== null) {
      setTextSize(localTextSize)
    }
  }, [textSize]);

  return [textSize, handleTextSizeChange]
};


const useUndoEnabled = () => {

  const [undoEnabled, setUndoEnabled] = useState(true);

  const toggleUndoEnabled = () => {
    window.localStorage.setItem("undoEnabled", !undoEnabled);
    setUndoEnabled(a => (!a));
  };

  useEffect(() => {
    const localUndoEnabled = window.localStorage.getItem("undoEnabled");
    const localUndoEnabledIsTrue = localUndoEnabled === "true";
    if (undoEnabled !== localUndoEnabledIsTrue && localUndoEnabled !== null) {
      setUndoEnabled(localUndoEnabledIsTrue);
    };
  }, [undoEnabled]);

  return [undoEnabled, toggleUndoEnabled]
};


const useKeyPressEnabled = () => {

  const [keyPressEnabled, setKeyPressEnabled] = useState(false);

  const toggleKeyPressEnabled = () => {
    window.localStorage.setItem("keyPressEnabled", !keyPressEnabled);
    setKeyPressEnabled(a => (!a));
  };

  useEffect(() => {
    const localKeyPressEnabled = window.localStorage.getItem("keyPressEnabled");
    const localKeyPressEnabledIsTrue = localKeyPressEnabled === "true";
    if (keyPressEnabled !== localKeyPressEnabledIsTrue && localKeyPressEnabled !== null) {
      setKeyPressEnabled(localKeyPressEnabledIsTrue);
    };
  }, [keyPressEnabled]);

  return [keyPressEnabled, toggleKeyPressEnabled]
}


export { useDarkMode, useTextSize, useUndoEnabled, useKeyPressEnabled };
