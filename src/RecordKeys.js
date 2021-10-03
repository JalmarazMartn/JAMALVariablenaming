const vscode = require('vscode');
const commandName = 'tGetKeys';
module.exports = {
	SnippetRecordKeys: function()
	{
		return(SnippetProcedureParameters());
	}

}
async function SnippetProcedureParameters()
{	
	const commandCompletion = new vscode.CompletionItem(commandName);
	commandCompletion.kind = vscode.CompletionItemKind.Snippet;
    commandCompletion.filterText = commandName;
    commandCompletion.label = commandName;	
	commandCompletion.insertText = new vscode.SnippetString(await GetSnippetTextWithKeys());
	commandCompletion.detail = 'Get record keys and select one';
	commandCompletion.documentation = 'Type snippet after Setcurrentkey( and then select record key.'; 
	return [commandCompletion];
}
async function GetSnippetTextWithKeys()
{
	let document = await vscode.window.activeTextEditor.document;	
	let SetKeyLine = vscode.window.activeTextEditor.selection.start.line;	
	const SetKeyLineText = document.lineAt(SetKeyLine).text;		
	let RecordStartColumn = GetRecordStartColumn(SetKeyLineText);
	if (RecordStartColumn < 0)
	{
		return '';
	}

    let locations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',
    document.uri,new vscode.Position(SetKeyLine,RecordStartColumn));
	if (!locations)
	{
		return '';
	}
    let finallocations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',
    document.uri,locations[0].range.start);

	const definitionDoc = await vscode.workspace.openTextDocument(finallocations[0].uri);        	
	let AllDefinition =definitionDoc.getText();
	const regexpRecordKeys = /key\(.+;.+\)/gmi;
	var varDecMatches = AllDefinition.match(regexpRecordKeys);
	if (!varDecMatches) 
	{
		return '';
	}
	let KeysFound = '';
	for (var i = 0; i < Object.keys(varDecMatches).length; i++) {
		var KeyElement = varDecMatches[i];
		if (KeysFound !== '')
		{
			KeysFound = KeysFound + ',';
		}
		KeysFound = KeysFound + convertKeyElementToSnippetText(KeyElement);
	}	
	KeysFound = '${1|' + KeysFound + '|}';
	return KeysFound;
}
function GetRecordStartColumn(LineText= '') 
{

	const regexpProcedureName = /[^\s]*.setcurrentkey\(/gmi;
	return LineText.search(regexpProcedureName);		
}
function convertKeyElementToSnippetText(KeyElement='')
{
	const KeyStart = KeyElement.search(';') + 1;
	let ConvertedKey = KeyElement.substring(KeyStart);
	// @ts-ignore
	ConvertedKey = ConvertedKey.replaceAll('"','\"');
	// @ts-ignore
	ConvertedKey = ConvertedKey.replaceAll(',','\\,');
	// @ts-ignore
	ConvertedKey = ConvertedKey.replaceAll(')','');
	return ConvertedKey;
}