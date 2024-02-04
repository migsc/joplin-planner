import { registerTimer } from "../timer";

let syncing = false;

export function setSyncStatus(flag: boolean) {
  syncing = flag;
}

export function getSyncStatus(): boolean {
  return syncing;
}

export async function waitForCompletedSync() {
  return new Promise((resolve, reject) => {
    registerTimer("sync waiting timer", 100, () => {
      if (!syncing) {
        resolve(true);
      }
    });
  });
}
