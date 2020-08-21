import {GitPullRequestCommentThread} from "azure-devops-node-api/interfaces/GitInterfaces";
import fs from "fs";
import exec from "../common/easy-exec";
import createMutant from './create-mutant';

const extractCodeSuggestion = (thread: GitPullRequestCommentThread): string => {
    if (!thread.comments) throw Error('No comments could be found for thread')

    const topComment = thread.comments[0].content || '';
    return topComment.substring(topComment.indexOf('```suggestion\n') + 14, topComment.lastIndexOf('```') - 1);
}

export default async (testCommand: string, thread: GitPullRequestCommentThread): Promise<boolean> => {
    console.log('Running mutation test...');

    const extractedCodeSuggestion = extractCodeSuggestion(thread);
    const { filePath, rightFileStart, rightFileEnd } = thread?.threadContext || {};
    let result = false;

    if (!filePath || !rightFileStart?.line || !rightFileStart?.offset || !rightFileEnd?.line || !rightFileEnd?.offset) throw Error('Thread data not structured properly.');

    fs.copyFileSync(filePath || '', `${filePath}.backup`);
    createMutant(filePath, rightFileStart.line, rightFileStart?.offset, rightFileEnd?.line, rightFileEnd?.offset, extractedCodeSuggestion);

    console.log('-------')
    console.log(fs.readFileSync(filePath || '', 'utf8'));

    try {
        await exec(testCommand);
        result = true;
    } catch {
        result = false;
    } finally {
        console.log('Restoring backup file...');
        fs.copyFileSync(`${filePath}.backup`, filePath || '');
        fs.unlinkSync(`${filePath}.backup`);
    }

    return result;
}
