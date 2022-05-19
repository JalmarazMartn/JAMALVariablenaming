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

## Fix Tx2AL issues

New command "JAM Fix Txt2AL issues" to fix Tx2AL issues. Steps:
1. With F1 execute "JAM Fix Txt2AL issues".
2. Confirm the pop up message with yes.
3. Automatically fix the Tx2AL issues: set application area with basic and suite and remove scope internal statements.
4. Save all changed files with File->Save All.

## Avoid implicit REC in page fields

New command "JAM Fix Implicit REC in page fields" to avoid implicit REC in page fields. Steps:
1. With F1 execute "JAM Fix Implicit REC in page fields".
2. Confirm the pop up message with yes.
3. Automatically put .rec in page fields declaration.
4. Save all changed files with File->Save All.

### Snippet Include Parameters

Typing "tincludeParameters" snippet after open parenthesis in procedure name, you get all procedure parameters:

![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/tincludeParameters.gif?raw=true)

### Snippet get keys

Typing "tGetKeys" snippet after "Setcurrentkey(" statement you get a multi-selection of all table keys:

![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/tGetKeys.gif?raw=true)


### Snippet label

Last contribution is the snippet label, to declare labels in al code. Typing "tlabel" snippet is triggered:
![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/tlabel.gif?raw=true)

### Snippet trepeatDocLines

It is very usual to iterate into document lines: we make over and over the code to iterate sales lines form a sales header. This snippet is to declare a repeat document loop: first you type snippet trepeatDocLines, and then you can select the document you want to iterate, transfer, sales shipment, purchase receipt and only with two these two steps you will get all the lines looping:

![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/tRepeatDocs.gif?raw=true)

Other standard Business Central documents have a Document Type field. Sales Line, Purchase Line, Assembly Line. To iterate into these documents you can use the snippet trepeatDocLinesWithDocumentType.

The other related snippet es tRepeatWhseDocs (warehouse activity, warehouse receipt, warehouse shipment, pick).

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

### 0.0.9

Improvement in label variable snippet suggested by Krzysztof Bialowas. Add comment in label declaration.

### 0.0.10

Improve repeat document lines snippets

### 0.0.11

New snippet tincludeParameters to get the parameters of a function

### 0.0.12

Fixed error in snippet tincludeParameters

### 0.0.13

Skiped due bad luck number

### 0.0.14

Fixed another error in snippet tincludeParameters

### 0.0.15

New snippet tGetKeys bring table keys so select after setcurrentkey( declaraction

### 0.0.16

Add new command "JAM Fix Implicit REC in page fields" to fix the implicit REC in page fields, adding the explicit REC in page fields.
Exclude implicit REC in page fields in Fix Txt2AL command.

### 0.0.17

TrepeatDocs snippet documentation.

### 0.0.18

Use image free common form https://icons.iconarchive.com/icons/icons8/ios7/512/Programming-Variable-icon.png

### 0.0.19

New snippet tactionJAL with promoted options and image.

### 0.0.20

Fixing an error in snippet tgetkeys

### 0.0.21

Fixing an error in snippet tincludeParameters