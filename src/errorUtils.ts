
export const errMessageOrCodeMessage = (error: Error): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const code = (error as any).code;
  return [code ? `[${code}]` : undefined, error.message].filter(
    (e) => e !== undefined && e !== null && e.trim() !== ''
  ).join(' ');
};

