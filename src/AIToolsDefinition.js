const vscode = require('vscode');
/**
 * @typedef {Object} LanguageModelToolInvokeOptions
 * @property {any} input
 */

/**
 * @typedef {Object} PreparedToolInvocation
 * @property {string} invocationMessage
 * @property {Object} confirmationMessages
 * @property {string} confirmationMessages.title
 * @property {any} confirmationMessages.message
 */

class getALRecordFields {
    /**
     * @param {LanguageModelToolInvokeOptions} options
     * @param {any} _token
     */
    async invoke(options, _token) {
        const params = options.input;
        let ToolResult = [];
        ToolResult.push(new vscode.LanguageModelTextPart(await getRedcordFields(params.record)));
        return new vscode.LanguageModelToolResult(ToolResult);
    }
    /**
     * @param {LanguageModelToolInvokeOptions} _options
     * @param {any} _token
     * @returns {Promise<PreparedToolInvocation>}
     */
    async prepareInvocation(_options, _token) {
        return {
            invocationMessage: 'Access to JAM get AL Record Fields',
            confirmationMessages: {
                title: 'JAM get AL Record Fields',
                message: new vscode.MarkdownString('Do you want to access to JAM get AL Record Fields?')
            }
        };
    }
}
/**
 * @param {any} context
 */
function registerGetALRecordFields(context) {
    context.subscriptions.push(
        (vscode.lm).registerTool('jam-getALRecordFields', new getALRecordFields())
    );
}

class getALObjectDefinition {
    /**
     * @param {LanguageModelToolInvokeOptions} options
     * @param {any} _token
     */
    async invoke(options, _token) {
        const params = options.input;
        let ToolResult = [];
        const objectName = String(params.objectName || '');
        const objectType = String(params.objectType || '');
        const objectID = Number(params.objectID) || 0;
        ToolResult.push(new vscode.LanguageModelTextPart(await GetALDefinition(objectName, objectType, objectID) || ''));
        return new vscode.LanguageModelToolResult(ToolResult);
    }
    /**
     * @param {LanguageModelToolInvokeOptions} _options
     * @param {any} _token
     * @returns {Promise<PreparedToolInvocation>}
     */
    async prepareInvocation(_options, _token) {
        return {
            invocationMessage: 'Access to JAM get AL Object Definition',
            confirmationMessages: {
                title: 'JAM get AL Object definition',
                message: new vscode.MarkdownString('Do you want to access to JAM get AL Object Definition?')
            }
        };
    }
}
/**
 * @param {any} context
 */
function registerGetALObjectDefinition(context) {
    context.subscriptions.push(
        (vscode.lm).registerTool('jam-getALObjectDefinition', new getALObjectDefinition())
    );
}
class OpenALObjectInEditor {
    /**
     * @param {LanguageModelToolInvokeOptions} options
     * @param {any} _token
     */ // This tool is intended to open the AL object in the editor, so it does not return any content to the language model, but it performs an action in VS Code.
     async invoke(options, _token) {
        const params = options.input;
        let ToolResult = [];
        const objectName = String(params.objectName || '');
        const objectType = String(params.objectType || '');
        const objectID = Number(params.objectID) || 0;
        let returnMessage = await OpenALObjectEditor(objectName, objectType, objectID);
        if (!returnMessage) {
            returnMessage = 'Ok';
    }
        ToolResult.push(new vscode.LanguageModelTextPart(returnMessage));
        return new vscode.LanguageModelToolResult(ToolResult);
    }
    /**
     * @param {LanguageModelToolInvokeOptions} _options
     * @param {any} _token
     * @returns {Promise<PreparedToolInvocation>}
     */
    async prepareInvocation(_options, _token) {
        return {
            invocationMessage: 'Access to JAM Open AL Object in Editor',
            confirmationMessages: {
                title: 'JAM Open AL Object in Editor',
                message: new vscode.MarkdownString('Do you want to access to JAM Open AL Object in Editor?')
            }
        };
    }
}     
/**
 * @param {any} context
 */
function registerOpenALObjectInEditor(context) {
    context.subscriptions.push(
        (vscode.lm).registerTool('jam-OpenALObjectInEditor', new OpenALObjectInEditor())
    );
}

/**
 * @param {string} recordName
 * @returns {Promise<string>}
 */
async function getRedcordFields(recordName) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return '';
    }
    const document = editor.document;
    recordName = recordName.replace(':','');    
    let RecordDecIndex = document.getText().indexOf(recordName+':');
    let RecordDecposition = document.positionAt(RecordDecIndex);
    const lineNumber = RecordDecposition.line;
    const columnNumber = RecordDecposition.character;
    return await getRedcordFieldsFromPosition(document, lineNumber, columnNumber);
}

