const timers: { [key: string]: number } = {};

function getIntervalID(key: string) {
  return timers[key];
}

export async function registerTimer(
  key: string,
  frequency: number,
  fn: (intervalID: number) => any
) {
  if (timers[key]) {
    window.clearInterval(timers[key]);
  }

  timers[key] = window.setInterval(() => {
    try {
      if (typeof fn === "function") {
        fn(getIntervalID(key));
      }
    } catch (err) {
      console.error(err);
    }
  }, frequency);
}
