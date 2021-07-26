import './App.css';

import React from 'react';

import { useWindowSizeObserver } from './atoms/current';
import { Ring } from './components/Ring';

function App() {
  useWindowSizeObserver();
  return (
    <>
      <Ring />
    </>
  );
}

export default App;
