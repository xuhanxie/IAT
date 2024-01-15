import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';      // 引入全局样式
import App from './components/App';  // 引入 App 组件
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// 如果您想在生产环境中开始测量性能，请传递一个函数
// 来记录结果（例如 reportWebVitals(console.log)）
// 或发送到分析端点。了解更多：https://bit.ly/CRA-vitals
reportWebVitals();
