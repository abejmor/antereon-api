import { Server } from 'http';

declare global {
  var APP: Server | undefined;
}

export {};
