export {};

declare global {
  interface EthereumProvider {
    request(args: {
      method: string;
      params?: readonly unknown[] | object;
    }): Promise<unknown>;
    on?(event: string, listener: (payload: unknown) => void): void;
    removeListener?(event: string, listener: (payload: unknown) => void): void;
  }

  interface Window {
    ethereum?: EthereumProvider;
  }
}
