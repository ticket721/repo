export const injectBlur = (backgroundColor: string, fallbackBackgroundColor: string) => `
  background-color: ${fallbackBackgroundColor};
  @supports ((-webkit-backdrop-filter: blur(16px)) or (backdrop-filter: blur(16px))) {
      background-color: ${backgroundColor};
      backdrop-filter: blur(16px);
  }
`;
