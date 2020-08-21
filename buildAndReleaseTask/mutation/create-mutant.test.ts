import fs from 'fs';
import createMutant from './create-mutant';

jest.mock('fs');

describe('create mutant', () => {
    const filePath =  '__mock__/insertion-sort.js';
    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        (fs.readFileSync as any).mockReturnValueOnce(jest.requireActual('fs').readFileSync(filePath, 'utf8'));
    });

    it('should replace something on a single line', async () => {
        createMutant(filePath, 5, 17, 5, 22, 'i');
        expect(fs.writeFileSync).toMatchSnapshot();
    });

    it('should replace something that spans multiple lines with a single line', async () => {
        createMutant(filePath, 7, 13, 8, 23, 'console.log(\'dummy\');');
        expect(fs.writeFileSync).toMatchSnapshot();
    });

    it('should replace something that spans multiple lines with a the same number of lines', async () => {
        createMutant(filePath, 7, 13, 8, 23, 'const abc = \'xyz\';\n            console.log(abc);');
        expect(fs.writeFileSync).toMatchSnapshot();
    });

    it('should replace something that spans multiple lines with even more lines', async () => {
        createMutant(filePath, 7, 13, 8, 23, 'const abc = \'xyz\';\n            console.log(abc);\n            console.log(\'xyz\');');
        expect(fs.writeFileSync).toMatchSnapshot();
    });

    it('should replace something that spans multiple lines in the middle', async () => {
        createMutant(filePath, 7, 18, 8, 18, 'abc');
        expect(fs.writeFileSync).toMatchSnapshot();
    });
});
