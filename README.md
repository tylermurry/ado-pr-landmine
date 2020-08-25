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
![How-It-Works](images/how-it-works.gif)

# Install the Task for Your Organization
1. Install the `PR Landmine` extension in your organization. [More information here.](https://docs.microsoft.com/en-us/azure/devops/marketplace/install-extension?view=azure-devops&tabs=browser)
1. Add the task into your pull request build:

    ```yml
    steps:
    - task: pr-landmine@3
      inputs:
        orgUrl: 'https://dev.azure.com/my-organization'
        testCommand: 'npm test'
    ```
    If you are using the `System.AccessToken` (default), be sure to set `persistCredentials` to `true` if it's not already:
    ```yml
    steps:
    - checkout: self
      persistCredentials: true
    ```  
1. Grant the build job user the `Contribute to pull requests` permission to allow it to add pull request comments. [More information here.](https://docs.microsoft.com/en-us/azure/devops/organizations/security/set-git-tfvc-repository-permissions?view=azure-devops#set-git-repository-permissions)
1. Now you're Ready to lay down some mines! 💣

# Add a Landmine to a Pull Request
1. In a pull request, choose a file and select the range of code where you would like to create a landmine.
1. Start the comment with either the bomb emoji 💣 or `/bomb`. Either of these will signal to the task that the comment is a landmine.
1. On the next line, use the [code suggestion syntax](https://devblogs.microsoft.com/devops/introducing-the-new-pull-request-experience-for-azure-repos/#add-suggested-changes-and-commit-within-a-pull-request) to inject mutated code.
1. Re-run the pull request job and the landmine comment should be annotated with the success or failure of the bomb defusal.

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
