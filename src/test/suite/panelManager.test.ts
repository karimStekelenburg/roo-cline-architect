import * as assert from 'assert';
import * as vscode from 'vscode';
import { PanelManager } from '../../ui/panels/PanelManager';

suite('PanelManager Test Suite', () => {
  test('getInstance returns singleton instance', () => {
    const instance1 = PanelManager.getInstance();
    const instance2 = PanelManager.getInstance();
    assert.strictEqual(instance1, instance2);
  });

  test('showDocumentExplorer creates panel', async () => {
    const panelManager = PanelManager.getInstance();
    
    // Mock the WebviewPanel
    let panelCreated = false;
    const originalCreateWebviewPanel = vscode.window.createWebviewPanel;
    
    vscode.window.createWebviewPanel = (viewType: string, title: string, showOptions: vscode.ViewColumn | { viewColumn: vscode.ViewColumn; preserveFocus?: boolean }, options?: vscode.WebviewPanelOptions & vscode.WebviewOptions): vscode.WebviewPanel => {
      panelCreated = true;
      assert.strictEqual(viewType, 'rooClieneArchitect.documentExplorer');
      assert.strictEqual(title, 'Document Explorer');
      assert.strictEqual(typeof showOptions === 'number' ? showOptions : showOptions.viewColumn, vscode.ViewColumn.One);
      
      const panel: vscode.WebviewPanel = {
        viewType,
        webview: {
          html: '',
          onDidReceiveMessage: () => ({ dispose: () => {} }),
          postMessage: async () => true,
          asWebviewUri: (uri: vscode.Uri) => uri,
          cspSource: '',
          options: options || {}
        },
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeViewState: () => ({ dispose: () => {} }),
        reveal: () => {},
        dispose: () => {},
        visible: true,
        active: true,
        viewColumn: vscode.ViewColumn.One,
        options: options || {},
        title: 'Document Explorer'
      };
      return panel;
    };

    try {
      panelManager.showDocumentExplorer();
      assert.strictEqual(panelCreated, true);
    } finally {
      vscode.window.createWebviewPanel = originalCreateWebviewPanel;
    }
  });

  test('showAllPanels creates all three panels', async () => {
    const panelManager = PanelManager.getInstance();
    
    // Track panel creation
    const createdPanels: string[] = [];
    const originalCreateWebviewPanel = vscode.window.createWebviewPanel;
    
    vscode.window.createWebviewPanel = (viewType: string, title: string, showOptions: vscode.ViewColumn | { viewColumn: vscode.ViewColumn; preserveFocus?: boolean }, options?: vscode.WebviewPanelOptions & vscode.WebviewOptions): vscode.WebviewPanel => {
      createdPanels.push(viewType);
      
      const panel: vscode.WebviewPanel = {
        viewType,
        webview: {
          html: '',
          onDidReceiveMessage: () => ({ dispose: () => {} }),
          postMessage: async () => true,
          asWebviewUri: (uri: vscode.Uri) => uri,
          cspSource: '',
          options: options || {}
        },
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeViewState: () => ({ dispose: () => {} }),
        reveal: () => {},
        dispose: () => {},
        visible: true,
        active: true,
        viewColumn: typeof showOptions === 'number' ? showOptions : showOptions.viewColumn,
        options: options || {},
        title
      };
      return panel;
    };

    try {
      panelManager.showAllPanels();
      assert.strictEqual(createdPanels.length, 3);
      assert.ok(createdPanels.includes('rooClieneArchitect.documentExplorer'));
      assert.ok(createdPanels.includes('rooClieneArchitect.mainEditor'));
      assert.ok(createdPanels.includes('rooClieneArchitect.preview'));
    } finally {
      vscode.window.createWebviewPanel = originalCreateWebviewPanel;
    }
  });

  test('disposeAllPanels disposes all panels', async () => {
    const panelManager = PanelManager.getInstance();
    let disposeCalled = 0;
    
    const originalCreateWebviewPanel = vscode.window.createWebviewPanel;
    vscode.window.createWebviewPanel = (viewType: string, title: string, showOptions: vscode.ViewColumn | { viewColumn: vscode.ViewColumn; preserveFocus?: boolean }, options?: vscode.WebviewPanelOptions & vscode.WebviewOptions): vscode.WebviewPanel => {
      const panel: vscode.WebviewPanel = {
        viewType,
        webview: {
          html: '',
          onDidReceiveMessage: () => ({ dispose: () => {} }),
          postMessage: async () => true,
          asWebviewUri: (uri: vscode.Uri) => uri,
          cspSource: '',
          options: options || {}
        },
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeViewState: () => ({ dispose: () => {} }),
        reveal: () => {},
        dispose: () => { disposeCalled++; },
        visible: true,
        active: true,
        viewColumn: typeof showOptions === 'number' ? showOptions : showOptions.viewColumn,
        options: options || {},
        title: title
      };
      return panel;
    };

    try {
      panelManager.showAllPanels();
      panelManager.disposeAllPanels();
      assert.strictEqual(disposeCalled, 3);
    } finally {
      vscode.window.createWebviewPanel = originalCreateWebviewPanel;
    }
  });
});