/**
 * @param {any} document
 * @param {number} lineNumber
 * @param {number} columnNumber
 * @returns {Promise<string>}
 */
async function getRedcordFieldsFromPosition(document, lineNumber, columnNumber) {
    try {
        const siganturaFunction = await vscode.commands.executeCommand('vscode.executeHoverProvider', document.uri, new vscode.Position(lineNumber, columnNumber));
        if (!siganturaFunction || !Array.isArray(siganturaFunction) || siganturaFunction.length === 0) {
            return 'No hover information available for the record field.';
        }
        const hover = siganturaFunction[0];
        if (!hover.contents || !Array.isArray(hover.contents) || hover.contents.length === 0) {
            return 'No content found in hover information.';
        }
        const content = hover.contents[0];
        const AllDefinition = typeof content === 'object' && 'value' in content ? content.value : String(content);
        return AllDefinition;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        return `Error retrieving record fields at line ${lineNumber}, column ${columnNumber}: ${errorMsg}`;
    }
}

/**
 * @param {string} ALObjectName
 * @param {string} ALObjectType
 * @param {number} ALObjectID
 * @returns {Promise<string|undefined>}
 */
async function GetALDefinition(ALObjectName, ALObjectType, ALObjectID = 0) {
    if (!ALObjectName || !ALObjectType) {
        vscode.window.showErrorMessage('AL Object Name and Type are required to get the definition.');
        return undefined;
    }

    // Example call: GetALDefinition('Sales Line', ALObjectType.TABLE, 37)
    // This would generate a path like 'Table/37/Sales Line.dal'
    let locationUri = makeLocationUri(ALObjectID, ALObjectType, ALObjectName);
    //uri: URI(al-preview://allang/WarehouseAssistant/Table/337/Reservation%20Entry.dal)    
    try {
        let doc = await vscode.workspace.openTextDocument(locationUri);
        return doc.getText();
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorMessage = `Failed to get AL definition for ${ALObjectType} ${ALObjectName} (ID: ${ALObjectID}). Error: ${errorMsg}`;        
        return errorMessage;
    }
}
/**
 * @param {number} ALObjectID
 * @param {string} ALObjectType
 * @param {string} ALObjectName
 * @returns {vscode.Uri}
 */
function makeLocationUri(ALObjectID, ALObjectType, ALObjectName) {
    let objectPath;
    if (ALObjectID > 0) {
        objectPath = `${ALObjectType}/${ALObjectID}/${ALObjectName}.dal`;
    } else {
        // If no ID, we might need to find it. For now, we'll assume it's not strictly needed for all cases
        // or that the name is unique enough. This might not work with the al-preview URI scheme for standard objects.
        objectPath = `${ALObjectType}/${ALObjectName}.dal`;
        //vscode.window.showWarningMessage(`Getting AL definition for ${ALObjectName} without an ID. This might not work correctly.`);
    }
    let locationUri = vscode.Uri.parse('al-preview://allang/' + vscode.workspace.name + '/' + objectPath);
    return locationUri;
}

/**
 * @param {string} ALObjectName
 * @param {string} ALObjectType
 * @param {number} ALObjectID
 * @returns {Promise<string|undefined>}
 */
async function OpenALObjectEditor(ALObjectName, ALObjectType, ALObjectID = 0) {
    if (!ALObjectName || !ALObjectType) {
        vscode.window.showErrorMessage('AL Object Name and Type are required to get the definition.');
        return undefined;
    }

    // Example call: GetALDefinition('Sales Line', ALObjectType.TABLE, 37)
    // This would generate a path like 'Table/37/Sales Line.dal'
    let locationUri = makeLocationUri(ALObjectID, ALObjectType, ALObjectName);
    //uri: URI(al-preview://allang/WarehouseAssistant/Table/337/Reservation%20Entry.dal)    
    try {
        let doc = await vscode.workspace.openTextDocument(locationUri);
        await vscode.window.showTextDocument(doc);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorMessage = `Failed to get AL definition for ${ALObjectType} ${ALObjectName} (ID: ${ALObjectID}). Error: ${errorMsg}`;        
        return errorMessage;
    }
}

module.exports = {
    registerGetALObjectDefinition,
    registerGetALRecordFields,
    registerOpenALObjectInEditor,

/**
 * @param {string} ALObjectName
 * @param {string} ALObjectType
 * @param {number} ALObjectID
 * @returns {Promise<string|undefined>}
 */    GetALDefinition: async function(ALObjectName, ALObjectType, ALObjectID = 0) {
        return await GetALDefinition(ALObjectName, ALObjectType, ALObjectID);
    }
}