# JALVariableNaming README

This extension eases AL business central variable naming following its own coding rules.

## Features

For this purpose, we have these commands:
* `JAL Var Begin AL variable editing mode`
* `JAL Var Stop AL variable editing mode`
* `JAL Var Selection variable naming`

## Snippet Code.

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

This option is available in the context menu. You can disable the context menu removing the check in JALVarNaming.EnableContextMenus extension config.

## JAL Set usage category from an old txt menu file

With this command you can set the usage category for Pages and Reports from an old txt menu file. Previously you had to export from C/SIDE a txt object with all the menus. Then, you can follow these steps:

* Execute command "JAL Set usage category from an old txt menu file".
* Select with a dialog the txt file with the C/SIDE menus.
* And then the command will set automatically the usage category for all the objects in the workspace reading them from menu file.
* Go to File > Save all.

## Fix Tx2AL issues

New command "JAM Fix Txt2AL issues" to fix Tx2AL issues. Steps:
1. With F1 execute "JAM Fix Txt2AL issues".
2. Confirm the pop up message with yes.
3. Automatically fix the Tx2AL issues: set application area with basic and suite and remove scope internal statements.
4. Save all changed files with File->Save All.

## Option to Enum: Beta

Utility to convert Options to enum. Steps:

1. Command "JAL Option to enum. Create initial CSV" make a csv with all options fields.
2. Edit the CSV file editing columns "New Enum Id" and "New Enum Name".
3. Command "JAL Option to enum. Create new enums and substitute options". As named, this command create new enums file in src\enums folder and substitute all option by enums in existing files.

## Avoid implicit REC in page fields
**_ deprecated!!
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

* `CharsFrom` `CharsTo`: In the final name of the variable, CharsFrom will be switched to CharsTo settings. If we have in from setting áéíóú and to aeiou when we have in the name "Mov. posición '' in the final name we will have MovPosicion, converting "ó" to "o".
* `ExcludePrefixInRename`: Set true (default false) to exclude your prefix from renaming.
* `AppPrefix`: Set here your App prefix to exclude it in renaming (see previous setting). You can set here a regular expression too. Example: `AppPrefix: "TIP[\d]*"`
* `JALVarNaming.EnableContextMenus`: Option to enable extension context menus.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.


## Release Notes

See changelog
