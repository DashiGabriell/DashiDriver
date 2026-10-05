/**
 * Gráficos Theme for LocaDashi1
 * Segue a paleta de cores do modo dark definida no plano.
 */

export const darkChartTheme = {
  background: "#000000",
  text: "#FBFBFB",
  grid: "#2A2A2A",
  tooltip: {
    background: "#121212",
    border: "#2A2A2A",
    text: "#FBFBFB",
  },
  colors: {
    primary: "#FFBD4C",    // Yellow
    secondary: "#F16A69",  // Sunset Start
    success: "#4ADE80",
    warning: "#FB923C",
    error: "#FF6B6B",
    marble: "#FBFBFB",
  },
};

export const sunsetGradient = (id: string = "sunsetGradient") => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stopColor="#F16A69" />
    <stop offset="100%" stopColor="#FFBD4C" />
  </linearGradient>
);
