const vscode = require('vscode');
module.exports = {
    GetDocumentVariables: async function()
    {
        return await GetDocumentVariables();
    },
    getLocalVariables: async function(currentLineNumber=0)
    {
        return await getLocalVariables(currentLineNumber);
    },
    moreThanOneInScope: async function(VarSubtype,lineNumber,globalDocVars)
    {
        return await moreThanOneInScope(VarSubtype,lineNumber,globalDocVars);
    }
}
async function GetDocumentSymbols() {
    let document = await vscode.window.activeTextEditor.document;
    const documentSymbols = await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", document.uri);
    return documentSymbols;
}
async function GetDocumentVariables() {
    let allVariables = [];
    const documentSymbols = await GetDocumentSymbols();

    const docFirstChildren = documentSymbols[0].children[0];
    if (!docFirstChildren.name) {
        return allVariables;
    }
    if (docFirstChildren.name != 'var') {
        return allVariables;
    }
    //
    const fromLine = docFirstChildren.range.start.line;
    const ToLine = docFirstChildren.range.end.line;
    const document = await vscode.window.activeTextEditor.document;
    for (let index = fromLine; index <= ToLine; index++) {
        const element = document.lineAt(index).text;
        const lineVariables = getVariablesFromLineText(element, 'var');
        pushArrayIntoArray(lineVariables, allVariables);
    }
    return allVariables;
}
async function GetDocumentProcedures() {
    let allProcedures = [];
    const documentSymbols = await GetDocumentSymbols();
    const docChildren = documentSymbols[0].children;
    for (let index = 0; index < docChildren.length; index++) {
        const element = docChildren[index];
        if (element.name != 'var') {
            allProcedures.push({
                "name": element.name,
                "lineFrom": element.location.range.start.line,
                "lineTo": element.location.range.end.line
            });
        }
    }
    return allProcedures;
}
async function getLocalVariables(currentLineNumber=0) {
    let localVariables = [];
    const procedures = await GetDocumentProcedures();
    const currentProcedure = procedures.filter(x => x.lineFrom <= currentLineNumber && x.lineTo >= currentLineNumber);
    if (!currentProcedure) {
        return localVariables;
    }
    if (currentProcedure.length == 0)
    {
        return localVariables;
    }
    const document = await vscode.window.activeTextEditor.document;
    for (let index = currentProcedure[0].lineFrom; index <= currentProcedure[0].lineTo; index++) {
        const docLineText = document.lineAt(index).text;
        const lineVariables = getVariablesFromLineText(docLineText, currentProcedure[0].name);
        pushArrayIntoArray(lineVariables, localVariables);
    }
    return localVariables;
}
function getVariablesFromLineText(docLineText = '', scope = '') {
    let lineVariables = [];
    const regExpVarDeclaration = GetRegExpVarDeclaration(true);
    var varDecMatches = docLineText.match(regExpVarDeclaration);
    if (varDecMatches) {
        //subscriptionOnDidChange.dispose();//new
        for (var j = 0; j < Object.keys(varDecMatches).length; j++) {
            const singleMatch = varDecMatches[j].match(GetRegExpVarDeclaration(false));            
            lineVariables.push({
                "name": varDecMatches[j],
                "scope": scope,
                "type": singleMatch[6],
                "subtype": singleMatch[7]
            });
        }
    }
    return lineVariables;
}
function pushArrayIntoArray(fromArray, toArray) {
    if (fromArray) {
        for (let j = 0; j < fromArray.length; j++) {
            const element = fromArray[j];
            toArray.push(element);
        }
    }
}
function getSubtypeCount(currSubtype='',variableArray)
{   
    if (!variableArray)
    {
        return 0;
    }
    const subtypeOcurrences = variableArray.filter(x => x.subtype == currSubtype);
    return subtypeOcurrences.length;
}
function GetRegExpVarDeclaration(IsGlobal)
{
    const renameVars = require('./RenameVars.js');
    return renameVars.GetRegExpVarDeclaration(IsGlobal);
}
async function moreThanOneInScope(VarSubtype,lineNumber,globalDocVars) {    
	const localVariables = await getLocalVariables(lineNumber);
    let allVariables = [];
	pushArrayIntoArray(globalDocVars,allVariables);
    pushArrayIntoArray(localVariables,allVariables);
    return (getSubtypeCount(VarSubtype,allVariables) > 1);
}