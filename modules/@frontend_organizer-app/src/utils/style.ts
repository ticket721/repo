export function truncate(width: string): string {
    return (`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100px;
    `);
}
