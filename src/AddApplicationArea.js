const vscode = require('vscode');
const ObjectTypeSearch = {
    Table: /table/gi,
    Page: /page/gi,
    TableExtension: /tableextension/gi,
    PageExtension : /pageextension/gi,
    Report: /report/gi,
    RequestPage: /requestpage/gi,
    Others: /[codeunit|xmlport|enum|query]/gi,
}
const AditionalElementType = {
    AppArea: 'ApplicationArea',
    DataClass: 'DataClassification'
}
const ObjectType = {
    Table: 'table',
    Page: 'page',
    TableExtension: 'tableextension',
    PageExtension : 'pageextension',
    Report: 'report',
    NoProcess: 'NoProcess'
}
const DataClassOptions = {
    ToBeClass: 'ToBeClassified',
    CustContent: 'CustomerContent'
}
module.exports = {
    changeInFile: async function () {
//    changeInWorkspace: async function () {    //remove this function when the extension is ready
        var currEditor = vscode.window.activeTextEditor;
        let CurrDoc = currEditor.document;
        await DocProcessAppAreaDataClass(CurrDoc);
    },
    changeInWorkspace: async function () {
        await WorkSpaceProcess();
    },
    IsObjectPage: function (CurrDoc) {
        return IsObjectPage(CurrDoc);
    }
}
async function WorkSpaceProcess() {
    const Confirm = await vscode.window.showInformationMessage('Do you want to add the Application Area to all the files in the workspace?', 'Yes', 'No');
    if (Confirm === 'No') { return };
    var WSDocs = await vscode.workspace.findFiles('**/*.{al}');
    WSDocs.forEach(ALDocumentURI => {
        vscode.workspace.openTextDocument(ALDocumentURI).then(
            ALDocument => {
                console.log(GetObjectType(ALDocument));
                //if (GetObjectType(ALDocument) == ObjectType.Page) {
                //const AvoidImplicitREC = require('./AvoidImplicitREC.js');
                //AvoidImplicitREC.FixFieldDeclarationDocument(ALDocument);
                //}
                DocProcessAppAreaDataClass(ALDocument);
                replaceExpresionInDoc(ALDocument,"[Scope('Internal')]",'');
            });
    });
}
async function DocProcessAppAreaDataClass(CurrDoc) {
    if (GetObjectType(CurrDoc) == ObjectType.NoProcess) { return };
    var CurrElement = { ElementText: "", ElementOpenLine: 0 };
    CurrElement.ElementText = '';        
    for (var i = 0; i < CurrDoc.lineCount; i++) {
        CurrElement = await lineProcess(i, CurrDoc, CurrElement);
    }
}
async function lineProcess(LineNumber, CurrDoc, CurrElement = { ElementText: "", ElementOpenLine: 0 }) {
    await SubsTituteToBeClassified(LineNumber, CurrDoc);
    if (MatchWithElement(CurrDoc.lineAt(LineNumber).text)) {
        CurrElement.ElementText = CurrDoc.lineAt(LineNumber).text;
    }
    else {
        if (CurrElement.ElementText !== '') {
            CurrElement.ElementText = CurrElement.ElementText + CurrDoc.lineAt(LineNumber).text
        }
    }
    if (MatchWithOpen(CurrDoc.lineAt(LineNumber).text)) {
        if (CurrElement.ElementText !== '') {
            CurrElement.ElementOpenLine = LineNumber;
        }
    }

    if (MatchWithClose(CurrDoc.lineAt(LineNumber).text)) {
        await PerformChanges(CurrElement, CurrDoc);
        CurrElement.ElementText = '';
        CurrElement.ElementOpenLine = 0;
    }
    return (CurrElement);
}
function MatchWithElement(lineText = '') {
    var ElementMatch = lineText.match(/\s*field\s*\(.*;.*\)/gi);
    if (!ElementMatch) {
        ElementMatch = lineText.match(/\s*[^on]action\s*\(.*\)/gi);
    }
    if (!ElementMatch) {
        ElementMatch = lineText.match(/\s*part\s*\(.*\)/gi);
    }
    if (ElementMatch) { return (true); }
    return (false);
}
function MatchWithClose(lineText = '') {
    return (lineText.indexOf('}') >= 0);
}
function MatchWithOpen(lineText = '') {
    return (lineText.indexOf('{') >= 0);
}
async function PerformChanges(CurrElement = { ElementText: "", ElementOpenLine: 0 }, CurrDoc) {
    if (CurrElement.ElementText == '') { return }
    var AditionalElement = GetAditionalElement(CurrDoc);
    if (!AditionalElement) 
    { return };
    if (CurrElement.ElementText.search(/FieldClass\s*=\s*(FlowField|FlowFilter)\s*;/i) >= 0) {
        return;
    }
    if (CurrElement.ElementText.indexOf(AditionalElement.Key) >= 0) { return }
    const WSEdit = new vscode.WorkspaceEdit;

    const PositionOpen = new vscode.Position(CurrElement.ElementOpenLine,
        CurrDoc.lineAt(CurrElement.ElementOpenLine).text.indexOf('{') + 1);
    var NewValue = AditionalElement.Key + '=' + AditionalElement.Value + ';';
    WSEdit.replace(CurrDoc.uri, new vscode.Range(PositionOpen, PositionOpen),
        NewValue);
    await vscode.workspace.applyEdit(WSEdit);
}
async function SubsTituteToBeClassified(LineNumber, CurrDoc) {
    var PositionTobe = CurrDoc.lineAt(LineNumber).text.indexOf(DataClassOptions.ToBeClass);
    if (PositionTobe < 0) { return }
    const WSEdit = new vscode.WorkspaceEdit;

    const PositionStart = new vscode.Position(LineNumber, PositionTobe);
    const PositionEnd = new vscode.Position(LineNumber, PositionTobe + DataClassOptions.ToBeClass.length);
    var NewValue = DataClassOptions.CustContent;
    WSEdit.replace(CurrDoc.uri, new vscode.Range(PositionStart, PositionEnd),
        NewValue);
    await vscode.workspace.applyEdit(WSEdit);
}
function GetAditionalElement(CurrDoc) {
    switch (GetObjectType(CurrDoc)) {
        case ObjectType.Table:
        case ObjectType.TableExtension:
            return ({ Key: AditionalElementType.DataClass, Value: "CustomerContent" })
        case ObjectType.Page:
        case ObjectType.PageExtension:
        case ObjectType.Report:
            return ({ Key: AditionalElementType.AppArea, Value: "Basic,Suite" })
    }
}
function GetObjectType(CurrDoc) {
    for (var i = 0; i < CurrDoc.lineCount; i++) {
        if (CurrDoc.lineAt(i).text !== '') {
            if (CurrDoc.lineAt(i).text.search(ObjectTypeSearch.Table) >= 0) {
                return (ObjectType.Table)
            }
            if (CurrDoc.lineAt(i).text.search(ObjectTypeSearch.Page) >= 0) {
                return (ObjectType.Page)
            }
            if (CurrDoc.lineAt(i).text.search(ObjectTypeSearch.TableExtension) >= 0) {
                return (ObjectType.TableExtension)
            }
            if (CurrDoc.lineAt(i).text.search(ObjectTypeSearch.PageExtension) >= 0) {
                return (ObjectType.PageExtension)
            }
            if (CurrDoc.lineAt(i).text.search(ObjectTypeSearch.Report) >= 0) {
                return (ObjectType.Report)
            }
            if (CurrDoc.lineAt(i).text.search(ObjectTypeSearch.Others) >= 0) {
                return (ObjectType.NoProcess)
            }
        }
    }
    return ObjectType.NoProcess;
}
async function replaceExpresionInDoc(CurrDoc, Search, Replace) {
    const WSEdit = new vscode.WorkspaceEdit;
    for (var i = 0; i < CurrDoc.lineCount; i++) {
        if (CurrDoc.lineAt(i).text.indexOf(Search) >= 0) {
            const PositionStart = new vscode.Position(i, CurrDoc.lineAt(i).text.indexOf(Search));
            const PositionEnd = new vscode.Position(i, CurrDoc.lineAt(i).text.indexOf(Search) + Search.length);
            WSEdit.replace(CurrDoc.uri, new vscode.Range(PositionStart, PositionEnd),
                Replace);
        }
    }
    await vscode.workspace.applyEdit(WSEdit);
}
function IsObjectPage(CurrDoc) {
        if (GetObjectType(CurrDoc) == ObjectType.Page) {
            return true;
        }
    return false;
}