import * as vscode from 'vscode';
import { DocumentType } from './types/documents';

/**
 * Activates the extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Roo-Cline Architect extension is now active');

  // Register commands for document creation
  const createInceptionDoc = vscode.commands.registerCommand(
    'roo-cline-architect.createInceptionDocument',
    async () => {
      try {
        const title = await vscode.window.showInputBox({
          prompt: 'Enter document title',
          placeHolder: 'e.g., Project Inception Document'
        });

        if (!title) {
          return;
        }

        // TODO: Implement document creation logic in Sprint 2
        vscode.window.showInformationMessage(`Creating inception document: ${title}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Error creating document: ${error}`);
      }
    }
  );

  const createFunctionalDoc = vscode.commands.registerCommand(
    'roo-cline-architect.createFunctionalDocument',
    async () => {
      try {
        const title = await vscode.window.showInputBox({
          prompt: 'Enter document title',
          placeHolder: 'e.g., Functional Design Specification'
        });

        if (!title) {
          return;
        }

        // TODO: Implement document creation logic in Sprint 2
        vscode.window.showInformationMessage(`Creating functional document: ${title}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Error creating document: ${error}`);
      }
    }
  );

  const createTechnicalDoc = vscode.commands.registerCommand(
    'roo-cline-architect.createTechnicalDocument',
    async () => {
      try {
        const title = await vscode.window.showInputBox({
          prompt: 'Enter document title',
          placeHolder: 'e.g., Technical Design Specification'
        });

        if (!title) {
          return;
        }

        // TODO: Implement document creation logic in Sprint 2
        vscode.window.showInformationMessage(`Creating technical document: ${title}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Error creating document: ${error}`);
      }
    }
  );

  // Register commands for extension features
  const openDocumentExplorer = vscode.commands.registerCommand(
    'roo-cline-architect.openDocumentExplorer',
    () => {
      // TODO: Implement document explorer in Sprint 2
      vscode.window.showInformationMessage('Opening document explorer');
    }
  );

  const openContextLibrary = vscode.commands.registerCommand(
    'roo-cline-architect.openContextLibrary',
    () => {
      // TODO: Implement context library in Sprint 3
      vscode.window.showInformationMessage('Opening context library');
    }
  );

  // Add commands to subscriptions
  context.subscriptions.push(
    createInceptionDoc,
    createFunctionalDoc,
    createTechnicalDoc,
    openDocumentExplorer,
    openContextLibrary
  );
}

/**
 * Deactivates the extension
 */
export function deactivate() {
  console.log('Roo-Cline Architect extension is now deactivated');
}