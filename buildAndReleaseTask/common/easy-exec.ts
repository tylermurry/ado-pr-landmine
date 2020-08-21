// @ts-ignore
import exec from 'await-exec';

export default async (command: string, options?: any) => {
    try {
        console.info(`Executing command: '${command}' with options: ${JSON.stringify(options)}`);
        const { stdout } = await exec(command, options);
        if (stdout) console.info(stdout.toString('utf8'));
        return stdout.toString('utf8');
    } catch (error) {
        console.info('----- Outer Process Error -----');
        if (error.stdout) console.info(error.stdout.toString('utf8'));
        if (error.stderr) console.info(error.stderr.toString('utf8'));

        return error.stdout ? error.stdout.toString('utf8') : null;
    }
};
