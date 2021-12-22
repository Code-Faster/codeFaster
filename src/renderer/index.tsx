import { ConfigProvider } from 'antd';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
render(
  <HashRouter>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </HashRouter>,
  rootElement
);
