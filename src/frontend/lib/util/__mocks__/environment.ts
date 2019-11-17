export let isClient = false;
export let isServer = true;

export function __setClient() {
  isClient = true;
  isServer = false;
}

export function __setServer() {
  isClient = false;
  isServer = true;
}
