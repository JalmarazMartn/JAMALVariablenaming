# Change Log

All notable changes to the "JAMVariableNaming" extension will be documented in this file.

## 0.0.1

Initial commit

## 0.0.2

To avoid further problems like this I have decided to disable by default “Exclude Prefix from rename” option. This way only people that need this would set the App prefix setting.

## 0.0.3

Only insert 'WriteTypeAndSubtype: ' text if previous line is a var declaration or 'var' literal.

## 0.0.4

In a continuous search of speed in real work: variable is not only renamed when you press intro key, when type semicolon for declaration ending renaming will be done too. Also will be done, when the end of declaration is detected due double quote closing in a multiple word subtype:

## 0.0.5

Replaced "*" by "onStartupFinished" in activationEvents for perfomance improving. 

![alt text](https://github.com/JalmarazMartn/JAMALVariablenaming/blob/master/images/Faster.gif?raw=true)

Creation of Code Snippet talVarNaming.

## 0.0.6

Highlight in README snippet mode

## 0.0.7

New label variable snippet

## 0.0.8

New repeat-until snippet, looping into document line table.

## 0.0.9

Improvement in label variable snippet suggested by Krzysztof Bialowas. Add comment in label declaration.

## 0.0.10

Improve repeat document lines snippets

## 0.0.11

New snippet tincludeParameters to get the parameters of a function

## 0.0.12

Fixed error in snippet tincludeParameters

## 0.0.13

Skiped due bad luck number

## 0.0.14

Fixed another error in snippet tincludeParameters

## 0.0.15

New snippet tGetKeys bring table keys so select after setcurrentkey( declaraction

## 0.0.16

Add new command "JAM Fix Implicit REC in page fields" to fix the implicit REC in page fields, adding the explicit REC in page fields.
Exclude implicit REC in page fields in Fix Txt2AL command.

## 0.0.17

TrepeatDocs snippet documentation.

## 0.0.18

Use image free common form https://icons.iconarchive.com/icons/icons8/ios7/512/Programming-Variable-icon.png

## 0.0.19

New snippet tactionJAL with promoted options and image.

## 0.0.20

Fixing an error in snippet tgetkeys

## 0.0.21

Fixing an error in snippet tincludeParameters

## 0.0.22

Remove unnecessary visibility of "JAL Var Begin AL variable editing mode (Snippet)" command.
Make no sense to use this command in Zen mode, only in internal use and API for third party.

## 0.0.23

Fixing an error in snippet tgetkeys

## 0.0.24

Increase code speed of completion item tincludeParameters, to avoid unnecessary search of parameters.

## 0.0.25

Prefix to exclude could be set with and regular expression.

## 0.0.26

New command "JAL Set usage category from an old txt menu file".

## 0.0.27

Apply variable renaming to Enum object too.

## 0.0.28

Remove commands: "JAM Fix Implicit REC in page fields" and "JAM Fix Txt2AL issues App Area, Scope".
Better done in others apps.

## 0.0.29

Context menu for rename selected variables

## 0.0.30

Fixed an error removing 'var ' clause when using completion item 'tincludeParams'

## 0.0.31

Implemented CharsFrom, CharsTo conversion. In the final name of the variable, CharsFrom will be switched to CharsTo settings. If we have in from setting áéíóú and to aeiou when we have in the name "Mov. posición '' in the final name we will have MovPosicion, converting "ó" to "o".

## 0.0.32

Avoid renaming parameters in event subscription procedures. Make no sense to rename these variables, because the names must be the same that the publisher procedure.

## 0.0.33

Disable context menus (if you want to) with JALVarNaming.EnableContextMenus setting. Include TestRequestPage object.

## 0.0.34

Disable commands in command palette out of al language editor.

## 0.0.35

Beta!!! Commands "JAL Option to enum. Create initial CSV" and  "JAL Option to enum. Create new enums and substitute options". 

## 0.0.36

New configuration property JALVarNaming.RenameDuplicateSubtype: More than one occurrences in same scope will be renamed as 'Multiple_' + Subtype + '_Old_' + old var name

## 0.0.37

Beta!!! Extracting events tools. Further version with intructions.

## 0.0.37

Still Beta!!! Extracting events tools. Further version with intructions.