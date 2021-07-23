import './App.css';

import React from 'react';

import { Blogs } from './components/Blog';
import { BuddyList } from './components/BuddyList';
import { Cursors } from './components/Cursors';
import { World } from './components/World';

function App() {
  return (
    <>
      <World>
        <BuddyList />
        <Blogs />
        <Cursors />
      </World>
    </>
  );
}

export default App;
