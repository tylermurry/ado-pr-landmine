import {getPersonalAccessTokenHandler, WebApi} from 'azure-devops-node-api';
import {CommentThreadStatus, GitPullRequestCommentThread} from "azure-devops-node-api/interfaces/GitInterfaces";

export default class PullRequestService {
    private readonly token: string;
    private readonly project: string;
    private readonly orgUrl: string;
    private readonly connection: WebApi;

    public constructor(token: string, project: string, orgUrl: string) {
        this.token = token;
        this.project = project;
        this.orgUrl = orgUrl;
        this.connection = new WebApi(orgUrl, getPersonalAccessTokenHandler(token));
    }

    public async getActiveThreads(repoName: string, pullRequestId: number): Promise<GitPullRequestCommentThread[]> {
        const gitApi = await this.connection.getGitApi();
        const threads: GitPullRequestCommentThread[] = await gitApi.getThreads(repoName, pullRequestId, this.project);

        return threads
            ? threads.filter(thread => thread.status === CommentThreadStatus.Active)
            : [];
    }

    public async addCommentToThread(repoName: string, pullRequestId: number, comment: string): Promise<void> {
        // TODO This
    }
}
