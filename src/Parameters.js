const vscode = require('vscode');
module.exports = {
	SnippetProcedureParameters: function()
	{
		return(SnippetProcedureParameters());
	}

}
async function SnippetProcedureParameters()
{
	const commandName = 'talIncludeParameters';
	const commandCompletion = new vscode.CompletionItem(commandName);
	commandCompletion.kind = vscode.CompletionItemKind.Snippet;
    commandCompletion.filterText = commandName;
    commandCompletion.label = commandName;	
	commandCompletion.insertText = await GetProcedureParameters();
	commandCompletion.detail = 'Write paramaters from procedure definition';
	commandCompletion.documentation = 'Type snippet after procedure call and open "(" and it will take all parameters from procedure definition'; 
	return [commandCompletion];
}
async function GetProcedureParameters()
{
	let document = await vscode.window.activeTextEditor.document;	
	let ProcedureLine = vscode.window.activeTextEditor.selection.start.line;
	let ProcedureStartColumn = GetProcedureStartColumn(document.lineAt(ProcedureLine).text);
	if (ProcedureStartColumn < 0)
	{
		WriteOutputPannel('No procedure in the line or lack of "(" open. Action cancelled.');
		return;
	}
    let locations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',
    document.uri,vscode.window.activeTextEditor.selection.start);
    return '';
}
function GetProcedureStartColumn(LineText= '') 
{

	const regexpProcedureName = /[^\s]+\(/;
	return LineText.search(regexpProcedureName);		
}
function WriteOutputPannel(MessageContent='') 
{
	
}