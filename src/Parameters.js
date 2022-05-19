const vscode = require('vscode');
const commandName = 'tIncludeParameters';
module.exports = {
	SnippetProcedureParameters: function()
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
	commandCompletion.insertText = await GetProcedureParameters();
	commandCompletion.detail = 'Write paramaters from procedure definition';
	commandCompletion.documentation = 'Type snippet after procedure call and open "(" and it will take all parameters from procedure definition'; 
	return [commandCompletion];
}
async function GetProcedureParameters()
{
	let document = await vscode.window.activeTextEditor.document;	
	let ProcedureLine = vscode.window.activeTextEditor.selection.start.line;	
	const ProcedureLineText = document.lineAt(ProcedureLine).text;		
	//if (ProcedureLineText.search(commandName) < 0)
	//{
	//	return '';
	//}
	let ProcedureStartColumn = GetProcedureStartColumn(ProcedureLineText);
	if (ProcedureStartColumn < 0)
	{
		//ShowErrorMessage('No procedure in the line or lack of "(" open. Action cancelled.');
		return '';
	}
	
	let siganturaFunction = await vscode.commands.executeCommand('vscode.executeHoverProvider',document.uri, new vscode.Position(ProcedureLine,ProcedureStartColumn+1));	
	if (!siganturaFunction)
	{
		//ShowErrorMessage('No procedure in the line or lack of "(" open. Action cancelled.');
		return '';
	}
	let AllDefinition = siganturaFunction[0].contents[0].value;	
/*     let locations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',	
    document.uri,new vscode.Position(ProcedureLine,ProcedureStartColumn));
	if (!locations)
	{	
		return '';
	}
	const definitionDoc = await vscode.workspace.openTextDocument(locations[0].uri);        
	let AllDefinition ='';
	for (let index = locations[0].range.start.line; index <= locations[0].range.end.line; index++) {
		AllDefinition = AllDefinition + definitionDoc.lineAt(index).text;
	}*/
	const regexpOnlyParamsAndClose = /(local)*\s*procedure.+?\((.+\)).*/gmi;
	if (AllDefinition.search(regexpOnlyParamsAndClose) < 0)
	{
	//	ShowErrorMessage('Parameters in definition not found.');
		return '';
	}
	//get first group in matching of alldefinition
	AllDefinition =  AllDefinition.match(regexpOnlyParamsAndClose)[0];	
	const OnlyParams = AllDefinition.replace(regexpOnlyParamsAndClose,'$2');
	//return OnlyParams.replace(/(.+?)(:.+?[;|\)])/gmi,GetOnlyParam).slice(0,-1);    
	return OnlyParams.replace(/(.+?)(:.+?[,|\)])/gmi,GetOnlyParam).slice(0,-1);    
//    procedure SetSourceFilter(SourceType: Integer; SourceSubtype: Integer; SourceID: Code[20]; SourceRefNo: Integer; SourceKey: Boolean)
}
function GetOnlyParam(fullMatch,declarationOnly)
{
	return declarationOnly.replace(/\s*(var)*\s*(.*)/gmi,'$2')+',';
}
function GetProcedureStartColumn(LineText= '') 
{

	const regexpProcedureName = /[^\s|\.]+\(/;
	return LineText.search(regexpProcedureName);		
}