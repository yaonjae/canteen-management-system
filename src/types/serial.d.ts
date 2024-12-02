interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  writable: WritableStream | null;
}

interface Navigator {
  serial: {
    requestPort(): Promise<SerialPort>;
  };
}
