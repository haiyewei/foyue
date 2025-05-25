import './App.css'
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Slider,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Abracadabra } from 'abracadabra-cn';

// 文本加密页面组件
const App = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  // 状态变量
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState('AUTO');
  const [abra, setAbra] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // 文言文仿真加密的额外参数
  const [withPunctuation, setWithPunctuation] = useState(true); // q参数
  const [randomness, setRandomness] = useState(50); // r参数
  const [usePianwen, setUsePianwen] = useState(false); // p参数
  const [useLogic, setUseLogic] = useState(false); // l参数
  const [hideFlag, setHideFlag] = useState(false); // 传统加密的q参数

  // 初始化Abracadabra实例
  useEffect(() => {
    try {
      const abraInstance = new Abracadabra();
      setAbra(abraInstance);
    } catch (error) {
      console.error('初始化Abracadabra失败:', error);
      setSnackbar({
        open: true,
        message: '初始化加密库失败',
        severity: 'error'
      });
    }
  }, []);

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 处理文本输入变化
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  // 处理密钥输入变化
  const handleKeyChange = (event) => {
    setKey(event.target.value);
  };

  // 处理加密模式变更
  const handleModeChange = (event) => {
    setMode(event.target.value);
  };

  // 清空输入
  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  // 从剪贴板粘贴内容到输入框
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setSnackbar({
          open: true,
          message: '已从剪贴板粘贴内容',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: '剪贴板为空',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('无法访问剪贴板:', error);
      setSnackbar({
        open: true,
        message: '无法访问剪贴板，请检查浏览器权限',
        severity: 'error'
      });
    }
  };

  // 复制结果到剪贴板
  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
        .then(() => {
          setSnackbar({
            open: true,
            message: '已复制到剪贴板',
            severity: 'success'
          });
        })
        .catch(() => {
          setSnackbar({
            open: true,
            message: '复制失败',
            severity: 'error'
          });
        });
    }
  };

  // 关闭提示消息
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // 处理传统加密
  const handleTraditionalEncryption = (action) => {
    if (!abra) {
      setSnackbar({
        open: true,
        message: '加密库尚未初始化',
        severity: 'error'
      });
      return;
    }

    if (!inputText.trim()) {
      setSnackbar({
        open: true,
        message: '请输入需要处理的文本',
        severity: 'warning'
      });
      return;
    }

    try {
      // 确定使用的模式
      let encryptionMode = mode;
      if (action === 'encrypt') {
        encryptionMode = Abracadabra.ENCRYPT;
      } else if (action === 'decrypt') {
        encryptionMode = Abracadabra.DECRYPT;
      }

      // 使用密钥，如果没有则使用默认密钥 hytool.top
      const passwordKey = key.trim() ? key : "hytool.top";
      
      // 执行加密/解密
      abra.Input(inputText, encryptionMode, passwordKey, hideFlag);
      const result = abra.Output();
      setOutputText(result);

      setSnackbar({
        open: true,
        message: action === 'encrypt' ? '加密成功' : '解密成功',
        severity: 'success'
      });
    } catch (error) {
      console.error('处理失败:', error);
      setSnackbar({
        open: true,
        message: `${action === 'encrypt' ? '加密' : '解密'}失败: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // 处理文言文仿真加密
  const handleWenyanEncryption = (action) => {
    if (!abra) {
      setSnackbar({
        open: true,
        message: '加密库尚未初始化',
        severity: 'error'
      });
      return;
    }

    if (!inputText.trim()) {
      setSnackbar({
        open: true,
        message: '请输入需要处理的文本',
        severity: 'warning'
      });
      return;
    }

    // 检查参数冲突
    if (usePianwen && useLogic) {
      setSnackbar({
        open: true,
        message: '骈文和逻辑句式不能同时启用',
        severity: 'error'
      });
      return;
    }

    try {
      // 确定使用的模式
      const encryptionMode = action === 'encrypt' ? Abracadabra.ENCRYPT : Abracadabra.DECRYPT;
      
      // 使用密钥，如果没有则使用默认密钥 hytool.top
      const passwordKey = key.trim() ? key : "hytool.top";
      
      // 执行加密/解密
      abra.Input_Next(
        inputText, 
        encryptionMode, 
        passwordKey, 
        withPunctuation, 
        action === 'encrypt' ? randomness : undefined,
        action === 'encrypt' ? usePianwen : undefined,
        action === 'encrypt' ? useLogic : undefined
      );
      const result = abra.Output();
      setOutputText(result);

      setSnackbar({
        open: true,
        message: action === 'encrypt' ? '文言加密成功' : '文言解密成功',
        severity: 'success'
      });
    } catch (error) {
      console.error('处理失败:', error);
      setSnackbar({
        open: true,
        message: `${action === 'encrypt' ? '文言加密' : '文言解密'}失败: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // 计算文本区域的行数，根据屏幕大小调整
  const getTextAreaRows = () => {
    if (isMobile) return 6;
    if (isTablet) return 8;
    if (isLargeScreen) return 12;
    return 10; // 默认值
  };

  return (
   
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%',
        margin: '0 auto'
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            padding: { xs: 2, sm: 3 }, 
            width: '100%',
            mb: { xs: 2, sm: 4 }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: { xs: 1, sm: 2 },
            flexWrap: 'wrap'
          }}>
            <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              component="h1" 
              gutterBottom={!isMobile}
              sx={{ 
                fontSize: { 
                  xs: '1.1rem', 
                  sm: '1.3rem', 
                  md: '1.5rem' 
                } 
              }}
            >
              文本加密工具
            </Typography>
          </Box>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            提供传统加密与文言文仿真加密两种方式，支持自定义密钥和多种加密选项。
          </Typography>

          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ mb: { xs: 2, sm: 3 } }}
            variant="fullWidth"
            scrollButtons={isMobile ? "auto" : false}
          >
            <Tab 
              label="传统加密" 
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                minHeight: { xs: '40px', sm: '48px' }
              }} 
            />
            <Tab 
              label="文言文加密" 
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                minHeight: { xs: '40px', sm: '48px' }
              }} 
            />
          </Tabs>

          {/* 输入区域 - 全宽 */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>输入文本</span>
              <Tooltip title="从剪贴板粘贴">
                <IconButton 
                  onClick={handlePaste} 
                  size={isMobile ? "small" : "medium"}
                  color="primary"
                  sx={{ 
                    ml: 1,
                    '&:hover': { 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(144, 202, 249, 0.08)' 
                        : 'rgba(33, 150, 243, 0.08)' 
                    }
                  }}
                >
                  <ContentPasteIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
            </Typography>
            <TextField
              multiline
              rows={getTextAreaRows()}
              value={inputText}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              placeholder="请输入需要加密或解密的文本..."
              size={isMobile ? "small" : "medium"}
            />
            
            <Box sx={{ mt: { xs: 1, sm: 2 } }}>
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: '500',
                  mb: 1
                }}
              >
                密钥
              </Typography>
              <TextField
                value={key}
                onChange={handleKeyChange}
                fullWidth
                variant="outlined"
                placeholder="可选，默认为hytool.top"
                size="small"
              />
              
              {tabValue === 0 && (
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>加密模式</InputLabel>
                    <Select
                      value={mode}
                      label="加密模式"
                      onChange={handleModeChange}
                    >
                      <MenuItem value="AUTO">自动检测</MenuItem>
                      <MenuItem value="ENCRYPT">强制加密</MenuItem>
                      <MenuItem value="DECRYPT">强制解密</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>
            
            {/* 传统加密额外选项 */}
            {tabValue === 0 && (
              <Box sx={{ mt: { xs: 1, sm: 2 } }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={hideFlag} 
                      onChange={(e) => setHideFlag(e.target.checked)} 
                      size={isMobile ? "small" : "medium"}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}>
                      隐蔽模式（隐藏标志位，解密时需强制解密）
                    </Typography>
                  }
                />
              </Box>
            )}
            
            {/* 文言文加密额外选项 */}
            {tabValue === 1 && (
              <Box sx={{ mt: { xs: 1, sm: 2 } }}>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    fontWeight: 'bold'
                  }}
                >
                  文言文加密选项
                </Typography>
                
                {/* 随机性滑块单独一行 */}
                <Box 
                  sx={{ 
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1.5,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 1,
                      fontSize: { xs: '0.75rem', sm: '0.85rem' },
                      fontWeight: 'medium'
                    }}
                  >
                    随机性: {randomness}
                  </Typography>
                  <Slider
                    value={randomness}
                    onChange={(e, value) => setRandomness(value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    size={isMobile ? "small" : "medium"}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' }
                    ]}
                  />
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    值越高，生成文本的随机性越大
                  </Typography>
                </Box>
                
                <Grid container spacing={isMobile ? 1 : 2}>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={withPunctuation} 
                          onChange={(e) => setWithPunctuation(e.target.checked)} 
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}>
                          包含标点符号
                        </Typography>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={usePianwen} 
                          onChange={(e) => {
                            setUsePianwen(e.target.checked);
                            if (e.target.checked) setUseLogic(false);
                          }} 
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}>
                          优先使用骈文句式
                        </Typography>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={useLogic} 
                          onChange={(e) => {
                            setUseLogic(e.target.checked);
                            if (e.target.checked) setUsePianwen(false);
                          }} 
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}>
                          优先使用逻辑句式
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1
            }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleClear}
                size={isMobile ? "small" : (isTablet ? "medium" : "large")}
              >
                清空输入
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tabValue === 0 ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleTraditionalEncryption('encrypt')}
                      startIcon={<LockIcon />}
                      size={isMobile ? "small" : (isTablet ? "medium" : "large")}
                    >
                      加密
                    </Button>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => handleTraditionalEncryption('decrypt')}
                      startIcon={<LockOpenIcon />}
                      size={isMobile ? "small" : (isTablet ? "medium" : "large")}
                    >
                      解密
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleWenyanEncryption('encrypt')}
                      startIcon={<LockIcon />}
                      size={isMobile ? "small" : (isTablet ? "medium" : "large")}
                    >
                      文言加密
                    </Button>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => handleWenyanEncryption('decrypt')}
                      startIcon={<LockOpenIcon />}
                      size={isMobile ? "small" : (isTablet ? "medium" : "large")}
                    >
                      文言解密
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>
          
          {/* 输出区域 - 全宽 */}
          <Box>
            <Typography 
              variant="subtitle1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>输出结果</span>
              {outputText && (
                <Tooltip title="复制到剪贴板">
                  <IconButton 
                    onClick={handleCopy}
                    size={isMobile ? "small" : "medium"}
                    color="primary"
                  >
                    <ContentCopyIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
              )}
            </Typography>
            <TextField
              multiline
              rows={getTextAreaRows()}
              value={outputText}
              fullWidth
              variant="outlined"
              InputProps={{ readOnly: true }}
              size={isMobile ? "small" : "medium"}
              placeholder="加密或解密的结果将显示在这里..."
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace', // 使用等宽字体，更好地显示加密结果
                }
              }}
            />
          </Box>
        </Paper>
        
        {/* 使用说明 - 可折叠 */}
        <Paper 
          elevation={2} 
          sx={{ 
            padding: { xs: 2, sm: 3 }, 
            width: '100%',
            display: isMobile ? 'none' : 'block' // 在移动设备上隐藏使用说明
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { sm: '1rem', md: '1.25rem' } }}
          >
            使用说明
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Typography 
            variant="body2" 
            paragraph
            sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}
          >
            <strong>传统加密：</strong>标准的加密解密功能，可以选择自动检测、强制加密或强制解密模式。
          </Typography>
          
          <Typography 
            variant="body2" 
            paragraph
            sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}
          >
            <strong>文言文加密：</strong>将内容转换为古典文言文格式，既能保证信息安全，又能作为文学创作素材。
          </Typography>
          
          <Typography 
            variant="body2" 
            paragraph
            sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}
          >
            <strong>密钥：</strong>可以设置自定义密钥，如不填写将使用默认密钥"hytool.top"。
          </Typography>
          
          <Typography 
            variant="body2"
            sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}
          >
            <strong>文言文选项说明：</strong>
          </Typography>
          <ul style={{ paddingLeft: isMobile ? '1.2rem' : '2rem' }}>
            <li>
              <Typography 
                variant="body2"
                sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}
              >
                <strong>包含标点符号：</strong>加密结果中是否包含标点符号，解密时可忽略此选项。
              </Typography>
            </li>
            <li>
              <Typography 
                variant="body2"
                sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}
              >
                <strong>随机性：</strong>值越大，加密结果的随机性越高（0-100），解密时可忽略此选项。
              </Typography>
            </li>
            <li>
              <Typography 
                variant="body2"
                sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}
              >
                <strong>骈文句式：</strong>生成四字至五字一组的对仗格律文本，有助于减少密文长度。
              </Typography>
            </li>
            <li>
              <Typography 
                variant="body2"
                sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}
              >
                <strong>逻辑句式：</strong>生成具有强论述类逻辑风格的文本。
              </Typography>
            </li>
            <li>
              <Typography 
                variant="body2" 
                color="error"
                sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}
              >
                注意：骈文和逻辑句式不能同时启用。
              </Typography>
            </li>
          </ul>
        </Paper>
        
        {/* 提示信息 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: 'center' 
          }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
}

export default App;