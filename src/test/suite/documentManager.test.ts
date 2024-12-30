import * as assert from 'assert';
import * as vscode from 'vscode';
import { DocumentManager } from '../../services/DocumentManager';
import { TemplateManager } from '../../services/TemplateManager';
import { DocumentType, DocumentStatus, BaseDocument } from '../../types/documents';

suite('DocumentManager Test Suite', () => {
  let documentManager: DocumentManager;
  let mockContext: vscode.ExtensionContext;
  let mockTemplateManager: any;
  let storedDocs: Record<string, BaseDocument> = {};

  setup(() => {
    // Mock template content
    const defaultTemplate = {
      type: DocumentType.Inception,
      name: 'Default Inception Template',
      content: '# Default Template Content'
    };

    // Mock template manager
    mockTemplateManager = {
      getTemplate: (name: string) => name === 'test-template' ? {
        type: DocumentType.Inception,
        name: 'test-template',
        content: '# Test Template Content'
      } : undefined,
      getTemplatesByType: (type: DocumentType) => [defaultTemplate],
      getInstance: () => mockTemplateManager
    };

    // Mock VSCode extension context
    mockContext = {
      globalState: {
        get: (key: string) => storedDocs,
        update: async (key: string, value: any) => {
          storedDocs = value;
          return Promise.resolve();
        }
      }
    } as any;

    // Mock TemplateManager.getInstance
    const originalGetInstance = TemplateManager.getInstance;
    TemplateManager.getInstance = (context: vscode.ExtensionContext) => mockTemplateManager;

    documentManager = DocumentManager.getInstance(mockContext);

    // Restore original getInstance
    TemplateManager.getInstance = originalGetInstance;
  });

  teardown(() => {
    storedDocs = {};
  });

  test('getInstance returns singleton instance', () => {
    const instance1 = DocumentManager.getInstance(mockContext);
    const instance2 = DocumentManager.getInstance(mockContext);
    assert.strictEqual(instance1, instance2);
  });

  test('createDocument creates document with correct type and properties', async () => {
    const title = 'Test Document';
    const doc = await documentManager.createDocument(DocumentType.Inception, title);

    assert.strictEqual(doc.title, title);
    assert.strictEqual(doc.type, DocumentType.Inception);
    assert.strictEqual(doc.status, DocumentStatus.Draft);
    assert.strictEqual(doc.version, 1);
    assert.ok(doc.id);
    assert.ok(doc.createdAt);
    assert.ok(doc.updatedAt);
  });

  test('createDocument uses default template when no template specified', async () => {
    const doc = await documentManager.createDocument(DocumentType.Inception, 'Test');
    assert.strictEqual(doc.content, '# Default Template Content');
  });

  test('createDocument uses specified template when provided', async () => {
    const doc = await documentManager.createDocument(
      DocumentType.Inception,
      'Test',
      'test-template'
    );
    assert.strictEqual(doc.content, '# Test Template Content');
  });

  test('updateDocument updates document properties', async () => {
    const doc = await documentManager.createDocument(DocumentType.Functional, 'Test');
    const newTitle = 'Updated Title';
    
    const updatedDoc = await documentManager.updateDocument(doc.id, { title: newTitle });
    
    assert.strictEqual(updatedDoc.title, newTitle);
    assert.strictEqual(updatedDoc.version, 2);
    assert.notStrictEqual(updatedDoc.updatedAt, doc.updatedAt);
  });

  test('updateDocumentStatus updates document status', async () => {
    const doc = await documentManager.createDocument(DocumentType.Technical, 'Test');
    
    const updatedDoc = await documentManager.updateDocumentStatus(doc.id, DocumentStatus.InReview);
    
    assert.strictEqual(updatedDoc.status, DocumentStatus.InReview);
    assert.strictEqual(updatedDoc.version, 2);
  });

  test('getDocument retrieves correct document', async () => {
    const doc = await documentManager.createDocument(DocumentType.Inception, 'Test');
    const retrieved = documentManager.getDocument(doc.id);
    
    assert.deepStrictEqual(retrieved, doc);
  });

  test('getAllDocuments returns all documents', async () => {
    await documentManager.createDocument(DocumentType.Inception, 'Doc 1');
    await documentManager.createDocument(DocumentType.Functional, 'Doc 2');
    await documentManager.createDocument(DocumentType.Technical, 'Doc 3');
    
    const allDocs = documentManager.getAllDocuments();
    assert.strictEqual(allDocs.length, 3);
  });

  test('getDocumentsByType returns documents of specified type', async () => {
    await documentManager.createDocument(DocumentType.Inception, 'Doc 1');
    await documentManager.createDocument(DocumentType.Functional, 'Doc 2');
    await documentManager.createDocument(DocumentType.Inception, 'Doc 3');
    
    const inceptionDocs = documentManager.getDocumentsByType(DocumentType.Inception);
    assert.strictEqual(inceptionDocs.length, 2);
    assert.ok(inceptionDocs.every(doc => doc.type === DocumentType.Inception));
  });

  test('getDocumentsByStatus returns documents with specified status', async () => {
    const doc1 = await documentManager.createDocument(DocumentType.Inception, 'Doc 1');
    await documentManager.createDocument(DocumentType.Functional, 'Doc 2');
    await documentManager.updateDocumentStatus(doc1.id, DocumentStatus.InReview);
    
    const inReviewDocs = documentManager.getDocumentsByStatus(DocumentStatus.InReview);
    assert.strictEqual(inReviewDocs.length, 1);
    assert.ok(inReviewDocs.every(doc => doc.status === DocumentStatus.InReview));
  });

  test('deleteDocument removes document', async () => {
    const doc = await documentManager.createDocument(DocumentType.Inception, 'Test');
    await documentManager.deleteDocument(doc.id);
    
    const retrieved = documentManager.getDocument(doc.id);
    assert.strictEqual(retrieved, undefined);
  });

  test('deleteDocument throws error for non-existent document', async () => {
    await assert.rejects(
      documentManager.deleteDocument('non-existent-id'),
      /Document not found/
    );
  });

  test('updateDocument throws error for non-existent document', async () => {
    await assert.rejects(
      documentManager.updateDocument('non-existent-id', { title: 'New Title' }),
      /Document not found/
    );
  });
});