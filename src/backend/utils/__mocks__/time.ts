let unixTimestamp = Math.floor(Date.now() / 1000);

export function __setUnixTimestamp(newUnixTimestamp: number) {
  unixTimestamp = newUnixTimestamp;
}

export function __increaseUnixTimestamp(seconds: number) {
  unixTimestamp += seconds;
}

export const getUnixTimestamp = jest.fn(() => unixTimestamp);
