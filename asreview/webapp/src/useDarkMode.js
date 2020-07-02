import { useEffect, useState } from 'react'
import brown from '@material-ui/core/colors/brown';


const useDarkMode = () => {

  let defaultTheme = {
    palette: {
      type: "light",
      primary: brown,
    },
  };

  const [theme, setTheme] = useState(defaultTheme)

  const toggleDarkMode = () => {

    if (theme.palette.type === "light") {
      window.localStorage.setItem("theme", "dark")
      setTheme({palette: {...defaultTheme.palette, type: "dark"}})
    } else {
      window.localStorage.setItem("theme", "light")
      setTheme(defaultTheme)
    }
  }

  useEffect(() => {
    const localTheme = window.localStorage.getItem("theme")
    if (theme.palette.type !== localTheme) {
      setTheme({palette: {...defaultTheme.palette, type: "dark"}})
    }
  }, [defaultTheme.palette, theme.palette.type])

  return [theme, toggleDarkMode]
}

export default useDarkMode;
