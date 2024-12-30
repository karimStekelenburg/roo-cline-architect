import * as vscode from 'vscode';
import { DocumentManager } from '../../services/DocumentManager';
import { DocumentExplorerProvider } from '../providers/DocumentExplorerProvider';

/**
 * Manages the creation and lifecycle of extension panels
 */
export class PanelManager {
  private static instance: PanelManager | undefined;

  // For testing purposes
  public static resetInstance(): void {
    PanelManager.instance = undefined;
  }
  private documentExplorerProvider: DocumentExplorerProvider;
  private mainEditorPanel: vscode.WebviewPanel | undefined;
  private previewPanel: vscode.WebviewPanel | undefined;

  private constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly documentManager: DocumentManager
  ) {
    this.documentExplorerProvider = new DocumentExplorerProvider(
      context.extensionUri,
      documentManager
    );

    // Register the DocumentExplorerProvider
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        DocumentExplorerProvider.viewType,
        this.documentExplorerProvider
      )
    );
  }

  public static async getInstance(context: vscode.ExtensionContext): Promise<PanelManager> {
    if (!PanelManager.instance) {
      const documentManager = await DocumentManager.getInstance(context);
      PanelManager.instance = new PanelManager(context, documentManager);
    }
    return PanelManager.instance;
  }

  /**
   * Creates and shows the main editor panel
   */
  public showMainEditor() {
    if (this.mainEditorPanel) {
      this.mainEditorPanel.reveal();
      return;
    }

    this.mainEditorPanel = vscode.window.createWebviewPanel(
      'rooClieneArchitect.mainEditor',
      'Document Editor',
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    this.mainEditorPanel.webview.html = this.getMainEditorHtml();

    this.mainEditorPanel.onDidDispose(
      () => {
        this.mainEditorPanel = undefined;
      },
      null
    );
  }

  /**
   * Creates and shows the preview panel
   */
  public showPreview() {
    if (this.previewPanel) {
      this.previewPanel.reveal();
      return;
    }

    this.previewPanel = vscode.window.createWebviewPanel(
      'rooClieneArchitect.preview',
      'Document Preview',
      vscode.ViewColumn.Three,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    this.previewPanel.webview.html = this.getPreviewHtml();

    this.previewPanel.onDidDispose(
      () => {
        this.previewPanel = undefined;
      },
      null
    );
  }

  /**
   * Shows the editor and preview panels
   */
  public showEditorPanels() {
    this.showMainEditor();
    this.showPreview();
  }

  /**
   * Disposes all panels
   */
  public disposeAllPanels() {
    if (this.mainEditorPanel) {
      this.mainEditorPanel.dispose();
    }
    if (this.previewPanel) {
      this.previewPanel.dispose();
    }
  }

  private getMainEditorHtml() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document Editor</title>
        <style>
          body {
            padding: 0;
            margin: 0;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family);
          }
          .container {
            padding: 15px;
          }
          .editor {
            width: 100%;
            height: calc(100vh - 100px);
            resize: none;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            border: 1px solid var(--vscode-panel-border);
            padding: 10px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
          }
          .toolbar {
            margin-bottom: 15px;
            display: flex;
            gap: 10px;
          }
          button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 4px;
          }
          button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="toolbar">
            <button>Save</button>
            <button>Preview</button>
          </div>
          <textarea class="editor" placeholder="Start writing your document..."></textarea>
        </div>
      </body>
      </html>
    `;
  }

  private getPreviewHtml() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document Preview</title>
        <style>
          body {
            padding: 0;
            margin: 0;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family);
          }
          .container {
            padding: 15px;
          }
          .preview-content {
            padding: 10px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            min-height: calc(100vh - 100px);
          }
          h1, h2, h3 {
            color: var(--vscode-editor-foreground);
          }
          code {
            background-color: var(--vscode-textBlockQuote-background);
            padding: 2px 4px;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="preview-content">
            <h1>Document Title</h1>
            <p>Preview content will appear here...</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}