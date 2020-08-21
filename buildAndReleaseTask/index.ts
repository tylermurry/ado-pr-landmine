import tl = require('azure-pipelines-task-lib/task');
import PullRequestService from './services/pull-request-service';
import {GitPullRequestCommentThread} from "azure-devops-node-api/interfaces/GitInterfaces";
import runMutationTest from './mutation/run-mutation-test';

const outInvalidThreads = (thread: GitPullRequestCommentThread): boolean => {
    if (!thread.comments) return false;

    // Ensure the comment is a "bomb"
    const topComment: string = thread.comments[0].content || '';
    if (!(topComment.includes('/bomb') || topComment.includes('💣'))) return false;

    // Ensure the top comment includes a code suggestion
    if (!topComment.includes('```suggestion')) return false;

    // Ensure the thread is marked as "passed"
    if (thread.comments.find(comment => comment.content?.includes('✅'))) return false;

    return true;
}

const run = async () => {
    try {
        const token = process.env.SYSTEM_ACCESSTOKEN || '';
        const project = process.env.SYSTEM_TEAMPROJECT || 'EngAndTech';
        const orgURL = 'https://dev.azure.com/jbhunt'; // tl.getInput('orgUrl', true);
        const testCommand = 'echo hello'; //tl.getInput('testCommand', true);

        const pullRequestService = new PullRequestService(token, project, orgURL);
        const threads = await pullRequestService.getActiveThreads('golden-pipeline', 142891);
        const validThreads = threads.filter(outInvalidThreads);

        console.log(JSON.stringify(validThreads, null, 2));
    }
    catch (err) {
        console.log(err);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
