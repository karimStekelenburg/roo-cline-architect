import * as vscode from 'vscode';
import { DocumentType } from './types/documents';
import { PanelManager } from './ui/panels/PanelManager';
import { DocumentManager } from './services/DocumentManager';

/**
 * Activates the extension
 */
export function activate(context: vscode.ExtensionContext) {
  // Initialize managers
  const panelManager = PanelManager.getInstance();
  const documentManager = DocumentManager.getInstance(context);
  console.log('Roo-Cline Architect extension is now active');

  // Register commands for document creation
  const createInceptionDoc = vscode.commands.registerCommand(
    'roo-cline-architect.createInceptionDocument',
    async () => {
      try {
        const title = await vscode.window.showInputBox({
          prompt: 'Enter document title',
          placeHolder: 'e.g., Project Inception Document',
          validateInput: (value) => {
            return value.trim() ? null : 'Title is required';
          }
        });

        if (!title) {
          return;
        }

        const document = await documentManager.createDocument(DocumentType.Inception, title);
        vscode.window.showInformationMessage(`Created inception document: ${title}`);
        panelManager.showEditorPanels(); // Show the document in the editor
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
          placeHolder: 'e.g., Functional Design Specification',
          validateInput: (value) => {
            return value.trim() ? null : 'Title is required';
          }
        });

        if (!title) {
          return;
        }

        const document = await documentManager.createDocument(DocumentType.Functional, title);
        vscode.window.showInformationMessage(`Created functional document: ${title}`);
        panelManager.showEditorPanels(); // Show the document in the editor
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
          placeHolder: 'e.g., Technical Design Specification',
          validateInput: (value) => {
            return value.trim() ? null : 'Title is required';
          }
        });

        if (!title) {
          return;
        }

        const document = await documentManager.createDocument(DocumentType.Technical, title);
        vscode.window.showInformationMessage(`Created technical document: ${title}`);
        panelManager.showEditorPanels(); // Show the document in the editor
      } catch (error) {
        vscode.window.showErrorMessage(`Error creating document: ${error}`);
      }
    }
  );

  // Register commands for extension features
  const openDocumentExplorer = vscode.commands.registerCommand(
    'roo-cline-architect.openDocumentExplorer',
    () => {
      try {
        panelManager.showEditorPanels();
      } catch (error) {
        vscode.window.showErrorMessage(`Error opening document explorer: ${error}`);
      }
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

  // Add panel cleanup to subscriptions
  context.subscriptions.push({
    dispose: () => {
      panelManager.disposeAllPanels();
    }
  });
}

/**
 * Deactivates the extension
 */
export function deactivate() {
  // Clean up panels
  PanelManager.getInstance().disposeAllPanels();
  console.log('Roo-Cline Architect extension is now deactivated');
}