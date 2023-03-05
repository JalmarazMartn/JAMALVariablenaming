const vscode = require('vscode');
const TextWritevar = 'WriteTypeAndSubtype: ';
//const multiSelectObjType = '${1|Record,Codeunit|}';//$2';
const multiSelectObjType = '';
let SnippetTrigered = false;
var subscriptionOnDidChange = vscode.workspace.onDidChangeTextDocument(HandleDocumentChanges);
var subscriptionOnDidChangeSnp = vscode.workspace.onDidChangeTextDocument(HandleDocumentChanges);
subscriptionOnDidChange.dispose();
subscriptionOnDidChangeSnp.dispose();
module.exports = {
	changeSelection: async function () {
		var currEditor = vscode.window.activeTextEditor;
		var selection = currEditor.selection;
		const startLine = selection.start.line;
		const endLine = selection.end.line;
		let CurrDoc = currEditor.document;

		for (var i = startLine; i <= endLine; i++) {
			await lineProcess(i, CurrDoc);
		}
		GetExtensionConf();
	},
	changeAll: async function () {
		var currEditor = vscode.window.activeTextEditor;
		let CurrDoc = currEditor.document;
		//const WSEdit = new vscode.WorkspaceEdit;
		for (var i = 0; i < CurrDoc.lineCount; i++) {
			await lineProcess(i, CurrDoc);
		}
	},	
	GetRegExpVarDeclaration: function (IsGlobal=false){
		return(GetRegExpVarDeclaration(IsGlobal));
	},
	CatchDocumentChanges: function()
	{
		CatchDocumentChanges();
	},
	CatchDocumentChangesSnp: function()
	{
		CatchDocumentChangesSnp();
	},
	StopCatchDocumentChanges: function()
	{
		StopCatchDocumentChanges();
	},
	SnippetVariableAL: function()
	{		
		const commandName = 'talVarNaming';				
		const insertText = new vscode.SnippetString(TextWritevar + multiSelectObjType);

		const detail = 'Write type and subtype of the variable and when write semicolon will be renamed';
		const documentation = 'Write type and subtype of the variable and when write semicolon will be renamed'; 	
		//return(SnippetVariableAL());
		return(SnippetVariableALArg(commandName,detail,insertText,documentation));		
	}
}
async function lineProcess(i, CurrDoc) {
	var line = CurrDoc.lineAt(i);
	if (!isSubscriptionProcedure(i,CurrDoc))
	{
		await ALVariableNaming(i, line.text);
	}
}
async function ALVariableNaming(lineNumber = 0, original) {
	let convertedOriginal = getConvertedString(original);
	const regExpVarDeclaration = GetRegExpVarDeclaration(true);
	var varDecMatches = convertedOriginal.match(regExpVarDeclaration);
	if (!varDecMatches) { return };
	//subscriptionOnDidChange.dispose();//new
	for (var i = 0; i < Object.keys(varDecMatches).length; i++) {
		var element = varDecMatches[i];
		convertedOriginal = await MatchProcess(element, convertedOriginal, lineNumber);
	}
}
async function MatchProcess(element, original = '', lineNumber = 0) {
	const singleMatch = element.match(GetRegExpVarDeclaration(false));
	const FullMatch = singleMatch[0];
	const VarName = singleMatch[5];
	let posVarName = original.indexOf(FullMatch) + FullMatch.indexOf(VarName);
	const VarSubtype = singleMatch[7];	
	var NewVarName = GetNewVarName(VarSubtype);
	if (VarName.indexOf(NewVarName) >= 0)
	{return original}
	var edit = await vscode.commands.executeCommand('vscode.executeDocumentRenameProvider',
		vscode.window.activeTextEditor.document.uri,
		new vscode.Position(lineNumber, posVarName),
		NewVarName);

	await vscode.workspace.applyEdit(edit);
	return vscode.window.activeTextEditor.document.lineAt(lineNumber).text;
}

