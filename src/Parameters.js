const vscode = require('vscode');
module.exports = {
	SnippetProcedureParameters: function(document, position)
	{
		return(SnippetProcedureParameters(document, position));
	}

}
async function SnippetProcedureParameters(document, position)
{
	const commandName = 'tProcParameters';
	const commandCompletion = new vscode.CompletionItem(commandName);
	commandCompletion.kind = vscode.CompletionItemKind.Snippet;
    commandCompletion.filterText = commandName;
    commandCompletion.label = commandName;	
	commandCompletion.insertText = await GetProcedureParameters(document, position);
	commandCompletion.detail = 'Write type and subtype of the variable and when write semicolon will be renamed';
	commandCompletion.documentation = 'Write type and subtype of the variable and when write semicolon will be renamed'; 
	return [commandCompletion];
}
async function GetProcedureParameters(document, position)
{
    let CurrentLineText = document.lineAt(position.start.line).text;
    return CurrentLineText;
    let locations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',
    document.uri,vscode.window.activeTextEditor.selection.start);
    return '';
}