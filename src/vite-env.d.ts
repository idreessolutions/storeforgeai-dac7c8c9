/// <reference types="vite/client" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        trigger?: string;
        stroke?: string;
        state?: string;
        colors?: string;
        delay?: string;
      };
    }
  }
}

export {};