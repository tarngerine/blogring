import { atom, useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { useCallback, useEffect } from 'react';

import { currentUserIdAtom } from '../atoms/current';
import data from '../atoms/data';
import { Blog, Ring, User, UUID, Vec } from '../types';

const SOCKET_URL = 'wss://blogring-ws-1.glitch.me/ws';
// const SOCKET_URL = 'ws://localhost:3535';

type PayloadEvent = {
  id: string; // unique id that determines how its stored in socket state, only useful for presence?
};

export type JoinPayload = PayloadEvent & {
  event: 'join';
};

export type SyncPayload = PayloadEvent & {
  event: 'sync';
  blogs: Record<UUID, Blog>;
  rings: Record<UUID, Ring>;
  users: Record<UUID, User>;
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

export type RingPayload = {
  event: 'ring';
  ring: Pick<Ring, 'id'> & Partial<Ring>;
};

export type UserPayload = {
  event: 'user';
  user: Pick<User, 'id'> & Partial<User>;
};

type Payload =
  | CursorPayload
  | RotationPayload
  | BlogPayload
  | JoinPayload
  | SyncPayload
  | RingPayload
  | UserPayload;
type Event = Payload['event'];
type PartialPayload = Omit<Payload, 'id' | 'event'>;

// Share the same socket across hooks
const socketAtom = atom<WebSocket | null>(null);

// Global function to send via socket
export const sendSocketAtom = atom(null, (get, _, obj: Payload) => {
  const socket = get(socketAtom);
  if (!socket || socket.readyState !== WebSocket.OPEN)
    return console.error('No socket or it is not ready');
  socket.send(JSON.stringify(obj));
});
const sendSocketWithUserAtom = atom(null, (get, _, obj: Omit<Payload, 'id'>) => {
  const socket = get(socketAtom);
  const id = get(currentUserIdAtom);
  if (!socket || socket.readyState !== WebSocket.OPEN)
    return console.error('No socket or it is not ready');
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
  const sendJoin = useUpdateAtom(sendJoinPayloadAtom);
  const sendSync = useUpdateAtom(sendSyncPayloadAtom);
  const receiveSync = useUpdateAtom(receiveSyncPayloadAtom);

  // create new websocket connection
  const setup = useCallback(function connect() {
    const newSocket = new WebSocket(SOCKET_URL);
    newSocket.onopen = (e) => {
      console.log('Socket open', e);
      sendJoin(newSocket); // setSocket won't have run yet so we need to provide to atom
    };
    newSocket.onclose = (e) => {
      console.error('Socket closed', e);
      setSocket(null); // trigger reconnect
    };
    newSocket.onmessage = (e) => {
      // turn string into object
      const payload = JSON.parse(e.data) as Payload;

      // when another user joins sync data to them
      if (payload.event === 'join') {
        sendSync(payload.id); // recipient ID
      }

      // when you receive sync back
      if (payload.event === 'sync') {
        receiveSync(payload);
      }

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
}

// These handlers are atoms because it's easier to interact
// imperatively with the required data during socket setup

// Join payload handler
const sendJoinPayloadAtom = atom(null, (get, _, socket: WebSocket) => {
  const id = get(currentUserIdAtom);
  if (id === null) return console.error('No current user when joining');
  const payload: JoinPayload = { id, event: 'join' };
  socket.send(JSON.stringify(payload));
});

// Sync payload handler
const sendSyncPayloadAtom = atom(null, (get, _, recipientId: UUID) => {
  console.log('sync request received, sending sync');
  const socket = get(socketAtom);
  const blogs = get(data.blogs);
  const rings = get(data.rings);
  const users = get(data.users);
  if (!socket) return console.error('No socket');
  const payload: SyncPayload = {
    id: recipientId,
    event: 'sync',
    rings,
    blogs,
    users,
  };
  socket.send(JSON.stringify(payload));
});

const receiveSyncPayloadAtom = atom(null, (get, set, payload: SyncPayload) => {
  const { rings, blogs, users } = payload;
  console.log('sync payload recevied', payload);
  // order matters as these are async and components may rerender
  // set by order of referenced -> referencer (E.g. blogs -> rings)

  // Merge data, better to have dupes than missing
  set(data.users, {
    ...users,
    ...get(data.users),
  });

  // Blogs have timestamps so we know whether to update or not
  const updatedBlogs = { ...get(data.blogs) };
  Object.values(blogs).map((blog) => {
    // add/replace if local blog with id doesnt exist or is older than remote
    if (
      updatedBlogs[blog.id] === undefined ||
      updatedBlogs[blog.id].updatedAt < blog.updatedAt
    ) {
      updatedBlogs[blog.id] = blog;
    }
  });
  set(data.blogs, updatedBlogs);

  // Rings have blog references so we should merge them in case locally created new blog
  const updatedRings = { ...get(data.rings) };
  Object.values(rings).map((ring) => {
    // get unique blog ids
    updatedRings[ring.id].blogs = Array.from(
      new Set([...updatedRings[ring.id].blogs, ...ring.blogs]),
    );
  });
  set(data.rings, updatedRings);
});