function GetNewVarName(VarSubtype = '') {
	//var NewVarName = VarSubtype.replace(/\s|"|temporary|\/|\.|-/gi, '');
	var NewVarName = getConvertedString(VarSubtype.replace(/temporary|[^a-zA-Z0-9]/gi, ''));
	if (VarSubtype.match(/temporary/i)) { NewVarName = 'Temp' + NewVarName }	
	if (GetExcludePrefixInRename())
	{
		NewVarName = NewVarName.replace(GetAppPrefix(), '').trim();
	}
	return NewVarName;
}
function GetExtensionConf() {
	//const ExtConf = vscode.workspace.getConfiguration('', vscode.workspace.workspaceFolders[0].uri);	
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		//vscode.window.setStatusBarMessage('Es conf ' +ExtConf.get('CharsFrom'));
	}
}
function GetRegExpVarDeclaration(isGlobal = false) {
	let searchParams = 'i';
	if (isGlobal) { searchParams = 'gi'; }
	const G1Spaces = new RegExp(/(\s*)/.source);
	const G2ByRef = new RegExp(/(var|.{0})/.source);
	const G2NewLine = new RegExp(/($|.{0})/.source);
	const G2Spaces = new RegExp(/(\s*)/.source);
	const G3VarName = new RegExp(/([A-Za-z\s0-9"]*):\s*/.source);
	const G4VarType = new RegExp(/(Record|Page|TestPage|Report|Codeunit|Query|XmlPort|Enum|TestRequestPage)/.source);
	const G5VarSubType = new RegExp(/([A-Za-z\s0-9"-\/]*)/.source);
	const G6EndStat = new RegExp(/(\)|;)/.source);
	//const G6EndStat = new RegExp(/(\)|;|.{0})/.source);	

	return (new RegExp('' +
		G1Spaces.source +
		G2ByRef.source +
		G2NewLine.source +
		G2Spaces.source +
		G3VarName.source +
		G4VarType.source +
		G5VarSubType.source +
		G6EndStat.source, searchParams));

}
function GetExcludePrefixInRename()
{
    const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) 
	{
		return ExtConf.get('ExcludePrefixInRename');
    }
	return true;
}
function GetAppPrefix()
{
	var AppPrefix = GetConfigValue('AppPrefix');
    if ((!AppPrefix) || (AppPrefix == ''))
    {
        vscode.window.showErrorMessage("You must specify a value for AppPrefix in extension settings");
    }
    return(new RegExp(AppPrefix));    
}
async function HandleDocumentChanges(event)
{
		if (!event.contentChanges[0])
		{
			return;
		}
		const ContentChangeText = event.contentChanges[0].text;
		const IsReturnKey = (ContentChangeText.charCodeAt(0) == 13);
		const IsEndOfDeclaration = ContentChangeText.search(/".*"|;|temporary/i) >= 0;
        if (!IsReturnKey && !IsEndOfDeclaration)
		{
			return;
		}
		if (SnippetTrigered)
		{
			SnippetTrigered = false;
			StopCatchDocumentChangesSnp();
		}	
		const LineNumber = event.contentChanges[0].range.end.line;
		await PutTailSemicolon(event.document,LineNumber);						
		await lineProcess(LineNumber,event.document);
		const WSEdit = new vscode.WorkspaceEdit;
		const NewColumn = event.document.lineAt(LineNumber + 1).text.length;
		const NewPosition = new vscode.Position(LineNumber + 1,NewColumn);
		if (IsALVarDeclarationLine(event.document.lineAt(LineNumber).text))
		{
			if (IsReturnKey)
			{
			WSEdit.insert(event.document.uri,NewPosition,TextWritevar);		
			await vscode.workspace.applyEdit(WSEdit);
			}
		}
}
function CatchDocumentChanges()
{
    WriteVarHeader();  
	subscriptionOnDidChange = vscode.workspace.onDidChangeTextDocument(HandleDocumentChanges);
}
function CatchDocumentChangesSnp()
{
    WriteVarHeader();  
	subscriptionOnDidChangeSnp = vscode.workspace.onDidChangeTextDocument(HandleDocumentChanges);
}
function StopCatchDocumentChanges()
{
    subscriptionOnDidChange.dispose();
}
function StopCatchDocumentChangesSnp()
{
    subscriptionOnDidChangeSnp.dispose();
}
async function WriteVarHeader()
{
	var currEditor = vscode.window.activeTextEditor;
	var selection = currEditor.selection;
	const startLine = selection.start.line;
	let CurrDoc = currEditor.document;
	if (CurrDoc.lineAt(startLine).text.search(/[^\s]/) >= 0)
	{
		return;
	}
	const WSEdit = new vscode.WorkspaceEdit;
	const NewColumn = CurrDoc.lineAt(startLine).text.length;
	const NewPosition = new vscode.Position(startLine,NewColumn);
	WSEdit.insert(CurrDoc.uri,NewPosition,'var');
	await vscode.workspace.applyEdit(WSEdit);
}
async function PutTailSemicolon(document,LineNumber)
{
	const LineText = document.lineAt(LineNumber).text;	
	const LineTextWithColon = getConvertedString(LineText) + ';';	
	if (LineText.search(GetRegExpVarDeclaration(false)) >= 0)
	{
		return;
	}
	if (LineTextWithColon.search(GetRegExpVarDeclaration(false)) < 0)
	{
		return;
	}
	const WSEdit = new vscode.WorkspaceEdit;	
	const NewPosition = new vscode.Position(LineNumber,LineText.length);
	WSEdit.insert(document.uri,NewPosition,';');
	await vscode.workspace.applyEdit(WSEdit);
}
function IsALVarDeclarationLine(PrevLineText='')
{
	const IsVarLine = (PrevLineText.toLowerCase().trim() == 'var');
	const IsDecLine = (PrevLineText.search(GetRegExpVarDeclaration(false)) >= 0)
	return (IsVarLine || IsDecLine);
}
/* function SnippetVariableAL()
{
	const commandName = 'talVarNaming';
	const commandCompletion = new vscode.CompletionItem(commandName);
	commandCompletion.kind = vscode.CompletionItemKind.Snippet;
    commandCompletion.filterText = commandName;
    commandCompletion.label = commandName;	
	commandCompletion.insertText = TextWritevar;
	commandCompletion.command = { command: 'JALVarNaming.CatchDocumentChangesSnp', title: 'Begin variable declaration' };
	commandCompletion.detail = 'Write type and subtype of the variable and when write semicolon will be renamed';
	commandCompletion.documentation = 'Write type and subtype of the variable and when write semicolon will be renamed'; 
	SnippetTrigered = true;
	return [commandCompletion];
}
 */
function SnippetVariableALArg(commandName,detail,insertText,documentation)
{
	const commandCompletion = new vscode.CompletionItem(commandName);
	commandCompletion.kind = vscode.CompletionItemKind.Variable;
	commandCompletion.filterText = commandName;
	commandCompletion.label = commandName;	
	commandCompletion.insertText = insertText;
	commandCompletion.command = { command: 'JALVarNaming.CatchDocumentChangesSnp', title: 'Begin variable declaration' };
	commandCompletion.detail = detail;
	commandCompletion.documentation = documentation; 
	SnippetTrigered = true;
	return [commandCompletion];
}

function getConvertedString(inputString='') {
	let outputString = replaceConfigChars(inputString);
	outputString = getStringWithCapsInWordStart(outputString);
	return outputString;
}
function replaceConfigChars(inputString='') {
	let outputString = inputString;
	const CharsFrom = GetConfigValue('CharsFrom');
	const CharsTo = GetConfigValue('CharsTo');
	if (CharsFrom.length == 0)
	{
		return outputString;	
	}
	if (CharsFrom.length !== CharsTo.length)
	{
		return outputString;
	}
	for (let index = 0; index < CharsFrom.length - 1; index++) {
		const charFrom = CharsFrom[index];
		const charTo = CharsTo[index];
		outputString  = outputString.replace(charFrom,charTo);
	}
	return outputString;
}
function getStringWithCapsInWordStart(inputString='')
{
	const regExpLowerStart = /([\s|"][a-z])/g;
	let outputString = inputString.replace(regExpLowerStart,convertMatchToUpper);
	return outputString;
}
function convertMatchToUpper(str,p1)
{
	return p1.toUpperCase();
}
function GetConfigValue(keyName='')
{
    const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) 
	{
		return ExtConf.get(keyName);
    }
	return '';
}
function isSubscriptionProcedure(lineNumber=0,CurrDoc)
{
	for (let i = lineNumber; i > 0; i--) {
		const line = CurrDoc.lineAt(i - 1);
		if (line.text !== '')
		{
			return line.text.search('EventSubscriber') !== -1;
		}
	}
	return false;
}