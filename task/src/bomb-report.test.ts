import { table } from 'table';
import BombReport from "./bomb-report";

jest.mock('table');

describe('Bomb Report', () => {
    it('should prepare document correctly', async () => {
        // ARRANGE
        (table as any).mockReturnValueOnce('perfect table');
        const thread1 = {
            threadContext: {
                filePath: 'some/path/to/source-file.js',
                rightFileStart: { line: 1 },
                rightFileEnd: { line: 2 }
            },
        };
        const thread2 = {
            threadContext: {
                filePath: 'some/path/to/another-source-file.js',
                rightFileStart: { line: 3 },
                rightFileEnd: { line: 3 }
            },
        };
        const report = new BombReport();
        report.pushBombOutcome(thread1, false);
        report.pushBombOutcome(thread2, true);

        // ACT
        const actual = report.generateReport();

        // ASSERT
        expect(actual).toStrictEqual('perfect table');
        expect((table as any).mock.calls).toMatchSnapshot();
    });

    it('should return an empty string if no outcomes where captured', async () => {
        const report = new BombReport();
        expect(report.generateReport()).toStrictEqual('');
    });
});
