const objDeclRegExpr = /(tableextension|table)\s*(\d+)/i;
const regexpField = /field\((.*);(.*);\s*option/i;
const vscode = require('vscode');
const carriage = '\r\n';
const sep = ';';

module.exports = {
    createOptionsCSV: function () {
        createOptionsCSV();
    }
}

async function createOptionsCSV()
{
	const sep = ';';
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');    
	var FinalText = 'Object Type' + sep + 'Object Number'+ sep +'FieldId' + sep +'Field Name' + sep + 'Option Members' + sep + 'New Enum Id' + sep + 'New Enum Name' + carriage;
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
            fieldsText +=  objDeclaration[1] + sep + objDeclaration[2] + sep +matchField[1] + sep + matchField[2] + sep + getOptionMembers(ALDocument,index) + carriage;
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
function getOptionMembers(ALDocument,declineNumber=0)
{
    const regexOptionMembers = /OptionMembers\s*=\S*(.+);/;
	for (let index = declineNumber; index < ALDocument.lineCount - 1; index++) {        
		let matchOption = ALDocument.lineAt(index).text.match(regexOptionMembers);
		if (matchOption) {			            
            return matchOption[1];
		}
	}
    return '';
}