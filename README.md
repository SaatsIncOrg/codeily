# codeily
> Does a cuddly job of retrieving code from Github and installing it on a server.
## Getting Started
```shell
npm install codeily
```
Once the plugin has been installed, it may be run like this:
```shell
sudo node /path/to/codeily/app /path/to/root/dir
```
## Assumptions
Codeily requires this to be in place:
- A file named ```_provision_vars.js``` at the "root" directory given as argument above, with content like this:
```
[
  {
    "path": "\var\www\html\\",
    "repo": "https://github.com/test/test.git",
    "branch": "master"
  }
]
```
- A file named ```codeily.json``` in the repo being called is optional, containing something below. Of course, if a script is sited, it must be included also.
```
{
  "ignore": [".git","README.md"],
  "script_after": ["codeily_script_after.sh"],
  "repo_path": ""
}
```
* "repo_path" refers to which folder in the repo should be copied. Defaults to blank to copy the entire repo.

## Development
Requires:
- A Linux system.
- git: ```sudo apt-get install git```
- grunt-cli: ```npm install -g grunt-cli```
Run:
- Normal: ```grunt```
- Include github calls: ```grunt mochaTest:all```

## Release History
0.0.13 - Add to readme & fix max-file-open error.
0.0.12 - Fix repo path bug.
0.0.11 - Add repo path.
0.0.10 - Add main to package.
0.0.9 - Fix chmod.
0.0.8 - Add chmod before execution.
0.0.7 - Fix error in execution.
0.0.6 - Convert completely to Unix.
0.0.5 - Convert to Unix slashes on paths.
0.0.4 - Add ability to execute script after.
0.0.1 - Initial.