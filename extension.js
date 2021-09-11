// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposableSelection = vscode.commands.registerCommand('JALVarNaming.AlVarNameSel', function () {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//changeSelection2();
		const rename = require('./src/RenameVars.js');
		rename.changeSelection();
	});
	context.subscriptions.push(disposableSelection);

	let disposableAll = vscode.commands.registerCommand('JALVarNaming.AlVarNameAll', function () {
		//Test v1:Record  "S H";
		vscode.window.showInputBox({
			placeHolder: "Are you sure to rename all variables of documents (Y/N)?"
		}).then(value => {
			if (value.match(/Y/i)) {
				const rename = require('./src/RenameVars.js');
				rename.changeAll();
			}
		});
	});
	context.subscriptions.push(disposableAll);

	let disposableCatchDocumentChanges = vscode.commands.registerCommand('JALVarNaming.CatchDocumentChanges', function () {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//changeSelection2();
		const rename = require('./src/RenameVars.js');
		rename.CatchDocumentChanges();
	});
	context.subscriptions.push(disposableCatchDocumentChanges);

	let disposableCatchDocumentChangesSnp = vscode.commands.registerCommand('JALVarNaming.CatchDocumentChangesSnp', function () {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//changeSelection2();
		const rename = require('./src/RenameVars.js');
		rename.CatchDocumentChangesSnp();
	});
	context.subscriptions.push(disposableCatchDocumentChangesSnp);

	let disposableStopCatchDocumentChanges = vscode.commands.registerCommand('JALVarNaming.StopCatchDocumentChanges', function () {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//changeSelection2();
		const rename = require('./src/RenameVars.js');
		rename.StopCatchDocumentChanges();
	});
	context.subscriptions.push(disposableStopCatchDocumentChanges);

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
		{ language: 'al', scheme: 'file' },

		{
			// eslint-disable-next-line no-unused-vars
			provideCompletionItems(document, position) {
				const rename = require('./src/RenameVars.js');
				return rename.SnippetVariableAL();

			}
		},
		'talVarNaming' // trigger
	));
}
// @ts-ignore
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	// @ts-ignore
	activate,
	deactivate
}
