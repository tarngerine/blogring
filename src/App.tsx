import './App.css';

import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { useEffect } from 'react';
import { v4 as uuid } from 'uuid';

import { currentUserIdAtom, useWindowSizeObserver } from './atoms/current';
import data from './atoms/data';
import { Ring } from './components/Ring';
import { randomColor } from './lib';

function App() {
  useWindowSizeObserver();
  useCreateUser();
  return (
    <>
      <Ring />
    </>
  );
}

// If no existing user in localstorage, create a new one
function useCreateUser() {
  const [currentUserId, setCurrentUserId] = useAtom(currentUserIdAtom);
  const setUsers = useUpdateAtom(data.users);
  useEffect(() => {
    if (currentUserId !== null) return; // Already logged in

    const id = uuid();
    const newUser = {
      id,
      name: '',
      color: randomColor(),
      rings: ['1'],
    };
    setCurrentUserId(id);
    setUsers((prev) => ({
      ...prev,
      [id]: newUser,
    }));
  }, [currentUserId]);
}

export default App;
