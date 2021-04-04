# JALVariableNaming README

This extension eases AL business central variable naming following its own coding rules.

## Features

For this purpose, we have these commands:
* `JAL Var Begin AL variable editing mode`
* `JAL Var Stop AL variable editing mode`
* `JAL Var Selection variable naming`

### JAL Var Begin AL variable editing mode

![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/IntroWithVarMode.gif?raw=true)

With this command, we begin the variable editing: If we are in a blank line it puts “var” line.
First intro puts this text in your editor: “WriteTypeAndSubtype: “
When you write type and subtype and push intro key, editing mode make this job:
* Rename the variable to Al naming formatting rules: from “WriteTypeAndSubtype” to “Customer”.
* Place tail semicolon in variable declaration.
* In next line write the text  “WriteTypeAndSubtype: “

If you want to disable this mode you can execute with F1 "JAL Var Stop AL variable editing mode" command.

### JAL Var Selection variable naming.

This command renames the variables in editor selection. Notice that this command executes a symbol renaming. It means that if you have declared and used the variable in its scope rename the variable using too:


![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/SelRename.gif?raw=true)

## Requirements

VSCode and Al language. This last is not a real pre-requisite, but do not make sense use this with other tool.

## Extension Settings

This extension contributes the following settings:

* `CharsFrom` `CharsTo`: Future feature to transform local language chars.
* `ExcludePrefixInRename`: Set true (default) to exclude your prefix from renaming.
* `AppPrefix`: Set here your App prefix to exclude it in renaming (see previous setting).

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.


## Release Notes



### 1.0.0



### 1.0.1

Fixed issue #.

