import * as path      from 'path';

export function from_root(file: string): string {
    return path.join(__dirname, '../../', file);
}

