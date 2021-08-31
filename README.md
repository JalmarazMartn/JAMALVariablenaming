# JALVariableNaming README

This extension eases AL business central variable naming following its own coding rules.

## Features

For this purpose, we have these commands:
* `JAL Var Begin AL variable editing mode`
* `JAL Var Stop AL variable editing mode`
* `JAL Var Selection variable naming`

## Snippet Code .

![Snippet mode](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/SnippetStyle.gif?raw=true)

The snippet behavior is this:
- Type snippet (talVarnaming).
- This brings to the line “WriteTypeAndSubtype” and ”:”.
- Then you write type (record, page, etc.) and when you end writing the subtype, if is the subtype has double quotes, as “Sales Header”, the extension puts “;” automatically at then end of then line and turns “WriteTypeAndSubtype” into “SaleHeader”.
- 	If the subtype is a single word as “Item” or “Customer”, you must write manually the “;” character or press intro and then the snippet performs variable renaming.
The great advantage to me is that you don´t have to go back to line start to change variable naming with any action, you keep coding at the same time the variable name is changed. This improves a lot the work with variables in AL. But a told previously, is my approach, there is already a good naming extension, and you can find it more complete.


### JAL Var Begin AL variable editing mode

![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/IntroWithVarMode.gif?raw=true)

With this command, we begin the variable editing: If we are in a blank line it puts “var” line.
First intro puts this text in your editor: “WriteTypeAndSubtype: “
When you write type and subtype and push intro key, editing mode make this job:
* Rename the variable to Al naming formatting rules: from “WriteTypeAndSubtype” to “Customer”. Variable is not only renamed when you press intro key, when type semicolon for declaration ending renaming will be done too. Also will be done, when the end of declaration is detected due double quote closing in a multiple word subtype.
* Place tail semicolon in variable declaration.
* In next line write the text  “WriteTypeAndSubtype: “

If you want to disable this mode you can execute with F1 "JAL Var Stop AL variable editing mode" command.

### JAL Var Selection variable naming.

This command renames the variables in editor selection. Notice that this command executes a symbol renaming. It means that if you have declared and used the variable in its scope rename the variable using too:


![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/SelRename.gif?raw=true)

### Snippet label.

Last contribution is the snippet label, to declare labels in al code. Typing "tlabel" snippet is triggered:
![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/tlabel.gif?raw=true)

## Requirements

VSCode and Al language. This last is not a real pre-requisite, but do not make sense use this with other tool.

## Extension Settings

This extension contributes the following settings:

* `CharsFrom` `CharsTo`: Future feature to transform local language chars.
* `ExcludePrefixInRename`: Set true (default false) to exclude your prefix from renaming.
* `AppPrefix`: Set here your App prefix to exclude it in renaming (see previous setting).

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.


## Release Notes


### 0.0.1

Initial commit

### 0.0.2

To avoid further problems like this I have decided to disable by default “Exclude Prefix from rename” option. This way only people that need this would set the App prefix setting.

### 0.0.3

Only insert 'WriteTypeAndSubtype: ' text if previous line is a var declaration or 'var' literal.

### 0.0.4

In a continuous search of speed in real work: variable is not only renamed when you press intro key, when type semicolon for declaration ending renaming will be done too. Also will be done, when the end of declaration is detected due double quote closing in a multiple word subtype:

### 0.0.5

Replaced "*" by "onStartupFinished" in activationEvents for perfomance improving. 

![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/Faster.gif?raw=true)

Creation of Code Snippet talVarNaming.

### 0.0.6

Highlight in README snippet mode

### 0.0.7

New label variable snippet

### 0.0.8

New repeat-until snippet, looping into document line table.