const objDeclRegExpr = /(tableextension|table)\s*(\d+)/i;
const enumDeclRegExpr = /enum\s*(\d+)/i;
const regexpField = /field\((.*);(.*);\s*option/i;
const vscode = require('vscode');
const carriage = '\r\n';
const sep = ';';
const regexOptionMembers = /OptionMembers\s*=\s*(.+);/;
const regexOptionCaptions = /OptionCaption\s*=\s*\'(.+)\';/;
const optionSep = ',';
let OutputChannel = vscode.window.createOutputChannel('Substitute options');
//Mostrar output channel
//Chequear captions
//mensajes de aviso
module.exports = {
	createOptionsCSV: function () {
		createOptionsCSV();
	},
	ProcessEnumFile: function () {
		ProcessEnumFile();
	}

}

async function createOptionsCSV() {
	const sep = ';';
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	var FinalText = 'Object Type' + sep + 'Object Number' + sep + 'FieldId' + sep + 'Field Name' + sep + 'Option Members' + sep + 'Option Captions' + sep + 'New Enum Id' + sep + 'New Enum Name' + carriage;
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index]);
		FinalText = FinalText + await GetFieldsTextFromTableExtension(ALDocument);
	}
	let fileUri = await vscode.window.showSaveDialog(optionsCSVFile('Save'));
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(FinalText));
	vscode.window.showInformationMessage('CSV file created in ' + fileUri.path);
}
async function GetFieldsTextFromTableExtension(ALDocument) {
	const Library = require('./Renumber/Library.js');
	const DeclarationLineText = Library.GetDeclarationLineText(ALDocument);
	//
	let fieldsText = '';
	//get in DeclarationLineText line the number expresion: DeclarationLineText is as "tableextension 50000 miexte"
	const objDeclaration = DeclarationLineText.match(objDeclRegExpr);
	if (objDeclaration === null) {
		return '';
	}
	for (let index = 1; index < ALDocument.lineCount - 1; index++) {
		let matchField = ALDocument.lineAt(index).text.match(regexpField);
		if (matchField) {
			fieldsText += objDeclaration[1] + sep + objDeclaration[2] + sep + matchField[1] + sep + matchField[2] + sep + getOptionValues(ALDocument, index, regexOptionMembers) + sep +
				getOptionValues(ALDocument, index, regexOptionCaptions) + carriage;
		}
	}
	return fieldsText;
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
async function ProcessEnumFile() {
	let enumsJSON = [];
	let fileUri = await vscode.window.showOpenDialog(optionsCSVFile('Open'));
	var fs = require('fs'),
		readline = require('readline');

	var rd = readline.createInterface({
		input: fs.createReadStream(fileUri[0].fsPath)
	});
	rd.on('line', function (line) {
		const Elements = line.split(sep);
		enumsJSON.push(
			{
				"ObjectType": Elements[0],
				"ObjectID": Elements[1],
				"FieldID": Elements[2],
				"OptionMembers": Elements[4].replace(/'/g, '"'),
				"OptionCaptions": Elements[5],
				"NewEnumID": Elements[6],
				"NewEnumName": Elements[7]
			});
	});
	rd.on('close', function () {		
		createEnums(enumsJSON);
		replaceInWS(enumsJSON);
	}
	);
}
function getOptionValues(ALDocument, declineNumber = 0, regex) {

	for (let index = declineNumber; index < ALDocument.lineCount - 1; index++) {
		let matchOption = ALDocument.lineAt(index).text.match(regex);
		if (matchOption) {
			return matchOption[1].replace(/"/g, '\'');
		}
		if (ALDocument.lineAt(index).text.indexOf("}") > -1) {
			return '';
		}
	}
	return '';
}

async function createEnums(enumsJSON) {
    OutputChannel.clear();
    OutputChannel.show();
	const enumFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/src/enum/';
	//const enumFolder= 'c:/Rutas/';
	const existingEnumsIDS = await getExistingEnumIDS();
	for (let index = 1; index < enumsJSON.length; index++) {
		const newEnum = enumsJSON[index];
		const fileUri = getEnumUri(enumFolder, newEnum.NewEnumName);
		if (!existsEnum(newEnum, existingEnumsIDS)) {
			vscode.workspace.fs.writeFile(fileUri, Buffer.from(getFileEnum(newEnum)));
			OutputChannel.appendLine(newEnum.NewEnumName + ' created.');
		}
		else
		{
			OutputChannel.appendLine(newEnum.NewEnumName + ' already exists.');
		}
	}
}

function getEnumUri(folderName, enumName = '') {
	const finalUri = folderName + '\\' + enumName.replace(/\s/g, '') + '.Enum.al';
	return vscode.Uri.file(finalUri);
}

function getFileEnum(newEnum) {
	let enumDeclaration = '';
	enumDeclaration = 'enum ' + newEnum.NewEnumID + ' "' + newEnum.NewEnumName + '"' + carriage;
	enumDeclaration = enumDeclaration + '{' + carriage;
	enumDeclaration = enumDeclaration + 'Extensible = true;' + carriage;
	const optionMembers = newEnum.OptionMembers.split(optionSep);
	const optionCaptions = newEnum.OptionCaptions.split(optionSep);
	for (let index = 0; index < optionMembers.length; index++) {
		const optionMember = optionMembers[index];
		enumDeclaration = enumDeclaration + 'value(' + index.toString() + ';' + optionMember + ')' + carriage;
		enumDeclaration = enumDeclaration + '{' + carriage;
		if (optionCaptions) {
			if (optionCaptions[index]) {
				enumDeclaration = enumDeclaration + 'Caption = \'' + optionCaptions[index] + '\';' + carriage;
			}
		}
		enumDeclaration = enumDeclaration + '}' + carriage;
	}
	enumDeclaration = enumDeclaration + '}' + carriage;
	return enumDeclaration;
}

function existsEnum(newEnum, existingEnumIDS) {
	for (let index = 0; index < existingEnumIDS.length; index++) {
		if (existingEnumIDS[index] == newEnum.NewEnumID) {
			return true;
		}
	}
	return false;
}
async function getExistingEnumIDS() {
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	let existingEnumIDS = [];
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index]);
		const Library = require('./Renumber/Library.js');
		const DeclarationLineText = Library.GetDeclarationLineText(ALDocument);
		const enumDeclaration = DeclarationLineText.match(enumDeclRegExpr);
		if (enumDeclaration !== null) {
			existingEnumIDS.push(enumDeclaration[1]);
		}
	}
	return existingEnumIDS;
}
async function replaceInWS(enumsJSON) {
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index]);
		await replaceOptions(ALDocument, enumsJSON);
	}
	vscode.window.showInformationMessage('Option to enum finished');
}
async function replaceOptions(ALDocument, enumsJSON) {
	const Library = require('./Renumber/Library.js');
	const DeclarationLineText = Library.GetDeclarationLineText(ALDocument);
	if ((DeclarationLineText.search(objDeclRegExpr) < 0)) {
		return;
	}
	let objDeclaration = DeclarationLineText.match(objDeclRegExpr);
	for (let index = 1; index < ALDocument.lineCount; index++) {
		const line = ALDocument.lineAt(index).text;
		if (line.search(regexpField) >= 0) {
			for (let indexJSON = 0; indexJSON < enumsJSON.length; indexJSON++) {
				if ((line.match(regexpField)[1] === enumsJSON[indexJSON].FieldID) &&
					(objDeclaration[1] === enumsJSON[indexJSON].ObjectType) &&
					(objDeclaration[2] === enumsJSON[indexJSON].ObjectID)) {
					await replaceOption(ALDocument, enumsJSON[indexJSON], index);
					OutputChannel.appendLine(enumsJSON[indexJSON].FieldID.toString() + ' replaced');
				}
			}
		}
	}
}
async function replaceOption(ALDocument, enumJSON, lineNumber) {
	const line = ALDocument.lineAt(lineNumber).text;
	if (line.search(regexpField) < 0) {
		return;
	}
	const newLine = line.replace(/\s*;\s*option/i, '; enum ' + doubleQuoteIfNeeded(enumJSON.NewEnumName));
	const WSEdit = new vscode.WorkspaceEdit;
	const PositionOpen = new vscode.Position(lineNumber, 0);
	const PostionEnd = new vscode.Position(lineNumber, line.length);
	await WSEdit.replace(await ALDocument.uri, new vscode.Range(PositionOpen, PostionEnd),
		newLine);
	
	await vscode.workspace.applyEdit(WSEdit);
	await removeOptionValues(ALDocument,lineNumber);
}
async function removeOptionValues(ALDocument, lineNumber = 0) {
	for (let index = lineNumber+1; index < ALDocument.lineCount - 1; index++) {
		const lineText = ALDocument.lineAt(index).text;
		let newLineText = lineText.replace(/.+Option.+;/gi, '');
		const PositionOpen = new vscode.Position(index, 0);
		const PostionEnd = new vscode.Position(index, lineText.length);
		const WSEdit = new vscode.WorkspaceEdit;
		await WSEdit.replace(await ALDocument.uri, new vscode.Range(PositionOpen, PostionEnd),
			newLineText);
		await vscode.workspace.applyEdit(WSEdit);
		if (ALDocument.lineAt(index).text.indexOf("}") > -1) {
			return;
		}
	}
}
function doubleQuoteIfNeeded(originalText='')
{
	let finalText = originalText;
	finalText = originalText.replace(/"/g,'');
	if (finalText.search(/\s/) >-1)
	{
		finalText = '"' + finalText + '"';
	}
	return finalText;
	
}