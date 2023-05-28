import {render} from 'preact';
import {App} from './components/App/App';

import './style.scss';

render(
  <App />,
  document.getElementById('app')!
);
