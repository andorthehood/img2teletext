declare module 'teletexthash' {
  export function encode(buffer: Uint8Array): string;
}

declare module 'btoa' {
  function btoa(data: string | Uint8Array): string;
  export = btoa;
} 