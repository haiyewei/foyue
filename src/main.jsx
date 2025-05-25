import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { useMemo, useState, useEffect, createContext, useContext } from 'react'

// 创建主题模式上下文
export const ThemeModeContext = createContext({
  toggleThemeMode: () => {},
  mode: 'light',
  themeMode: 'system', // 'system', 'light', 'dark'
  setThemeMode: () => {},
});

// 支持系统深浅模式的应用包装器
const ThemedApp = () => {
  // 检测系统颜色方案
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // 状态存储当前主题模式和偏好设置
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const [themeMode, setThemeMode] = useState('system'); // 默认跟随系统
  
  // 监听系统主题变化
  useEffect(() => {
    if (themeMode !== 'system') return; // 如果不是跟随系统，则不监听
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setMode(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);
  
  // 监听主题模式变化
  useEffect(() => {
    if (themeMode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(isDark ? 'dark' : 'light');
    } else {
      setMode(themeMode);
    }
  }, [themeMode]);
  
  // 切换主题模式的函数
  const toggleThemeMode = () => {
    // 如果当前是跟随系统，切换为明亮模式
    if (themeMode === 'system') {
      setThemeMode('light');
    } 
    // 如果当前是明亮模式，切换为暗黑模式
    else if (themeMode === 'light') {
      setThemeMode('dark');
    } 
    // 如果当前是暗黑模式，切换回跟随系统
    else {
      setThemeMode('system');
    }
  };
  
  // 创建主题上下文值
  const themeModeContextValue = useMemo(() => ({
    toggleThemeMode,
    mode,
    themeMode,
    setThemeMode,
  }), [mode, themeMode]);
  
  // 创建响应式主题
  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode,
      },
    }), 
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={themeModeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>,
)
