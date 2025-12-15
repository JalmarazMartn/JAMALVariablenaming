const vscode = require('vscode');
class getALRecordFields {
    async invoke(options, _token) {
        const params = options.input;
        let ToolResult = [];
        ToolResult.push(new vscode.LanguageModelTextPart(await getRedcordFields(params.record)));
        return new vscode.LanguageModelToolResult(ToolResult);
    }
    async prepareInvocation(options, _token) {
        return {
            invocationMessage: 'Access to JAM get AL Record Fields',
            confirmationMessages: {
                title: 'JAM get AL Record Fields',
                message: new vscode.MarkdownString('Do you want to access to JAM get AL Record Fields?')
            }
        };
    }
}
function registerGetALRecordFields(context) {
    context.subscriptions.push(
        vscode.lm.registerTool('jam-getALRecordFields', new getALRecordFields())
    );
}

module.exports = {
    registerRulesAndDiagnostics: registerGetALRecordFields
};
async function getRedcordFields(recordName) {
    let document = vscode.window.activeTextEditor.document;    
    recordName = recordName.replace(':','');    
    let RecordDecIndex = vscode.window.activeTextEditor.document.getText().indexOf(recordName+':');
    let RecordDecposition = document.positionAt(RecordDecIndex);
    const lineNumber = RecordDecposition.line;
    const columnNumber = RecordDecposition.character;
    return await getRedcordFieldsFromPosition(vscode.window.activeTextEditor.document, lineNumber, columnNumber);
}
async function getRedcordFieldsFromPosition(document, lineNumber, columnNumber) {

    const siganturaFunction = await vscode.commands.executeCommand('vscode.executeHoverProvider', document.uri, new vscode.Position(lineNumber, columnNumber));
    if (!siganturaFunction) {
        return '';
    }
    const AllDefinition = siganturaFunction[0].contents[0].value;
    return AllDefinition;
}
