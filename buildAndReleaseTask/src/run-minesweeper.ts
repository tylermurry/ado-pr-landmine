import {GitPullRequestCommentThread} from "azure-devops-node-api/interfaces/GitInterfaces";
import fs from "fs";
const { exec } = require('child_process');
import createLandmine from './create-landmine';

const extractCodeSuggestion = (thread: GitPullRequestCommentThread): string => {
    if (!thread.comments) throw Error('No comments could be found for thread')

    const topComment = thread.comments[0].content || '';
    return topComment.substring(topComment.indexOf('```suggestion\n') + 14, topComment.lastIndexOf('```') - 1);
}

const executeOrTimeout = async (command: string, directory: string, timeout: number): Promise<any> => new Promise((resolve, reject) => {
    const process = exec(command, {cwd: directory});
    let processTimeout = setTimeout(() => {
        process.kill('SIGINT');
        reject('Test command timed out');
    }, timeout);

    process.stdout.on('data', console.log);
    process.stderr.on('data', console.log);

    process.on('exit', (code: number, signal: string) => {
        clearTimeout(processTimeout);
        if (code !== 0) reject({ code, signal })
        resolve({ code, signal });
    });
});

const executeTestCommand = async (testCommand: string, testCommandDirectory: string, testCommandTimeout: number): Promise<any> => {
    try {
        console.log('Sweeping for mines...');
        await executeOrTimeout(testCommand, testCommandDirectory, testCommandTimeout);
        return false;
    } catch (e) {
        // Timeouts are not a valid bomb-defusal failure
        if (e === 'Test command timed out') {
            console.log(`Test command failed because it exceeded timeout of ${testCommandTimeout}ms`);
            return false;
        } else {
            return true;
        }
    }
}

export default async (testCommand: string, testCommandDirectory: string, testCommandTimeout: number, thread: GitPullRequestCommentThread): Promise<boolean> => {
    console.log('Running minesweeper...');

    const extractedCodeSuggestion = extractCodeSuggestion(thread);
    const { filePath, rightFileStart, rightFileEnd } = thread?.threadContext || {};

    if (!filePath || !rightFileStart?.line || !rightFileStart?.offset || !rightFileEnd?.line || !rightFileEnd?.offset) throw Error('Invalid thread data.');

    const fullFilePath = `${testCommandDirectory}${filePath}`

    console.log('Creating backup file...');
    fs.copyFileSync(fullFilePath, `${fullFilePath}.backup`);

    console.log('Creating landmine...');
    createLandmine(fullFilePath, rightFileStart.line, rightFileStart?.offset, rightFileEnd?.line, rightFileEnd?.offset, extractedCodeSuggestion);

    const bombDefused = await executeTestCommand(testCommand, testCommandDirectory, testCommandTimeout);

    console.log('Restoring backup file...');
    fs.copyFileSync(`${fullFilePath}.backup`, fullFilePath);
    fs.unlinkSync(`${fullFilePath}.backup`);

    return bombDefused;
}
