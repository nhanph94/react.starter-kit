try {
  const persisted = JSON.parse(localStorage.getItem('global') || 'null');
  const theme = persisted?.state?.theme;

  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
  } else if (theme === 'night' || theme === 'dark') {
    document.documentElement.dataset.theme = 'night';
  }
} catch {
  // Ignore unavailable or malformed browser storage and use the CSS default.
}
