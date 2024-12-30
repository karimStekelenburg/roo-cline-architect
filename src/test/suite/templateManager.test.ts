import * as assert from 'assert';
import * as vscode from 'vscode';
import { TemplateManager } from '../../services/TemplateManager';
import { DocumentType } from '../../types/documents';

suite('TemplateManager Test Suite', () => {
  let templateManager: TemplateManager;
  let mockContext: vscode.ExtensionContext;
  let storedTemplates: Record<string, any> = {};

  setup(async () => {
    // Reset singleton instance and storage before each test
    TemplateManager.resetInstance();
    storedTemplates = {};
    
    // Mock VSCode extension context
    mockContext = {
      globalState: {
        get: (key: string) => storedTemplates,
        update: async (key: string, value: any) => {
          storedTemplates = value;
          return Promise.resolve();
        }
      }
    } as any;

    // Create new instance without default templates for most tests
    templateManager = await TemplateManager.getInstance(mockContext, true);
  });

  test('getInstance returns singleton instance', async () => {
    // Reset instance to ensure clean state
    TemplateManager.resetInstance();
    storedTemplates = {};
    
    const instance1 = await TemplateManager.getInstance(mockContext, true);
    const instance2 = await TemplateManager.getInstance(mockContext, true);
    assert.strictEqual(instance1, instance2);
  });

  test('createTemplate creates template with correct properties', async () => {
    const type = DocumentType.Inception;
    const name = 'Test Template';
    const content = '# Test Content';

    const template = await templateManager.createTemplate(type, name, content);

    assert.strictEqual(template.type, type);
    assert.strictEqual(template.name, name);
    assert.strictEqual(template.content, content);
  });

  test('getTemplate retrieves correct template', async () => {
    const type = DocumentType.Functional;
    const name = 'Test Template';
    const content = '# Test Content';

    await templateManager.createTemplate(type, name, content);
    const template = templateManager.getTemplate(name);

    assert.ok(template);
    assert.strictEqual(template.type, type);
    assert.strictEqual(template.name, name);
    assert.strictEqual(template.content, content);
  });

  test('getAllTemplates returns all templates', async () => {
    await templateManager.createTemplate(DocumentType.Inception, 'Template 1', 'Content 1');
    await templateManager.createTemplate(DocumentType.Functional, 'Template 2', 'Content 2');
    await templateManager.createTemplate(DocumentType.Technical, 'Template 3', 'Content 3');

    const templates = templateManager.getAllTemplates();
    assert.strictEqual(templates.length, 3);
  });

  test('getTemplatesByType returns templates of specified type', async () => {
    await templateManager.createTemplate(DocumentType.Inception, 'Template 1', 'Content 1');
    await templateManager.createTemplate(DocumentType.Functional, 'Template 2', 'Content 2');
    await templateManager.createTemplate(DocumentType.Inception, 'Template 3', 'Content 3');

    const inceptionTemplates = templateManager.getTemplatesByType(DocumentType.Inception);
    assert.strictEqual(inceptionTemplates.length, 2);
    assert.ok(inceptionTemplates.every(t => t.type === DocumentType.Inception));
  });

  test('updateTemplate updates template properties', async () => {
    const name = 'Test Template';
    await templateManager.createTemplate(DocumentType.Technical, name, 'Original Content');

    const updatedTemplate = await templateManager.updateTemplate(name, {
      content: 'Updated Content'
    });

    assert.strictEqual(updatedTemplate.content, 'Updated Content');
    assert.strictEqual(updatedTemplate.type, DocumentType.Technical);
    assert.strictEqual(updatedTemplate.name, name);
  });

  test('deleteTemplate removes template', async () => {
    const name = 'Test Template';
    await templateManager.createTemplate(DocumentType.Inception, name, 'Content');
    await templateManager.deleteTemplate(name);

    const template = templateManager.getTemplate(name);
    assert.strictEqual(template, undefined);
  });

  test('createTemplate throws error for duplicate name', async () => {
    const name = 'Test Template';
    await templateManager.createTemplate(DocumentType.Inception, name, 'Content');

    await assert.rejects(
      templateManager.createTemplate(DocumentType.Functional, name, 'New Content'),
      /Template with name "Test Template" already exists/
    );
  });

  test('updateTemplate throws error for non-existent template', async () => {
    await assert.rejects(
      templateManager.updateTemplate('non-existent', { content: 'New Content' }),
      /Template "non-existent" not found/
    );
  });

  test('deleteTemplate throws error for non-existent template', async () => {
    await assert.rejects(
      templateManager.deleteTemplate('non-existent'),
      /Template "non-existent" not found/
    );
  });

  test('default templates are created when no templates exist', async () => {
    // Reset templates and create new instance with defaults enabled
    TemplateManager.resetInstance();
    storedTemplates = {};
    
    // Create new instance with defaults enabled (skipDefaults = false)
    const managerWithDefaults = await TemplateManager.getInstance(mockContext, false);
    
    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const templates = managerWithDefaults.getAllTemplates();
    assert.strictEqual(templates.length, 3);
    assert.ok(templates.some(t => t.type === DocumentType.Inception));
    assert.ok(templates.some(t => t.type === DocumentType.Functional));
    assert.ok(templates.some(t => t.type === DocumentType.Technical));
  });
});