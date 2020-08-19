import { useEffect, useState } from 'react'
import brown from '@material-ui/core/colors/brown';


const useDarkMode = () => {

  let defaultTheme = {
    palette: {
      type: "light",
      primary: brown,
    },
  };

  const [theme, setTheme] = useState(defaultTheme);

  const toggleDarkMode = () => {

    if (theme.palette.type === "light") {
      window.localStorage.setItem("themeType", "dark")
      setTheme({palette: {...defaultTheme.palette, type: "dark"}})
    } else {
      window.localStorage.setItem("themeType", "light")
      setTheme(defaultTheme)
    }
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem("themeType");
    if (theme.palette.type !== localTheme && localTheme !== null) {
      setTheme({palette: {...defaultTheme.palette, type: "dark"}})
    }
  }, [defaultTheme.palette, theme.palette.type]);

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


const useKeyPress = (targetKey) => {

  const [keyPressed, setKeyPressed] = useState(false);
  
  useEffect(() => {

    const downHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };

    // Add event listeners
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };

  }, [targetKey]);

  return keyPressed;
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


export { useDarkMode, useTextSize, useUndoEnabled, useKeyPress, useKeyPressEnabled };
