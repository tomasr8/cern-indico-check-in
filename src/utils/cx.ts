export function cx(...classNames: Array<string | object>): string {
  const classes = [];

  for (const cls of classNames) {
    if (typeof cls === 'string') {
      classes.push(cls);
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}
