const vscode = require('vscode');
const carriage = '\r\n';
const declarationRegExp = /\s*([a-zA-Z]+)\s*([0-9]+)\s+(.*)/i;
const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
module.exports = {
	ProcessWorkSpace: function (RenumberJSON = []) {
		ProcessWorkSpace(RenumberJSON);
	},
	GetWorkspaceObjects: function (
	) {
		return GetWorkspaceObjects();
	},
	RenumberObjects: function () {
		ProcessRenumFile(ProcessWorkSpace);
	},
	CreateNewCSVFile: function () {
		let EmptyRenumberJSON = [];
		CreateCSVFile(EmptyRenumberJSON);
	},
	UpdatePreviousCSVFile: function () {
		ProcessRenumFile(CreateCSVFile);
	},
	GetCurrentObjectFromLineText: function (DeclarationLineText = '') {
		return GetCurrentObjectFromLineText(DeclarationLineText);
	},
	GetDeclarationLineText: function (ALDocument) {
		return GetDeclarationLineText(ALDocument);
	},
	GetCurrentObjectFromDocument: function (ALDocument) {
		return GetCurrentObjectFromDocument(ALDocument);
	},
	GetDeclarationLineNumber: function (ALDocument) {
		return GetDeclarationLineNumber(ALDocument);
	}
}

