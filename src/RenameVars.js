const vscode = require('vscode');
const TextWritevar = 'WriteTypeAndSubtype: ';
let SnippetTrigered = false;
var subscriptionOnDidChange = vscode.workspace.onDidChangeTextDocument(HandleDocumentChanges);
subscriptionOnDidChange.dispose();
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
	StopCatchDocumentChanges: function()
	{
		StopCatchDocumentChanges();
	},
	SnippetVariableAL: function()
	{
		return(SnippetVariableAL());
	}
}
async function lineProcess(i, CurrDoc) {
	var line = CurrDoc.lineAt(i);
	await ALVariableNaming(i, line.text);
}
async function ALVariableNaming(lineNumber = 0, original) {
	var varDecMatches = original.match(GetRegExpVarDeclaration(true));
	if (!varDecMatches) { return };
	for (var i = 0; i < Object.keys(varDecMatches).length; i++) {
		var element = varDecMatches[i];
		original = await MatchProcess(element, original, lineNumber);
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
	var NewVarName = VarSubtype.replace(/temporary|[^a-zA-Z0-9]/gi, '');
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
	const G4VarType = new RegExp(/(Record|Page|TestPage|Report|Codeunit|Query|XmlPort)/.source);
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
    const ExtConf = vscode.workspace.getConfiguration('');
    var AppPrefix = '';
	if (ExtConf) {
		AppPrefix = ExtConf.get('AppPrefix');
    }
    if ((!AppPrefix) || (AppPrefix == ''))
    {
        vscode.window.showErrorMessage("You must specify a value for AppPrefix in extension settings");
    }
    return(AppPrefix);    
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
			StopCatchDocumentChanges();
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
function StopCatchDocumentChanges()
{
    subscriptionOnDidChange.dispose();
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
	const LineTextWithColon = LineText + ';';	
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
function SnippetVariableAL()
{
	const commandCompletion = new vscode.CompletionItem('TvarJAL');
	//commandCompletion.kind = vscode.CompletionItemKind.Keyword;
    commandCompletion.filterText = "TvarJAL";
    commandCompletion.label = "TvarJAL";	
	commandCompletion.insertText = TextWritevar;
	commandCompletion.command = { command: 'JALVarNaming.CatchDocumentChanges', title: 'Begin variable declaration' };
	SnippetTrigered = true;
	return [commandCompletion];
}