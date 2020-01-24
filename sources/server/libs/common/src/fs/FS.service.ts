import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FSService {
    readFile(path: string): string {
        return fs.readFileSync(path).toString();
    }

    readDir(path: string): string[] {
        return fs.readdirSync(path);
    }

    writeFile(path: string, content: string): void {
        return fs.writeFileSync(path, content);
    }

    createDir(path: string): void {
        return fs.mkdirSync(path);
    }

    exists(path: string): boolean {
        return fs.existsSync(path);
    }

    isDir(path: string): boolean {
        return fs.existsSync(path) && fs.statSync(path).isDirectory();
    }
}
