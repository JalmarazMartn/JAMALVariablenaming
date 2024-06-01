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
    let previousLines = getPreviousLines(document, selection.start.line);
    let targetDocument = await openSubscriptionsDoc();
    const WSEdit = new vscode.WorkspaceEdit;
    let nextLineNumber = getLastLine(targetDocument);
    const eventDeclaration = getEventDeclaration(document);
    const varDeclarations = await getArrayOfVarDeclarations(document, selection);    
    createNewLine(targetDocument, eventDeclaration, WSEdit, nextLineNumber);
    createNewLine(targetDocument, subsDeclaration[1], WSEdit, nextLineNumber);
    if (varDeclarations.length != 0) {
        createNewLine(targetDocument, 'var', WSEdit, nextLineNumber);
        createNewLine(targetDocument, '//-----------Posible var declarations', WSEdit, nextLineNumber);
        for (let varDecNumber = 0; varDecNumber < varDeclarations.length; varDecNumber++) {
            createNewLine(targetDocument, '//' + varDeclarations[varDecNumber], WSEdit, nextLineNumber);
        }
        createNewLine(targetDocument, '//-----------End var declarations', WSEdit, nextLineNumber);
    }
    createNewLine(targetDocument, subsDeclaration[2], WSEdit, nextLineNumber);
    createNewLine(targetDocument, '//Place of Code--->' + getLinesProcContainer(document, selection.start.line), WSEdit, nextLineNumber);

    createNewLine(targetDocument, '//-----------Previous lines------------', WSEdit, nextLineNumber);
    for (let index = previousLines.length - 1; index >= 0; index--) {
        createNewLine(targetDocument, '//' + previousLines[index], WSEdit, nextLineNumber);
    }
    createNewLine(targetDocument, '//-----------End Previous lines------------', WSEdit, nextLineNumber);
    createNewLine(targetDocument, document.getText(selection), WSEdit, nextLineNumber);

    createNewLine(targetDocument, subsDeclaration[3], WSEdit, nextLineNumber);


    await vscode.workspace.applyEdit(WSEdit);
    targetDocument.save;
}
function getEventDeclaration(document) {
    const objectDeclaration = getObjectDeclaration(document);
    let objectType = objectDeclaration.ObjectType;
    let eventDeclaration = subsDeclaration[0].replace('ObjectType1', objectType);
    if (objectType.toUpperCase() == 'TABLE') {
        objectType = 'Database';
    }
    eventDeclaration = eventDeclaration.replace('ObjectType2', objectType);
    eventDeclaration = eventDeclaration.replace('ObjectName', objectDeclaration.ObjectName);
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
        let triggerElement = getTriggerElement(document, lineNumber, trigMatch[0]);
        if (triggerElement !== '') {
            triggerElement = triggerElement + ' - ';
        }
        return (triggerElement + trigMatch[0])
    }
    return '';
}
function getTriggerElement(document, lineNumber, triggerDeclaration = '') {
    const regexTrigger = new RegExp('.+OnValidate|.+OnLookup', 'i');
    if (triggerDeclaration.search(regexTrigger) < 0) {
        return '';
    }
    for (let index = lineNumber; index >= 0; index--) {
        const elementName = getElementMatch(document.lineAt(index).text)
        if (elementName !== '') {
            return elementName;
        }
    }
    return '';

}
function getElementMatch(lineText = '') {
    let RegExpElement = new RegExp('field\\(.+;(.+);', 'i');
    let elementMatch = RegExpElement.exec(lineText);
    if (elementMatch) {
        return (elementMatch[1])
    }
    return '';
}
function getPreviousLines(document, startLine = 0) {
    let previousLines = [];
    if (startLine < 1) {
        return previousLines;
    }
    let lastLine = startLine - getMaxNumbersOfPreviousLines() - 1;
    if (lastLine < 1) {
        lastLine = 1;
    }
    for (let index = startLine - 1; index >= lastLine; index--) {
        previousLines.push(document.lineAt(index).text);
    }
    return previousLines;
}

function getMaxNumbersOfPreviousLines() {
    return 3;
}
async function createNewLine(targetDocument, lineText = '', WSEdit, lineNumber = 0) {
    await WSEdit.insert(targetDocument.uri, new vscode.Position(lineNumber, 0),
        lineText + '\n');
}
async function openSubscriptionsDoc() {
    var targetDocument = await vscode.workspace.openTextDocument(getDocumentUri());
    return targetDocument;
}
function getDocumentUri() {
    return vscode.workspace.workspaceFolders[0].uri.fsPath + '/Susbscriptions.al';
}

