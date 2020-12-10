export const injectBlur = (backgroundColor: string, fallbackBackgroundColor: string, blur: string = '16px') => `
  background-color: ${fallbackBackgroundColor};
  @supports ((-webkit-backdrop-filter: blur(${blur})) or (backdrop-filter: blur(${blur}))) {
      background-color: ${backgroundColor};
      backdrop-filter: blur(${blur});
  }
`;
