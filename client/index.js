import './index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import {AppContainer} from 'react-hot-loader';
import {Provider} from 'react-redux'
import store from './redux'
import Routes from './routes'

const render = Component =>
  ReactDOM.render(
    <AppContainer  className="data-reactroot">
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('app')
  );

render(Routes);
if (module.hot) module.hot.accept('./routes', () => render(Routes));
