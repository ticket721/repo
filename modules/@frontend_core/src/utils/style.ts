export function blurAndDarkenBackground(
browserName: string | undefined, blur = '3px', color = 'rgba(33, 29, 45, 0.6)', firefoxColor = 'rgba(33, 29, 45, 0.95)'
): string {
  return (`
    background-color: ${browserName === 'firefox' ? firefoxColor : color};
    ${browserName !== 'firefox' &&`
      backdrop-filter: blur(${blur});
    `}
  `);
}

export function truncate(width: string): string {
    return (`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: ${width};
    `);
}
