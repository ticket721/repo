import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

/**
 * Service to work with the FileSystem
 */
@Injectable()
export class FSService {
    /**
     * Read a file from the filesystem
     *
     * @param path
     */
    readFile(path: string): string {
        return fs.readFileSync(path).toString();
    }

    /**
     * Read a directory and recover content list from the filesystem
     *
     * @param path
     */
    readDir(path: string): string[] {
        return fs.readdirSync(path);
    }

    /**
     * Write a new file to the filesystem
     *
     * @param path
     * @param content
     */
    writeFile(path: string, content: string | Buffer): void {
        return fs.writeFileSync(path, content);
    }

    /**
     * Create a new directory
     *
     * @param path
     */
    createDir(path: string): void {
        return fs.mkdirSync(path);
    }

    /**
     * Checks if given path exists
     *
     * @param path
     */
    exists(path: string): boolean {
        return fs.existsSync(path);
    }

    /**
     * Checks if given path is a directory
     *
     * @param path
     */
    isDir(path: string): boolean {
        return fs.existsSync(path) && fs.statSync(path).isDirectory();
    }
}
