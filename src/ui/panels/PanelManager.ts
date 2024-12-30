import * as vscode from 'vscode';

/**
 * Manages the creation and lifecycle of extension panels
 */
export class PanelManager {
  private static instance: PanelManager;
  private documentExplorerPanel: vscode.WebviewPanel | undefined;
  private mainEditorPanel: vscode.WebviewPanel | undefined;
  private previewPanel: vscode.WebviewPanel | undefined;

  private constructor() {}

  public static getInstance(): PanelManager {
    if (!PanelManager.instance) {
      PanelManager.instance = new PanelManager();
    }
    return PanelManager.instance;
  }

  /**
   * Creates and shows the document explorer panel
   */
  public showDocumentExplorer() {
    if (this.documentExplorerPanel) {
      this.documentExplorerPanel.reveal();
      return;
    }

    this.documentExplorerPanel = vscode.window.createWebviewPanel(
      'rooClieneArchitect.documentExplorer',
      'Document Explorer',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    this.documentExplorerPanel.webview.html = this.getDocumentExplorerHtml();

    this.documentExplorerPanel.onDidDispose(
      () => {
        this.documentExplorerPanel = undefined;
      },
      null
    );
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
   * Shows all panels in their respective columns
   */
  public showAllPanels() {
    this.showDocumentExplorer();
    this.showMainEditor();
    this.showPreview();
  }

  /**
   * Disposes all panels
   */
  public disposeAllPanels() {
    if (this.documentExplorerPanel) {
      this.documentExplorerPanel.dispose();
    }
    if (this.mainEditorPanel) {
      this.mainEditorPanel.dispose();
    }
    if (this.previewPanel) {
      this.previewPanel.dispose();
    }
  }

  private getDocumentExplorerHtml() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document Explorer</title>
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
          .document-list {
            list-style: none;
            padding: 0;
          }
          .document-item {
            display: flex;
            align-items: center;
            padding: 8px;
            cursor: pointer;
            border-radius: 4px;
          }
          .document-item:hover {
            background-color: var(--vscode-list-hoverBackground);
          }
          .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
          }
          .status-approved {
            background-color: var(--vscode-testing-iconPassed);
          }
          .status-in-progress {
            background-color: var(--vscode-notificationsInfoIcon-foreground);
          }
          .status-pending {
            background-color: var(--vscode-disabledForeground);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Documents</h2>
          <ul class="document-list">
            <li class="document-item">
              <span class="status-indicator status-approved"></span>
              Project Overview
            </li>
            <li class="document-item">
              <span class="status-indicator status-in-progress"></span>
              Technical Design
            </li>
            <li class="document-item">
              <span class="status-indicator status-pending"></span>
              Implementation Plan
            </li>
          </ul>
        </div>
      </body>
      </html>
    `;
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