import { table } from "table";

export default class BombReport {
    private readonly bombOutcomes: any[];

    public constructor() {
        this.bombOutcomes = [];
    }

    public pushBombOutcome(reviewThread: any, bombDefused: boolean): void {
        this.bombOutcomes.push({
            reviewThread,
            bombDefused,
        });
    }

    public generateReport(): string {
        if (this.bombOutcomes.length == 0) {
            return '';
        }
        const reportData = [];
        reportData.push(['File Name', 'Line Numbers', 'Bomb Defused']);
        for (const bombOutcome of this.bombOutcomes) {
            const pathParts = bombOutcome.reviewThread?.threadContext?.filePath.split("/");
            const fileName = pathParts[pathParts.length - 1];

            const lineStartNumber = bombOutcome.reviewThread?.threadContext?.rightFileStart?.line;
            const lineEndNumber = bombOutcome.reviewThread?.threadContext?.rightFileEnd?.line;
            const lineNumbers = lineStartNumber === lineEndNumber ? lineStartNumber : lineStartNumber + '-' + lineEndNumber;

            const bombWasDefused = bombOutcome.bombDefused ? 'yes' : 'no';

            reportData.push([fileName, lineNumbers, bombWasDefused]);
        }
        return table(reportData);
    }
}
