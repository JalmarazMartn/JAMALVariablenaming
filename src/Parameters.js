const vscode = require('vscode');
module.exports = {
	SnippetProcedureParameters: function()
	{
		return(SnippetProcedureParameters());
	}

}
async function SnippetProcedureParameters()
{
	const commandName = 'tIncludeParameters';
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
		WriteOutputPannel('No procedure in the line or lack or "(" open. Action cancelled.');
		return '';
	}

    let locations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',
    document.uri,new vscode.Position(ProcedureLine,ProcedureStartColumn));
	if (!locations)
	{
		WriteOutputPannel('Cannot get the definition of the method.');
		return '';
	}
	const definitionDoc = await vscode.workspace.openTextDocument(locations[0].uri);        
	let paramsOrig =definitionDoc.lineAt(locations[0].range.start.line).text;
	let OpenParanthesisPos = paramsOrig.search(/\(/g);
	if (OpenParanthesisPos == 0)
	{
		WriteOutputPannel('Paramters in definition not found.');
	}
	paramsOrig = paramsOrig.substring(OpenParanthesisPos+1);
	return paramsOrig.replace(/(.+?)(:.+?[;|\)])/gmi,'$1,').slice(0,-1);    
//    procedure SetSourceFilter(SourceType: Integer; SourceSubtype: Integer; SourceID: Code[20]; SourceRefNo: Integer; SourceKey: Boolean)
}
function GetProcedureStartColumn(LineText= '') 
{

	const regexpProcedureName = /[^\s|\.]+\(/;
	return LineText.search(regexpProcedureName);		
}
function WriteOutputPannel(MessageContent='') 
{
	
}