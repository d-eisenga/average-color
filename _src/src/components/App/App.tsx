import {Editor} from '../Editor/Editor';
import {Sidebar} from '../Sidebar/Sidebar';
import {Toolbar} from '../Toolbar/Toolbar';

import './App.scss';

export const App = () => (
  <div class="app">
    <Toolbar class="app__toolbar" />
    <Editor class="app__editor" />
    <Sidebar class="app__sidebar" />
  </div>
);
