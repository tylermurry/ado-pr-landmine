![pr-landmine-logo](images/extension-icon.png)

# PR Landmine for Azure DevOps
A simple, language agnostic solution for creating manual mutation tests directly in-line with an Azure DevOps pull request

#### Why would I use this?
* Great for applications that have little-to-no mutation coverage
* Takes seconds to implement and is language agnostic
* Perfect for applications that get their coverage from slower-running integration tests rather than unit tests
* A powerful conversation starter to educate others on the benefits of testing in real-time

#### When would I not use this?
* The solution isn't recommended for applications that have lots of unit tests and good mutation coverage.
 
# How it works
-- GIF GOES HERE --

# Use it in Your Organization
1. Install the `PR Landmine` extension in your organization. (TODO: link to instructions)
2. Add the task into your pull request build:

    ```
    steps:
    - task: pr-landmine@3
      inputs:
        orgUrl: 'https://dev.azure.com/my-organization'
        testCommand: 'npm test'
    ```
    If you are using the `System.AccessToken`, be sure to set `persistCredentials` to `true` if it's not already:
    ```
    steps:
    - checkout: self
      persistCredentials: true
    ```  
3. Grant the build job access to update pull requests
4. Now you're Ready to lay down some mines! 💣 

# Task Options
| Property               | Required | Default Value           | Description                                                                                                                                                                                                   |
| -----------------------|----------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `accessToken`          | Yes      | `$(System.AccessToken)` | The access token used to retrieve and update comments on the pull requests                                                                                                                                    |
| `orgUrl`               | Yes      |                         | The full Azure DevOps url for your organization (e.g. https://dev.azure.com/my-organization)                                                                                                                  |
| `testCommand`          | Yes      |                         | The command that is executed after each landmine is added. Ideally, this includes other static validation such as linting.                                                                                    |
| `testCommandDirectory` | No       | `.`                     | The directory to apply the test command. Useful if your tests are orchestrated in a different directory than root.                                                                                            |
| `testCommandTimeout`   | No       | `60000`                 | The number of milliseconds to wait before bailing on the test command. Needs to be sufficiently high to run the test suite but low enough to catch infinite loops or runaway threads created by the mutation. |
| `autoResolve`          | No       | `true`                  | If the bomb is defused successfully, the original pull request comment will be auto-resolved.                                                                                                                 |

# Contribution
Found an issue or see something cool that's missing? Pull requests and issues are warmly accepted!   
