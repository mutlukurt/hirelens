interface WorkerMessage {
  type: 'parse' | 'score';
  payload: any;
}

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'parse':
      self.postMessage({
        type: 'parse-result',
        payload: { error: 'Worker parsing not yet implemented. Use main thread fallback.' },
      });
      break;

    case 'score':
      self.postMessage({
        type: 'score-result',
        payload: { error: 'Worker scoring not yet implemented. Use main thread fallback.' },
      });
      break;

    default:
      self.postMessage({
        type: 'error',
        payload: { error: 'Unknown message type' },
      });
  }
});

export {};
