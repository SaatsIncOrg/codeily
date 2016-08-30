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

## Release History
0.0.1 - Initial
