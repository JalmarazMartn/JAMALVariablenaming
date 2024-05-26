const vscode = require('vscode');
const subsDeclaration = [
    "[EventSubscriber(ObjectType::ObjectType1, ObjectType2::ObjectName, 'OnSomeEvent', 'ElementName',false, false)]",
    'local procedure MyProcedure()',
    'begin',
    'end;'
];

module.exports = {
    extractToEvent:
        async function () {
            await extractToEvent();
        },

}
async function extractToEvent() {
    const document = await vscode.window.activeTextEditor.document;
    const selection = vscode.window.activeTextEditor.selection;
    let previousLines = getPreviousLines(document,selection.start.line);
    let targetDocument = await openSubscriptionsDoc();
    const WSEdit = new vscode.WorkspaceEdit;
    let nextLineNumber = getLastLine(targetDocument);
    const eventDeclaration = getEventDeclaration(document);
    createNewLine(targetDocument,eventDeclaration,WSEdit,nextLineNumber);
    createNewLine(targetDocument,subsDeclaration[1],WSEdit,nextLineNumber);
    createNewLine(targetDocument,subsDeclaration[2],WSEdit,nextLineNumber);
    createNewLine(targetDocument,'//Place of Code--->'+getLinesProcContainer(document,selection.start.line),WSEdit,nextLineNumber);
    createNewLine(targetDocument,'//-----------Previous lines------------',WSEdit,nextLineNumber);
    for (let index = previousLines.length -1 ; index >= 0; index--) {
        createNewLine(targetDocument,'//'+previousLines[index],WSEdit,nextLineNumber);
    }
    createNewLine(targetDocument,'//-----------End Previous lines------------',WSEdit,nextLineNumber);
    createNewLine(targetDocument,document.getText(selection),WSEdit,nextLineNumber);

    createNewLine(targetDocument,subsDeclaration[3],WSEdit,nextLineNumber);


    await vscode.workspace.applyEdit(WSEdit);
    targetDocument.save;
}
function getEventDeclaration(document)
{
    const objectDeclaration = getObjectDeclaration(document);
    let objectType = objectDeclaration.ObjectType;
    let eventDeclaration = subsDeclaration[0].replace('ObjectType1',objectType);
    if (objectType.toUpperCase() == 'TABLE')
        {
            objectType = 'Database';
        }
    eventDeclaration = eventDeclaration.replace('ObjectType2',objectType);
    eventDeclaration = eventDeclaration.replace('ObjectName',objectDeclaration.ObjectName);
    return eventDeclaration;
}
function getObjectDeclaration(document) {
    const RenumLibrary = require('./Renumber/Library.js');
    return RenumLibrary.GetCurrentObjectFromDocument(document);
}
function getLinesProcContainer(document, startLine = 0) {
    for (let index = startLine; index >= 0; index--) {
        const procedureName = getPlaceOfCode(document, index);
        if (procedureName != '') {
            return procedureName;
        }
    }
    return '';
}
function getPlaceOfCode(document, lineNumber) {
    const regexProc = new RegExp('procedure.+', 'i');
    const regexTrig = new RegExp('trigger.+', 'i')
    let procMatch = regexProc.exec(document.lineAt(lineNumber).text);
    if (procMatch !== null) {
        return (procMatch[0])
    }
    let trigMatch = regexTrig.exec(document.lineAt(lineNumber).text);
    if (trigMatch !== null) {
        let triggerElement = getTriggerElement(document,lineNumber,trigMatch[0]);
        if (triggerElement !== '')
            {
                triggerElement = triggerElement + ' - ';
            }
        return (triggerElement + trigMatch[0])
    }
    return '';
}
function getTriggerElement(document,lineNumber,triggerDeclaration='')
{
    const regexTrigger = new RegExp('.+OnValidate|.+OnLookup', 'i');
    if (triggerDeclaration.search(regexTrigger) <0)
    {
        return '';
    }
    for (let index = lineNumber; index >= 0; index--) {
        const elementName = getElementMatch(document.lineAt(index).text)        
        if (elementName !== '')
            {
                return elementName;
            }
    }
    return '';

}
function getElementMatch(lineText='')
{
    let RegExpElement = new RegExp('field\\(.+;(.+);', 'i');
    let elementMatch = RegExpElement.exec(lineText);
    if (elementMatch)
    {
        return(elementMatch[1])
    }
    return '';
}
function getPreviousLines(document, startLine = 0) {
    let previousLines = [];
    if (startLine < 1)
    {
        return previousLines;
    }
    let lastLine = startLine - getMaxNumbersOfPreviousLines() -1;
    if (lastLine < 1)
    {
        lastLine = 1;
    }
    for (let index = startLine -1; index >= lastLine; index--) {
        previousLines.push(document.lineAt(index).text);
    }
    return previousLines;
}

function getMaxNumbersOfPreviousLines()
{
    return 3;
}
async function 	createNewLine(targetDocument,lineText='',WSEdit,lineNumber=0)
{
    await WSEdit.insert(targetDocument.uri, new vscode.Position(lineNumber, 0),
    lineText+'\n');
}
async function openSubscriptionsDoc() {
    var targetDocument = await vscode.workspace.openTextDocument(getDocumentUri());
    return targetDocument;
}
function getDocumentUri() {
    return vscode.workspace.workspaceFolders[0].uri.fsPath+'/Susbscriptions.al';
}

function getLastLine(document)
{
    for (let index = document.lineCount-1 ; index >= 0; index--) {            
    const element = document.lineAt(index).text;
    if (element.includes('}'))
        {
            return(index);
        }
    }
    return document.lineCount-1;
}