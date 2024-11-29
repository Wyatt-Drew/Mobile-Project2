export const stringToArrayBuffer = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  };
  
  export const arrayBufferToString = (buffer) => {
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(buffer));
  };
  