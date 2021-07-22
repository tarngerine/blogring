import { atom, useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { useCallback, useEffect } from 'react';

import { currentUserIdAtom } from '../atoms/current';
import { Vec } from '../types';

const SOCKET_URL = 'wss://blogring-ws-1.glitch.me';
// const SOCKET_URL = 'ws://localhost:3535';

type PayloadEvent = {
  id: string; // unique id that determines how its stored in socket state
};

export type CursorPayload = PayloadEvent & {
  event: 'cursor';
  position: Vec;
};

export type RotationPayload = PayloadEvent & {
  event: 'rotation';
  rotation: number;
  origin: string;
};

type Payload = CursorPayload | RotationPayload;
type Event = Payload['event'];

// Share the same socket across hooks
const socketAtom = atom<WebSocket | null>(null);

// Global function to send via socket
const sendSocketAtom = atom(null, (get, _, obj: Omit<Payload, 'id'>) => {
  const socket = get(socketAtom);
  const id = get(currentUserIdAtom);
  if (!socket) return console.error('No socket');
  socket.send(JSON.stringify({ id, ...obj }));
});
export function useSendSocket() {
  return useUpdateAtom(sendSocketAtom);
}

// Share local state of the latest state for payloads by id
export const socketStateAtom = atom<
  Record<string, Record<string, Omit<Payload, 'event' | 'id'>>>
>({
  cursor: {},
  rotation: {},
});

// "Provider" (not really) that wraps the app and handles socket lifecycle
export function SocketProvider({ children }: React.PropsWithChildren<{}>) {
  useSocket();
  return <>{children}</>;
}

function useSocket() {
  const [socket, setSocket] = useAtom(socketAtom);
  const setSocketState = useUpdateAtom(socketStateAtom);

  // create new websocket connection
  const setup = useCallback(function connect() {
    const newSocket = new WebSocket(SOCKET_URL);
    newSocket.onopen = (e) => {
      console.log('Socket open', e);
    };
    newSocket.onclose = (e) => {
      console.error('Socket closed', e);
      setSocket(null); // trigger reconnect
    };
    newSocket.onmessage = (e) => {
      // turn string into object
      const { event, id, ...rest } = JSON.parse(e.data) as Payload;
      // store in a local store
      setSocketState((prev) => ({
        ...prev,
        [event]: {
          ...prev[event],
          [id]: rest,
        },
      }));
    };
    setSocket(newSocket);
  }, []);

  // connect and reconnect
  useEffect(() => {
    if (socket === null) {
      console.log('Connecting to socket');
      setup();
    }
  }, [setup, socket]);

  // const send = useCallback(
  //   (obj: Omit<Payload, 'event' | 'id'>) => {
  //     if (!socket) return console.error('No socket');
  //     socket.send(JSON.stringify({ id, ...obj }));
  //   },
  //   [socket, id],
  // );

  // return { send };
}

// // Convenience wrapper for handling specific events
// export function useEvent({ event, onMessage }: Props & { event: Event }) {
//   const { send: sendAll } = useSocket({
//     onMessage: (message: Payload) => {
//       if (message.event === event) {
//         onMessage(message);
//       }
//     },
//   });

//   const send = useCallback(
//     (obj: Omit<Payload, 'event'>) => {
//       sendAll({
//         event,
//         ...obj,
//       } as Payload);
//     },
//     [sendAll, event],
//   );

//   return { send };
// }
