import './App.css';

import { useAtomValue } from 'jotai/utils';
import React from 'react';

import data from './atoms/data';
import { BuddyList } from './components/BuddyList';
import { Editor } from './components/Editor';
import { World } from './components/World';

function App() {
  const blogIds = useAtomValue(data.blogIds);
  return (
    <>
      <World>
        <BuddyList />
        {blogIds.map((id) => (
          <Editor key={id} id={id} />
        ))}
      </World>
    </>
  );
}

export default App;
