# codeily
> Does a cuddly job of retrieving code from Github and installing it on a server.
## Getting Started
```shell
npm install codeily
```
Once the plugin has been installed, it may be run using this:
```shell
node app/app.js
```
## Assumptions
Codeily requires this to be in place:
- A file named ```_provision_vars.js``` at the root of Codeily, with content like this:
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
  "script_after": ["codeily_script_after.sh"]
}
```

## Release History
0.0.5 - Convert to Unix slashes on paths.
0.0.4 - Add ability to execute script after.
0.0.1 - Initial.