import tl = require('azure-pipelines-task-lib/task');
import PullRequestService from './pull-request-service';
import {GitPullRequestCommentThread} from "azure-devops-node-api/interfaces/GitInterfaces";
import { table } from 'table';
import runMinesweeper from './run-minesweeper';

const outInvalidThreads = (thread: GitPullRequestCommentThread): boolean => {
    if (!thread.comments) return false;

    // Ensure the comment is a "bomb"
    const topComment: string = thread.comments[0].content || '';
    if (!(topComment.includes('/bomb') || topComment.includes('💣'))) return false;

    // Ensure the top comment includes a code suggestion
    if (!topComment.includes('```suggestion')) return false;

    // Ensure the thread is marked as "passed"
    if (thread.comments.find(comment => !comment.isDeleted && comment.content?.includes('✅'))) return false;

    return true;
};

const formatBombReportLine = (bombResult: any): string[] => {
    const pathParts = bombResult.filePath.split("/");
    const fileName = pathParts[pathParts.length - 1];

    const lineNumbers = bombResult.lineNumberStart === bombResult.lineNumberEnd ? bombResult.lineNumberStart : bombResult.lineNumberStart + '-' + bombResult.lineNumberEnd;

    return [fileName, lineNumbers, bombResult.bombDefused ? 'yes' : 'no'];
};

export default async () => {
    try {
        const accessToken = tl.getInput('accessToken', true);
        const testCommand = tl.getInput('testCommand', true);
        const testCommandDirectory = tl.getInput('testCommandDirectory', false) || '.';
        const testCommandTimeout = parseInt(tl.getInput('testCommandTimeout', false) || '60000');
        const autoResolveRaw = tl.getInput('autoResolve', false);
        const autoResolve = autoResolveRaw ? `${autoResolveRaw}`.toUpperCase() === 'TRUE' : true;

        if (!accessToken) throw Error('accessToken must be provided');
        if (!testCommand) throw Error('testCommand must be provided');
        if (!process.env.SYSTEM_TEAMPROJECT) throw Error('System.TeamProject must be provided');
        if (!process.env.BUILD_REPOSITORY_NAME) throw Error('Build.Repository.Name must be provided');
        if (!process.env.SYSTEM_PULLREQUEST_PULLREQUESTID) throw Error('System.PullRequest.PullRequestId must be provided');
        if (!process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI) throw Error('System.TeamFoundationCollectionUri must be provided');

        const project = process.env.SYSTEM_TEAMPROJECT;
        const repo = process.env.BUILD_REPOSITORY_NAME;
        const pullRequestId = parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTID);
        const orgURL = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI;

        const pullRequestService = new PullRequestService(accessToken, project, orgURL);

        const threads = await pullRequestService.getActiveThreads(repo, pullRequestId);
        tl.debug(`All threads: ${JSON.stringify(threads, null, 2)}`);

        const validThreads = threads.filter(outInvalidThreads);
        tl.debug(`Valid threads: ${JSON.stringify(validThreads, null, 2)}`);

        const bombReport = [];
        let atLeastOneFailure = false;

        for (const thread of validThreads) {
            console.log(thread);
            if (!thread.id) throw Error('Invalid thread id');

            const bombDefused = await runMinesweeper(testCommand, testCommandDirectory, testCommandTimeout, thread);

            bombReport.push({
                filePath: thread?.threadContext?.filePath,
                lineNumberStart: thread?.threadContext?.rightFileStart?.line,
                lineNumberEnd: thread?.threadContext?.rightFileEnd?.line,
                bombDefused
            });

            if (bombDefused) {
                await pullRequestService.addCommentToThread(repo, pullRequestId, thread.id, '✅ Successfully defused bomb', autoResolve);
            } else {
                atLeastOneFailure = true;
                await pullRequestService.addCommentToThread(repo, pullRequestId, thread.id, '💥 Bomb not defused. Please adjust your test to catch the error', false);
            }
        }

        if (bombReport.length > 0) {
            const reportData = [
                ['File Name', 'Line Number', 'Bomb Defused']
            ];
            for (const bombResult of bombReport) {
                reportData.push(formatBombReportLine(bombResult));
            }
            console.log(table(reportData));
        }

        if (atLeastOneFailure) {
            throw Error('There was at least bomb that was not defused.')
        }

        tl.setResult(tl.TaskResult.Succeeded, 'All bombs successfully defused');
    }
    catch (err) {
        console.log(err);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}
