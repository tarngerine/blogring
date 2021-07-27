import { atom, useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { useCallback, useEffect } from 'react';

import { currentUserIdAtom } from '../atoms/current';
import { Blog, Vec } from '../types';

const SOCKET_URL = 'wss://blogring-ws-1.glitch.me/ws';
// const SOCKET_URL = 'ws://localhost:3535';

type PayloadEvent = {
  id: string; // unique id that determines how its stored in socket state, only useful for presence?
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

export type BlogPayload = {
  event: 'blog';
  blog: Pick<Blog, 'id'> & Partial<Blog>;
};

type Payload = CursorPayload | RotationPayload | BlogPayload;
type Event = Payload['event'];
type PartialPayload = Omit<Payload, 'id' | 'event'>;

// Share the same socket across hooks
const socketAtom = atom<WebSocket | null>(null);

// Global function to send via socket
const sendSocketAtom = atom(null, (get, _, obj: Payload) => {
  const socket = get(socketAtom);
  if (!socket) return console.error('No socket');
  socket.send(JSON.stringify(obj));
});
const sendSocketWithUserAtom = atom(null, (get, _, obj: Omit<Payload, 'id'>) => {
  const socket = get(socketAtom);
  const id = get(currentUserIdAtom);
  if (!socket) return console.error('No socket');
  socket.send(JSON.stringify({ id, ...obj }));
});
export function useSendSocket(useUserId: boolean) {
  if (useUserId) return useUpdateAtom(sendSocketWithUserAtom);
  return useUpdateAtom(sendSocketAtom);
}

// Share local state of the latest state for payloads by id
export const socketStateAtom = atom<
  Partial<Record<string, Record<string, PartialPayload>>>
>({});

// "Provider" (not really) that wraps the app and handles socket lifecycle
export function SocketProvider({ children }: React.PropsWithChildren<{}>) {
  useSocket();
  return <>{children}</>;
}

// Handlers that can be set from other parts of the app to keep colocation
type SocketHandler = (payload: PartialPayload) => void;
const socketHandlers = atom<Partial<Record<Event, SocketHandler>>>({});
export function useSetSocketHandler(event: Event, handler: SocketHandler) {
  const set = useUpdateAtom(socketHandlers);
  useEffect(() => {
    set((prev) => ({ ...prev, [event]: handler }));
  }, [event, handler]);
}
const runHandlerAtom = atom(
  null,
  (
    get,
    _,
    {
      event,
      payload,
    }: {
      event: Event;
      payload: PartialPayload;
    },
  ) => {
    const handlers = get(socketHandlers);
    if (handlers[event]) {
      handlers[event]!(payload);
    }
  },
);

function useSocket() {
  const [socket, setSocket] = useAtom(socketAtom);
  const setSocketState = useUpdateAtom(socketStateAtom);
  const runHandler = useUpdateAtom(runHandlerAtom);

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
      const payload = JSON.parse(e.data) as Payload;

      // presence states stores by user id
      if (payload.event === 'cursor' || payload.event === 'rotation') {
        const { event, id, ...rest } = payload;
        // store in a local store
        setSocketState((prev) => ({
          ...prev,
          [event]: {
            ...prev[event],
            [id]: rest,
          },
        }));
      } else {
        const { event, ...rest } = payload;
        runHandler({ event, payload: rest });
      }
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
