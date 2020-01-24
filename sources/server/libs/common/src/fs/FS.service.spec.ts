import * as path from 'path';
import * as fs from 'fs';
import { FSService } from '@lib/common/fs/FS.service';

const fileName = '/tmp/this_is_a_test_file.test.txt';
const dirName = '/tmp/this_is_a_test_dir';
const subDirOneName = 'a_subdir_one';
const subDirTwoName = 'b_subdir_two';
const subDirOnePath = dirName + `/${subDirOneName}`;
const subDirTwoPath = dirName + `/${subDirTwoName}`;

describe('FS Service', function() {
    beforeEach(function() {
        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }

        if (fs.existsSync(subDirOnePath)) {
            fs.rmdirSync(subDirOnePath);
        }

        if (fs.existsSync(subDirTwoPath)) {
            fs.rmdirSync(subDirTwoPath);
        }

        if (fs.existsSync(dirName)) {
            fs.rmdirSync(dirName);
        }
    });

    it('readFile', function() {
        const fsService: FSService = new FSService();
        fs.writeFileSync(fileName, JSON.stringify({ hello: 'world' }));

        const raw = fsService.readFile(fileName);
        const data = JSON.parse(raw);

        expect(data).toEqual({ hello: 'world' });
    });

    it('writeFile', function() {
        const fsService: FSService = new FSService();
        fsService.writeFile(fileName, JSON.stringify({ hello: 'world' }));

        const raw = fs.readFileSync(fileName).toString();
        const data = JSON.parse(raw);

        expect(data).toEqual({ hello: 'world' });
    });

    it('readDir', function() {
        const fsService: FSService = new FSService();
        fs.mkdirSync(dirName);
        fs.mkdirSync(subDirOnePath);
        fs.mkdirSync(subDirTwoPath);

        const dirs = fsService.readDir(dirName);

        expect(dirs).toEqual([subDirOneName, subDirTwoName]);
    });

    it('createDir', function() {
        const fsService: FSService = new FSService();

        expect(fs.existsSync(dirName)).toBeFalsy();
        fsService.createDir(dirName);
        expect(fs.statSync(dirName).isDirectory()).toBeTruthy();
    });

    it('exists', function() {
        const fsService: FSService = new FSService();

        expect(fsService.exists(dirName)).toBeFalsy();
        fs.mkdirSync(dirName);
        expect(fsService.exists(dirName)).toBeTruthy();
    });

    it('isDir', function() {
        const fsService: FSService = new FSService();

        fs.writeFileSync(fileName, 'salut');
        expect(fsService.isDir(fileName)).toBeFalsy();
        fs.mkdirSync(dirName);
        expect(fsService.isDir(dirName)).toBeTruthy();
    });
});
