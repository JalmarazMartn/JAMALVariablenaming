const vscode = require('vscode');
let menuNode = {
    Type: '',
    Id: '',
    UsageCategory: ''
}
let menuNodeList = [];
module.exports = {
    setUsageCategory: function () {
        setUsageCategory();
    }
}
async function setUsageCategory() {
    await processMenuTxtfile();    
    await processMenuNodes(menuNodeList);
}
async function processMenuNodes(menuNodeList) {
    let OutputChannel = vscode.window.createOutputChannel('Set Usage Category');
    OutputChannel.clear();
    OutputChannel.show();

    const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
    for (let index = 0; index < AllDocs.length; index++) {
        var ALDocumentURI = AllDocs[index];
        var ALDocument = await vscode.workspace.openTextDocument(ALDocumentURI);
        var DeclarationLineText = await GetDeclarationLineText(ALDocument);
        OutputChannel.appendLine('Processing ' + DeclarationLineText);
        let CurrentObjectFromLineText = GetCurrentObjectFromLineText(DeclarationLineText);
        let menuNode = menuNodeList.find(x => x.Id === CurrentObjectFromLineText.ObjectID
            && x.Type === CurrentObjectFromLineText.ObjectType);
        if (menuNode) {
            await appendUsageinDocument(ALDocument, menuNode.UsageCategory);
            OutputChannel.appendLine(DeclarationLineText + ' With usage');
        }
    };

}

function GetDeclarationLineText(ALDocument) {
    const Library = require('./Renumber/Library.js');
    return Library.GetDeclarationLineText(ALDocument);
}
function GetDeclarationLineNumber(ALDocument) {
    const Library = require('./Renumber/Library.js');
    return Library.GetDeclarationLineNumber(ALDocument);
}
function GetCurrentObjectFromLineText(LineText) {
    const Library = require('./Renumber/Library.js');
    return Library.GetCurrentObjectFromLineText(LineText);
}
async function appendUsageinDocument(ALDocument, newUsageCategory) {
    const WSEdit = new vscode.WorkspaceEdit;
    const DeclarationLineNumber = GetDeclarationLineNumber(ALDocument);
    const PositionOpen = new vscode.Position(DeclarationLineNumber+2, 0);
    let newUsageCategoryProperty = 'UsageCategory = ' + newUsageCategory + ';';
    const usageRegex = /UsageCategory\s*=\s*\w+;/gmi;
    let newText = '';
    if (ALDocument.getText().search(usageRegex) > -1) {
        newText = ALDocument.getText().replace(usageRegex, newUsageCategoryProperty);
        if (newText == ALDocument.getText()) {
            return
        }        
    }
    else
    {
    newUsageCategoryProperty = '{\r\n'+newUsageCategoryProperty + '\r\n'+ 'ApplicationArea = All;\r\n';
    newText = ALDocument.getText().replace('{\r\n', newUsageCategoryProperty);
    //await WSEdit.insert(ALDocument.uri, PositionOpen, newUsageCategoryProperty);
    }
    WSEdit.replace(ALDocument.uri, new vscode.Range(new vscode.Position(0,0),new vscode.Position(ALDocument.lineCount,0)), newText);
    await vscode.workspace.applyEdit(WSEdit);
}
async function processMenuTxtfile() {
    const fs = require('fs');
    const filePath = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select Menu.txt file'
    });
    let menuTxtFile = fs.readFileSync(filePath[0].fsPath, 'utf8');

    //const itemRegex = /RunObjectType=(\w+);RunObjectID=(\d+);.+DepartmentCategory=(\w+)/gmi;
    const itemRegex1 = /RunObjectType=(\w+)/gmi;
    const itemRegex2 = /RunObjectID=(\d+)/gmi;
    const itemRegex3 = /DepartmentCategory=(\w+)/gmi;
    let menuLines = menuTxtFile.split('\r\n');
    menuNodeList = [];
    for (let index = 0; index < menuLines.length; index++) {
        let match3 = itemRegex3.exec(menuLines[index]);
        if (match3) {
            menuNode.UsageCategory = match3[1];
            if (menuNode.UsageCategory == 'Reports') {
                menuNode.UsageCategory = 'ReportsAndAnalysis';
            }
            menuNodeList.push({
                Type: menuNode.Type,
                Id: menuNode.Id,
                UsageCategory: menuNode.UsageCategory
            });
        }
        let match2 = itemRegex2.exec(menuLines[index]);
        if (match2) {
            menuNode.Id = match2[1];
        }
        let match1 = itemRegex1.exec(menuLines[index]);
        if (match1) {
            menuNode.Type = match1[1].toLowerCase();
        }
    }
}