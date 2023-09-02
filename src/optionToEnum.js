const objDeclRegExpr = /(tableextension|table)\s*(\d+)/i;
const regexpField = /field\((.*);(.*);\s*option/i;
const vscode = require('vscode');
const carriage = '\r\n';
const sep = ';';
const regexOptionMembers = /OptionMembers\s*=\s*(.+);/;
const regexOptionCaptions = /OptionCaption\s*=\s*\'(.+)\';/;

module.exports = {
    createOptionsCSV: function () {
        createOptionsCSV();
    },
	ProcessEnumFile: function()
	{
		ProcessEnumFile();
	}

}

async function createOptionsCSV()
{
	const sep = ';';
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');    
	var FinalText = 'Object Type' + sep + 'Object Number'+ sep +'FieldId' + sep +'Field Name' + sep + 'Option Members' + sep + 'Option Captions' + sep +'New Enum Id' + sep + 'New Enum Name' + carriage;
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
            fieldsText +=  objDeclaration[1] + sep + objDeclaration[2] + sep +matchField[1] + sep + matchField[2] + sep + getOptionValues(ALDocument,index,regexOptionMembers) + sep + 
			getOptionValues(ALDocument,index,regexOptionCaptions) + carriage;
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
				"ObjectNumber": Elements[1],
				"FieldID": Elements[2],
				"OptionMembers": Elements[4],
				"OptionCaption": Elements[5],
				"NewEnumID": Elements[6],
				"NewEnumName": Elements[7]
			});
	});
	rd.on('close',function () {			
			//createEnumsAndReplace(enumsJSON);
	}
	);
}

function getOptionValues(ALDocument,declineNumber=0,regex)
{
    
	for (let index = declineNumber; index < ALDocument.lineCount - 1; index++) {        
		let matchOption = ALDocument.lineAt(index).text.match(regex);
		if (matchOption) {			            
            return matchOption[1];
		}
		if (ALDocument.lineAt(index).text.indexOf("}") > -1)
		{
			return '';
		}
	}
    return '';
}