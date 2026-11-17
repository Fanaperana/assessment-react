import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () =>
      setDark(
        localStorage.getItem("focusnotes:theme")
          ? localStorage.getItem("focusnotes:theme") === "dark"
          : media.matches,
      );
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  return {
    dark,
    toggle: () =>
      setDark((value) => {
        localStorage.setItem("focusnotes:theme", value ? "light" : "dark");
        return !value;
      }),
  };
}
