// @ts-ignore
import { createPatch, applyPatch } from 'diff';
import fs from 'fs';

const extractCodeBlock = (fileContents: string, beginLine: number, beginOffset: number, endLine: number, endOffset: number) => {
    const lines = fileContents.split('\n');
    let codeBlock = '';

    for (let lineNumber = beginLine; lineNumber <= endLine; lineNumber++) {
        if (lineNumber === beginLine && lineNumber === endLine) {
            codeBlock = lines[lineNumber].slice(beginOffset, endOffset);
        } else if (lineNumber === beginLine) {
            codeBlock = `${codeBlock}${lines[lineNumber].substr(beginOffset)}\n`;
        } else if (lineNumber === endLine) {
            codeBlock = `${codeBlock}${lines[lineNumber].substr(0, endOffset)}\n`;
        } else {
            codeBlock = `${codeBlock}${lines[lineNumber]}\n`;
        }
    }

    return codeBlock;
}

export default (filePath: string = '', beginLine: number, beginOffset: number, endLine: number, endOffset: number, newCodeBlock: string): void => {
    console.log(`Adding landmine to ${filePath} at ${beginLine}:${beginOffset} to ${endLine}:${endOffset} with '${newCodeBlock}'`);

    const fileContents = fs.readFileSync(filePath || '', 'utf8');
    const beginLinePrefix = fileContents.split('\n')[beginLine - 1].slice(0, beginOffset - 1);
    const endLineSuffix = fileContents.split('\n')[endLine - 1].slice(endOffset - 1);

    const codeBlock = extractCodeBlock(fileContents, beginLine - 1, beginOffset - 1, endLine - 1, endOffset - 1);
    const diff = createPatch('', codeBlock, `${beginLinePrefix}${newCodeBlock}${endLineSuffix}`);
    const mutatedFile = applyPatch(fileContents, diff, { compareLine: (lineNumber: number) => lineNumber >= beginLine && lineNumber <= endLine });

    fs.writeFileSync(filePath, mutatedFile, 'utf8');
}
