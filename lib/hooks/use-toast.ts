export function useToast() {
  return {
    toast: (opts: { title?: string; description?: string; variant?: string }) => {
      // Minimal stub for local development: log to console
      console.info("toast:", opts);
    },
  };
}

export default useToast;
