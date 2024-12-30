import * as assert from 'assert';
import * as vscode from 'vscode';
import { PanelManager } from '../../ui/panels/PanelManager';

suite('PanelManager Test Suite', () => {
  let mockContext: vscode.ExtensionContext;
  let mockSubscriptions: { dispose: () => void }[];

  setup(async () => {
    // Reset singleton instance
    PanelManager.resetInstance();

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
    const originalRegisterWebviewViewProvider = vscode.window.registerWebviewViewProvider;
    vscode.window.registerWebviewViewProvider = (viewType: string, provider: vscode.WebviewViewProvider) => {
      return { dispose: () => {} };
    };

    // Restore original after test
    teardown(() => {
      vscode.window.registerWebviewViewProvider = originalRegisterWebviewViewProvider;
    });
  });

  teardown(async () => {
    // Clean up any panels that were created
    const panelManager = await PanelManager.getInstance(mockContext);
    panelManager.disposeAllPanels();
  });

  test('getInstance returns singleton instance', async () => {
    const instance1 = await PanelManager.getInstance(mockContext);
    const instance2 = await PanelManager.getInstance(mockContext);
    assert.strictEqual(instance1, instance2);
  });

  test('showEditorPanels creates editor and preview panels', async () => {
    const panelManager = await PanelManager.getInstance(mockContext);
    
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

  test('disposeAllPanels disposes all panels', async () => {
    const panelManager = await PanelManager.getInstance(mockContext);
    let disposeCalled = 0;
    
    const originalCreateWebviewPanel = vscode.window.createWebviewPanel;
    vscode.window.createWebviewPanel = (): vscode.WebviewPanel => {
      let disposeCallback: (() => void) | undefined;
      
      const panel = {
        viewType: 'test',
        webview: {
          html: '',
          onDidReceiveMessage: () => ({ dispose: () => {} }),
          postMessage: async () => true,
          asWebviewUri: (uri: vscode.Uri) => uri,
          cspSource: '',
          options: {}
        },
        onDidDispose: (callback: () => void) => {
          disposeCallback = callback;
          return { dispose: () => {} };
        },
        onDidChangeViewState: () => ({ dispose: () => {} }),
        reveal: () => {},
        dispose: () => {
          disposeCalled++;
          if (disposeCallback) {
            disposeCallback();
          }
        },
        visible: true,
        active: true,
        viewColumn: vscode.ViewColumn.One,
        options: {},
        title: 'Test Panel'
      };

      // Immediately register the dispose callback
      if (panel.onDidDispose && typeof panel.onDidDispose === 'function') {
        panel.onDidDispose(() => {
          if (disposeCallback) {
            disposeCallback();
          }
        });
      }

      return panel;
    };

    try {
      panelManager.showEditorPanels(); // Creates 2 panels
      panelManager.disposeAllPanels();
      assert.strictEqual(disposeCalled, 2); // Both panels should be disposed
    } finally {
      vscode.window.createWebviewPanel = originalCreateWebviewPanel;
    }
  });
});