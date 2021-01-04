import tl = require('azure-pipelines-task-lib/task');
import { WebApi } from 'azure-devops-node-api';
import {CommentThreadStatus} from "azure-devops-node-api/interfaces/GitInterfaces";
import { table } from 'table';
import executeTask from './task';

jest.mock('azure-devops-node-api');
jest.mock('azure-pipelines-task-lib/task');
jest.mock('table');

const gitApiMock = {
    getThreads: jest.fn(),
    createComment: jest.fn(),
    updateThread: jest.fn(),
};
(WebApi as any).mockImplementation(() => ({ getGitApi: () => gitApiMock }));

jest.setTimeout(10000000);

describe('Integration Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Inputs
        (tl.getInput as any).mockReturnValueOnce('some-token');
        (tl.getInput as any).mockReturnValueOnce('npm test');
        (tl.getInput as any).mockReturnValueOnce('./src/__mock__');
        (tl.getInput as any).mockReturnValueOnce('5000');
        (tl.getInput as any).mockReturnValueOnce(undefined);
        process.env.SYSTEM_TEAMPROJECT = 'team-project';
        process.env.BUILD_REPOSITORY_NAME = 'some-repo';
        process.env.SYSTEM_PULLREQUEST_PULLREQUESTID = '123456';
        process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI = 'some-org-url';
    })

    it('should add two landmines and catch them all', async () => {
        gitApiMock.getThreads.mockReturnValueOnce([{
            id: 1,
            status: CommentThreadStatus.Active,
            comments: [
                { content: "/bomb\n\n```suggestion\n2\n```" },
            ],
            threadContext: {
                filePath: '/insertion-sort.js',
                rightFileStart: {line: 3, offset: 18},
                rightFileEnd: {line: 3, offset: 19},
            }
        }, {
            id: 2,
            status: CommentThreadStatus.Active,
            comments: [
                { content: "💣\n\n```suggestion\n3\n```" },
                { content: "💥 Bomb not defused. Verify your tests can catch this issue." },
            ],
            threadContext: {
                filePath: '/insertion-sort.js',
                rightFileStart: {line: 3, offset: 18},
                rightFileEnd: {line: 3, offset: 19},
            }
        }]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(table).toMatchSnapshot();
        expect(gitApiMock.createComment).toMatchSnapshot();
        expect(gitApiMock.updateThread).toMatchSnapshot();
    });

    it('should add a landmine but not catch it', async () => {
        gitApiMock.getThreads.mockReturnValueOnce([{
            id: 1,
            status: CommentThreadStatus.Active,
            comments: [
                { content: "/bomb\n\n```suggestion\n; console.log('here')\n```" },
            ],
            threadContext: {
                filePath: '/insertion-sort.js',
                rightFileStart: {line: 2, offset: 33},
                rightFileEnd: {line: 2, offset: 34},
            }
        }]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(table).toMatchSnapshot();
        expect(gitApiMock.createComment).toMatchSnapshot();
        expect(gitApiMock.updateThread).toMatchSnapshot();
    });

    it('should add a landmine but not catch it because the execution timed out', async () => {
        gitApiMock.getThreads.mockReturnValueOnce([{
            id: 1,
            status: CommentThreadStatus.Active,
            comments: [
                { content: "💣\n\n```suggestion\nconsole.log('infinite loop!');\n```" },
            ],
            threadContext: {
                filePath: '/insertion-sort.js',
                rightFileStart: {line: 7, offset: 13},
                rightFileEnd: {line: 8, offset: 23},
            }
        }]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(table).toMatchSnapshot();
        expect(gitApiMock.createComment).toMatchSnapshot();
        expect(gitApiMock.updateThread).toMatchSnapshot();
    });

    it('should not find any landmines because there are no threads', async () => {
        gitApiMock.getThreads.mockReturnValueOnce([]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(table).not.toHaveBeenCalled();
        expect(gitApiMock.createComment).toMatchSnapshot();
        expect(gitApiMock.updateThread).toMatchSnapshot();
    });

    it('should not find any landmines because there are no active threads', async () => {
        gitApiMock.getThreads.mockReturnValueOnce([{
            id: 1,
            status: CommentThreadStatus.Active,
            comments: [
                { content: "💣\n\n```suggestion\n2\n```" },
                { content: "✅ Bomb successfully defused" },
            ],
            threadContext: {
                filePath: '/insertion-sort.js',
                rightFileStart: {line: 3, offset: 18},
                rightFileEnd: {line: 3, offset: 19},
            }
        },{
            id: 2,
            status: CommentThreadStatus.Closed,
            comments: [
                { content: "💣\n\n```suggestion\n3\n```" },
            ],
            threadContext: {
                filePath: '/insertion-sort.js',
                rightFileStart: {line: 3, offset: 18},
                rightFileEnd: {line: 3, offset: 19},
            }
        }]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(table).not.toHaveBeenCalled();
        expect(gitApiMock.createComment).toMatchSnapshot();
        expect(gitApiMock.updateThread).toMatchSnapshot();
    });
});
