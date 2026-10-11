import type { AnimateProp } from './animate';

declare module 'react-native' {
  interface ViewProps {
    animate?: AnimateProp;
  }
}

export {};
