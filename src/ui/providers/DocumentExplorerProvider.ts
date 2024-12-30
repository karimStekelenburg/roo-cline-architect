import * as vscode from 'vscode';
import { DocumentManager } from '../../services/DocumentManager';
import { BaseDocument, DocumentStatus, DocumentType } from '../../types/documents';

/**
 * Provides the webview content for the document explorer panel
 */
export class DocumentExplorerProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'rooClieneArchitect.documentExplorer';

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly documentManager: DocumentManager
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getHtmlContent();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message: { command: string; documentId?: string; documentType?: DocumentType }) => {
      switch (message.command) {
        case 'getDocuments':
          const documents = this.documentManager.getAllDocuments();
          await webviewView.webview.postMessage({
            command: 'updateDocuments',
            documents
          });
          break;

        case 'openDocument':
          if (message.documentId) {
            // TODO: Implement document opening in Sprint 2
            vscode.window.showInformationMessage(`Opening document: ${message.documentId}`);
          }
          break;

        case 'createDocument':
          if (message.documentType) {
            const title = await vscode.window.showInputBox({
              prompt: 'Enter document title',
              placeHolder: 'e.g., New Document',
              validateInput: (value: string) => {
                return value.trim() ? null : 'Title is required';
              }
            });
            
            if (title) {
              await this.documentManager.createDocument(message.documentType, title);
              const updatedDocs = this.documentManager.getAllDocuments();
              await webviewView.webview.postMessage({
                command: 'updateDocuments',
                documents: updatedDocs
              });
            }
          }
          break;
      }
    });
  }

  private getHtmlContent(): string {
    const documents = this.documentManager.getAllDocuments();
    
    return `<!DOCTYPE html>
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
        .document-group {
          margin-bottom: 20px;
        }
        .document-group-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: var(--vscode-editor-foreground);
        }
        .document-item {
          display: flex;
          align-items: center;
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 4px;
        }
        .document-item:hover {
          background-color: var(--vscode-list-hoverBackground);
        }
        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          flex-shrink: 0;
        }
        .status-approved {
          background-color: var(--vscode-testing-iconPassed);
        }
        .status-in-review {
          background-color: var(--vscode-notificationsInfoIcon-foreground);
        }
        .status-draft {
          background-color: var(--vscode-disabledForeground);
        }
        .status-rejected {
          background-color: var(--vscode-testing-iconFailed);
        }
        .toolbar {
          margin-bottom: 15px;
          display: flex;
          gap: 8px;
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
          <button onclick="createDocument('inception')">New Inception</button>
          <button onclick="createDocument('functional')">New Functional</button>
          <button onclick="createDocument('technical')">New Technical</button>
        </div>
        <div id="documentList">
          ${this.generateDocumentListHtml(documents)}
        </div>
      </div>
      <script>
        const vscode = acquireVsCodeApi();

        // Request initial documents
        vscode.postMessage({ command: 'getDocuments' });

        // Handle messages from the extension
        window.addEventListener('message', event => {
          const message = event.data;
          switch (message.command) {
            case 'updateDocuments':
              document.getElementById('documentList').innerHTML = 
                generateDocumentListHtml(message.documents);
              break;
          }
        });

        function createDocument(type) {
          vscode.postMessage({
            command: 'createDocument',
            documentType: type
          });
        }

        function openDocument(id) {
          vscode.postMessage({
            command: 'openDocument',
            documentId: id
          });
        }

        function getStatusClass(status) {
          const statusMap = {
            approved: 'status-approved',
            in_review: 'status-in-review',
            draft: 'status-draft',
            rejected: 'status-rejected'
          };
          return statusMap[status] || 'status-draft';
        }

        function generateDocumentListHtml(documents) {
          const groupedDocs = documents.reduce((acc, doc) => {
            if (!acc[doc.type]) {
              acc[doc.type] = [];
            }
            acc[doc.type].push(doc);
            return acc;
          }, {});

          return Object.entries(groupedDocs)
            .map(([type, docs]) => {
              const title = type.charAt(0).toUpperCase() + type.slice(1);
              return \`
                <div class="document-group">
                  <div class="document-group-title">\${title} Documents</div>
                  <div class="document-list">
                    \${docs.map(doc => \`
                      <div class="document-item" onclick="openDocument('\${doc.id}')">
                        <span class="status-indicator \${getStatusClass(doc.status)}"></span>
                        \${doc.title}
                      </div>
                    \`).join('')}
                  </div>
                </div>
              \`;
            })
            .join('');
        }
      </script>
    </body>
    </html>`;
  }

  private generateDocumentListHtml(documents: BaseDocument[]): string {
    const groupedDocs = documents.reduce<Record<DocumentType, BaseDocument[]>>((acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    }, {
      [DocumentType.Inception]: [],
      [DocumentType.Functional]: [],
      [DocumentType.Technical]: []
    });

    return Object.entries(groupedDocs)
      .map(([type, docs]) => {
        const title = type.charAt(0).toUpperCase() + type.slice(1);
        const items = docs
          .map(doc => {
            const statusClass = doc.status.toLowerCase().replace('_', '-');
            return `
              <div class="document-item" onclick="openDocument('${doc.id}')">
                <span class="status-indicator status-${statusClass}"></span>
                ${doc.title}
              </div>
            `;
          })
          .join('');

        return `
          <div class="document-group">
            <div class="document-group-title">${title} Documents</div>
            <div class="document-list">
              ${items}
            </div>
          </div>
        `;
      })
      .join('');
  }
}