function getLastLine(document) {
    for (let index = document.lineCount - 1; index >= 0; index--) {
        const element = document.lineAt(index).text;
        if (element.includes('}')) {
            return (index);
        }
    }
    return document.lineCount - 1;
}
async function getArrayOfVarDeclarations(document, selection) {

    let VarDeclarations = [];
    for (let lineNumber = selection.start.line; lineNumber <= selection.end.line; lineNumber++) {
        const initialColumn = getInitialColumn(document, lineNumber);
        const finalColumn = getFinalColumn(document, lineNumber, selection);
        for (let columnNumber = initialColumn; columnNumber < finalColumn; columnNumber++) {
            if (searchForDeclaration(document.lineAt(lineNumber).text, columnNumber)) {
                const posVarDeclaration = await getPosVarDeclarationHover(document, lineNumber, columnNumber);
                if (posVarDeclaration !== '') {
                    pushToArrayIfnotExists(posVarDeclaration, VarDeclarations);
                }
            }
        }

    }
    return VarDeclarations;
}
function getInitialColumn(document, lineNumber) {
    let initialColumn = document.lineAt(lineNumber).text.search(/[A-Za-z0-9]/);
    if (initialColumn < 0) {
        initialColumn = 0;
    }
    return initialColumn;
}
function getFinalColumn(document, lineNumber, selection) {
    if (lineNumber == selection.end.line) {
        return (selection.end.character);
    }
    return document.lineAt(lineNumber).text.length;
}
async function getPosVarDeclarationHover(document, lineNumber, columnNumber) {

    let varDeclaration = '';
    const siganturaFunction = await vscode.commands.executeCommand('vscode.executeHoverProvider', document.uri, new vscode.Position(lineNumber, columnNumber));
    if (!siganturaFunction) {
        return varDeclaration;
    }
    const AllDefinition = siganturaFunction[0].contents[0].value;
    const fieldRegex = new RegExp('\\(field\\)', 'i');
    if (AllDefinition.search(fieldRegex) >= 0) {
        return varDeclaration;
    }
    if (AllDefinition.search(/procedure/i) >= 0) {
        return varDeclaration;
    }
    const fullDeclarationRegEx = new RegExp('\\s\\S+:.+', 'i');
    const fullDeclarationMatch = AllDefinition.match(fullDeclarationRegEx);
    if (fullDeclarationMatch) {
        varDeclaration = await getPosVarDeclaration(document, lineNumber, columnNumber);
        /*const fullDeclarationRegEx = new RegExp('\\s\\S+:\\S', 'i');
        const fullDeclarationMatch = AllDefinition.match(fullDeclarationRegEx);
        if (!fullDeclarationMatch) {
            varDeclaration = await getPosVarDeclaration(document, lineNumber, columnNumber);
        }
        else {
            varDeclaration = fullDeclarationMatch[0] + ';';
        }*/
    }
    return varDeclaration;
}
async function getPosVarDeclaration(document, lineNumber, columnNumber) {

    let varDeclaration = '';
    let locations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',
        document.uri, new vscode.Position(lineNumber, columnNumber));
    if (!locations) {
        return varDeclaration;
    }
    if (locations.length == 0) {
        return varDeclaration;
    }

    const lineText = document.lineAt(locations[0].range.start.line).text;
    const columnFrom = locations[0].range.start.character;
    const columnTo = lineText.substring(columnFrom).search(/[;|\\)]/) + columnFrom;
    if (columnTo > columnFrom)
    {
        varDeclaration = lineText.substring(columnFrom,columnTo)+';';
    }
    /*const fullDeclarationRegEx = new RegExp(document.getText(locations[0].range) + ':.+;?', 'i');
    const fullDeclarationMatch = lineText.match(fullDeclarationRegEx);
    if (fullDeclarationMatch) {
        varDeclaration = fullDeclarationMatch[0];
    }*/
    return varDeclaration;
}

function pushToArrayIfnotExists(newText, ArrayOfTexts) {
    for (let index = 0; index < ArrayOfTexts.length; index++) {
        if (newText == ArrayOfTexts[index])
            return;
    }
    ArrayOfTexts.push(newText);
}
function searchForDeclaration(lineText = '', columnNumber) {
    if (lineText.substring(columnNumber, columnNumber + 1).search(/[A-Za-z0-9]/) < 0) {
        return false;
    }
    if (columnNumber == 0) {
        return true
    }
    return (lineText.substring(columnNumber - 1, columnNumber).search(/[A-Za-z0-9]/) < 0);
}