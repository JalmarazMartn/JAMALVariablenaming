const vscode = require('vscode');
const FieldDeclarationRegExp = /(\s*field\s*\(.*;\s*)(.*\))/i;
//export module function fixfielddeclaration
module.exports = {
    FixFieldDeclarationDocument:
        async function (ALDocument) {
            FixFieldDeclarationDocument(ALDocument);
        },
    FieldDeclarationAllWorkspace:
        function () {
            FieldDeclarationAllWorkspace();
        }
};
async function FieldDeclarationAllWorkspace() {
    const Confirm = await vscode.window.showInformationMessage('Do you want to add .rec declaration the page files in the workspace?', 'Yes', 'No');
    if (Confirm === 'No') { return };
    const WSDocs = await vscode.workspace.findFiles('**/*.{al}');
    WSDocs.forEach(ALDocumentURI => {
        vscode.workspace.openTextDocument(ALDocumentURI).then(
            ALDocument => {
                FixFieldDeclarationDocument(ALDocument);
            });
    });
}
async function FixFieldDeclarationDocument(ALDocument) {
    const AddAplicationArea = require('./AddApplicationArea.js');
    //regex to find text after SourceTable = 
    const SourceTableRegExp = /\s*SourceTable\s*=\s*(.*);/i;
    let SourceTable = '';
    if (!AddAplicationArea.IsObjectPage(ALDocument)) {
        return;
    }
    for (var i = 0; i < ALDocument.lineCount; i++) {
        const matchSourceTable = ALDocument.lineAt(i).text.match(SourceTableRegExp);
        if (matchSourceTable) {
            SourceTable = matchSourceTable[1];
        }
        if (ALDocument.lineAt(i).text.match(FieldDeclarationRegExp)) {
            //move this code to a function            
            await ProccessLine(ALDocument, i,SourceTable);
        }
    }
}
async function ProccessLine(ALDocument, LineNumber,SourceTable='') {
    const lineText = ALDocument.lineAt(LineNumber).text;
    var WholeMatch = lineText.match(FieldDeclarationRegExp);
    if (!WholeMatch) {
        return;
    }
    //if find /;rec./i then return
    if (WholeMatch[2].match(/\s*rec\./i)) {
        return;
    }
    if (ExistsDotsOutsidePairOfQuotes(WholeMatch[2])) {
        return;
    }
    const fieldStart = GetPositionAfterSemicolon(lineText);
    let locations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',
    ALDocument.uri,new vscode.Position(LineNumber, fieldStart));
	if (!locations)
	{
		return;
	}
    if (!await IsDocumentDefinitionOfSource(locations[0].uri,SourceTable)) {
        return;
    }
    console.log('--------'+SourceTable);
    console.log(locations[0].uri);
    //get all match text replacing second group with rec. + second group
    var NewValue = WholeMatch[1] + 'Rec.' + WholeMatch[2];
    const WSEdit = new vscode.WorkspaceEdit;
    const PositionOpen = new vscode.Position(LineNumber, lineText.indexOf(WholeMatch[0]));
    const PositionClose = new vscode.Position(LineNumber, lineText.indexOf(WholeMatch[0]) + WholeMatch[0].length);
    WSEdit.replace(ALDocument.uri, new vscode.Range(PositionOpen, PositionClose ), NewValue);
    await vscode.workspace.applyEdit(WSEdit);
}
function RemoveAllTextBetweenQuotes(Text) {
    const BlocksOfTextBetweenRegExp = /(\"[^\"]*\")/g;
    var NewText = Text;
    NewText = NewText.replace(BlocksOfTextBetweenRegExp, '');
    return NewText;
}
function ExistsDotsOutsidePairOfQuotes(Text) {
    var NewText = Text;
    NewText = RemoveAllTextBetweenQuotes(NewText);
    var Dots = NewText.match(/\./g);
    if (Dots === null) {
        return false;
    }
    if (Dots.length % 2 === 0) {
        return false;
    }
    return true;
}
function GetPositionAfterSemicolon(LineText) {
    var Position = LineText.indexOf(';');
    if (Position === -1) {
        return 0;
    }
    Position = Position + 1;
    while (LineText.charAt(Position) === ' ') {
        Position = Position + 1;
        if (Position > LineText.length) {
            return 0;
        }
    }
    return Position;
}
async function IsDocumentDefinitionOfSource(DocumentUri,SourceTable='') {
    const Document = await vscode.workspace.openTextDocument(DocumentUri);
    const TableNameRegExp = new RegExp(SourceTable, 'i');
    for (var i = 0; i < Document.lineCount; i++) {
        const lineText = Document.lineAt(i).text;
        if (lineText.match(TableNameRegExp)) {
            return true;
        }
        else if (lineText !== '') {
            return false;
        }
    }
}
