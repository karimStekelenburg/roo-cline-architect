import * as assert from 'assert';
import * as vscode from 'vscode';
import { PanelManager } from '../../ui/panels/PanelManager';
import { DocumentManager } from '../../services/DocumentManager';

suite('PanelManager Test Suite', () => {
  let mockContext: vscode.ExtensionContext;
  let mockSubscriptions: { dispose: () => void }[];
  let mockWebviewViewProvider: any;

  setup(() => {
    mockSubscriptions = [];
    mockContext = {
      subscriptions: mockSubscriptions,
      extensionUri: vscode.Uri.file(__dirname),
      globalState: {
        get: (key: string) => ({}),
        update: async (key: string, value: any) => Promise.resolve()
      }
    } as any;

    // Mock registerWebviewViewProvider
    mockWebviewViewProvider = undefined;
    const originalRegisterWebviewViewProvider = vscode.window.registerWebviewViewProvider;
    vscode.window.registerWebviewViewProvider = (viewType: string, provider: vscode.WebviewViewProvider) => {
      mockWebviewViewProvider = provider;
      return { dispose: () => {} };
    };
  });

  teardown(() => {
    // Clean up any panels that were created
    PanelManager.getInstance(mockContext).disposeAllPanels();
  });

  test('getInstance returns singleton instance', () => {
    const instance1 = PanelManager.getInstance(mockContext);
    const instance2 = PanelManager.getInstance(mockContext);
    assert.strictEqual(instance1, instance2);
  });

  test('showEditorPanels creates editor and preview panels', () => {
    const panelManager = PanelManager.getInstance(mockContext);
    
    // Mock WebviewPanel creation
    let panelsCreated = 0;
    const originalCreateWebviewPanel = vscode.window.createWebviewPanel;
    
    vscode.window.createWebviewPanel = (viewType: string, title: string, showOptions: vscode.ViewColumn | { viewColumn: vscode.ViewColumn; preserveFocus?: boolean }, options?: vscode.WebviewPanelOptions & vscode.WebviewOptions): vscode.WebviewPanel => {
      panelsCreated++;
      return {
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
    };

    try {
      panelManager.showEditorPanels();
      assert.strictEqual(panelsCreated, 2); // Should create editor and preview panels
    } finally {
      vscode.window.createWebviewPanel = originalCreateWebviewPanel;
    }
  });

  test('disposeAllPanels disposes all panels', () => {
    const panelManager = PanelManager.getInstance(mockContext);
    let disposeCalled = 0;
    
    const originalCreateWebviewPanel = vscode.window.createWebviewPanel;
    vscode.window.createWebviewPanel = (): vscode.WebviewPanel => {
      return {
        viewType: 'test',
        webview: {
          html: '',
          onDidReceiveMessage: () => ({ dispose: () => {} }),
          postMessage: async () => true,
          asWebviewUri: (uri: vscode.Uri) => uri,
          cspSource: '',
          options: {}
        },
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeViewState: () => ({ dispose: () => {} }),
        reveal: () => {},
        dispose: () => { disposeCalled++; },
        visible: true,
        active: true,
        viewColumn: vscode.ViewColumn.One,
        options: {},
        title: 'Test Panel'
      };
    };

    try {
      panelManager.showEditorPanels();
      panelManager.disposeAllPanels();
      assert.strictEqual(disposeCalled, 2); // Should dispose editor and preview panels
    } finally {
      vscode.window.createWebviewPanel = originalCreateWebviewPanel;
    }
  });
});