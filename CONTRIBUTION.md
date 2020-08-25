# Building the extension
1. Remove the `task/src/__mock__/node_modules` folder if it exists. Otherwise, it will be bundled into the task and exceed the 50mb limit
2. From the `task/` folder, run `tsc`
3. Update the `version` property within `task/task.json` and `vss-extension.json`
4. From the root folder, run `tfx extension create --manifest-globs vss-extension.json` 
5. This will create a `.vsix` file in the root directory. This is the extension file to upload.

# Upload and publish extension
1. Login to https://marketplace.visualstudio.com/manage/publishers/tylermurry
2. In the `...` menu for the extension, select `Update`
3. Select the `.vsix` file and click upload.
4. After the extension has been verified, it is ready to be used.

**Note**:  Typically the new version of the extension does not immediately show up.
Running a build should flush it out and the new version will show up the next time. 