async function ProcessWorkSpace(RenumberJSON = []) {
	OutputChannel.clear();
	OutputChannel.show();

	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocumentURI = AllDocs[index];
		var ALDocument = await vscode.workspace.openTextDocument(ALDocumentURI);
		var DeclarationLineText = await GetDeclarationLineText(ALDocument);
		OutputChannel.appendLine('Processing ' + DeclarationLineText);		
		var NumberRelation = FindNumberRelation(DeclarationLineText, RenumberJSON);
		if (NumberRelation) {
			if ((NumberRelation.NewID != '') && (NumberRelation.NewID != NumberRelation.OldID)) {
				const LineReplaced = DeclarationLineText.replace(NumberRelation.OldID, NumberRelation.NewID);
				const WSEdit = new vscode.WorkspaceEdit;
				const DeclarationLineNumber = GetDeclarationLineNumber(ALDocument);
				const PositionOpen = new vscode.Position(DeclarationLineNumber , 0);
				const PostionEnd = new vscode.Position(DeclarationLineNumber, DeclarationLineText.length);
				await WSEdit.replace(ALDocumentURI, new vscode.Range(PositionOpen, PostionEnd),
					LineReplaced);
				await vscode.workspace.applyEdit(WSEdit);
				OutputChannel.appendLine('Replaced ' + DeclarationLineText + ' with ' + LineReplaced);
			}
		}
		else {
			OutputChannel.appendLine('Object not found in Renumber JSON');
		}
	};
}
function FindNumberRelation(DeclarationLineText, RenumberJSON) {
	var NumberRelation = {
		OldID: '',
		NewID: ''
	};
	const CurrentObject = GetCurrentObjectFromLineText(DeclarationLineText);
	if (!CurrentObject) {
		return NumberRelation;
	}
	var RenumberCurrent = (RenumberJSON.find(RenumberJSON => (RenumberJSON.ObjectType == CurrentObject.ObjectType)
		&& (RenumberJSON.PreviousID == CurrentObject.ObjectID)
	))
	if (RenumberCurrent) {
		NumberRelation.OldID = RenumberCurrent.PreviousID;
		NumberRelation.NewID = RenumberCurrent.NewID;
	}
	return NumberRelation;
}
function GetCurrentObjectFromLineText(DeclarationLineText = '') {
	var CurrentObject =
	{
		ObjectType: '',
		ObjectID: '',
		ObjectName: ''
	}
		;
	var DeclaratioMatch = DeclarationLineText.match(declarationRegExp);
	if (!DeclaratioMatch) {
		return CurrentObject;
	}
	CurrentObject =
	{
		ObjectType: DeclaratioMatch[1],
		ObjectID: DeclaratioMatch[2],
		ObjectName: extendsRemoved(DeclaratioMatch[3])
	}
	return CurrentObject;
}
async function GetWorkspaceObjects() {
	var WorkspaceObjects = [];
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		var CurrentObject = GetCurrentObjectFromDocument(ALDocument);
		if (CurrentObject.ObjectID !== '') {
			WorkspaceObjects.push(CurrentObject);
		}
	}
	return WorkspaceObjects.sort(SortObjects);
}
function SortObjects(a, b) {
	if (a.ObjectType + a.ObjectID > b.ObjectType + b.ObjectID) {
		return 1;
	}
	else {
		return -1;
	}
}
async function ProcessRenumFile(EndProccesingFuntcion) {
	var RenumberJSON = [];
	let fileUri = await vscode.window.showOpenDialog(optionsCSVFile('Open'));
	var fs = require('fs'),
		readline = require('readline');

	var rd = readline.createInterface({
		input: fs.createReadStream(fileUri[0].fsPath)
	});
	rd.on('line', function (line) {
		const Elements = line.split(';');
		RenumberJSON.push(
			{
				"ObjectType": Elements[0],
				"PreviousID": Elements[1],
				"NewID": Elements[3]
			});
	});
	rd.on('close', EndProccesingFuntcion(RenumberJSON));
}
async function CreateCSVFile(RenumberJSON) {
	const sep = ';';

	var WorkspaceObjects = await GetWorkspaceObjects();
	let fileUri = await vscode.window.showSaveDialog(optionsCSVFile('Save'));
	var LineText = 'ObjectType' + sep + 'OldId' + sep + 'Name' + sep + 'NewId' + carriage;
	let NewId = '';
	let DeclarationText = '';
	for (let index = 0; index < WorkspaceObjects.length; index++) {
		if (RenumberJSON) {
			DeclarationText = WorkspaceObjects[index].ObjectType + ' ' + WorkspaceObjects[index].ObjectID +
				' ' + WorkspaceObjects[index].ObjectName;
			NewId = FindNumberRelation(DeclarationText, RenumberJSON).NewID;
		}
		LineText = LineText + WorkspaceObjects[index].ObjectType + sep + WorkspaceObjects[index].ObjectID + sep +
			WorkspaceObjects[index].ObjectName + sep + NewId + carriage;
	}
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(LineText));
	vscode.window.showInformationMessage('CSV file created in ' + fileUri.path);
}
function extendsRemoved(OldName = '') {
	var extendsPosition = OldName.search(/\s+extends\s+/i);
	if (extendsPosition < 0) {
		return OldName;
	}
	return OldName.substring(0, extendsPosition);
}
function optionsCSVFile(newOpenLabel = '') {
	const options = {
		canSelectMany: false,
		openLabel: newOpenLabel,
		title: 'Select CSV File',
		filters: {
			'csv': ['csv'],
		}
	};
	return options;
}
function GetDeclarationLineText(ALDocument) {
	const DeclarationLineNumber = GetDeclarationLineNumber(ALDocument);
	if (DeclarationLineNumber < 0) {
		return '';
	}
	return ALDocument.lineAt(DeclarationLineNumber).text;
}
function GetDeclarationLineNumber(ALDocument) {
	let DeclarationLineNumber = -1;
	for (let index = 0; index < ALDocument.lineCount; index++) {
		let matchDeclaration = ALDocument.lineAt(index).text.match(declarationRegExp);
		if (matchDeclaration) {
			DeclarationLineNumber = index;
			return DeclarationLineNumber;
		}
	}
	return DeclarationLineNumber;
}

function GetCurrentObjectFromDocument(ALDocument) {
	let DeclarationLineLext = GetDeclarationLineText(ALDocument);
	let ObjectDeclaration = GetCurrentObjectFromLineText(DeclarationLineLext);
	return ObjectDeclaration;
}