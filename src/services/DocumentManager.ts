import * as vscode from 'vscode';
import { BaseDocument, DocumentStatus, DocumentType, InceptionDocument, FunctionalDocument, TechnicalDocument } from '../types/documents';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing architectural documents
 */
export class DocumentManager {
  private static instance: DocumentManager;
  private documents: Map<string, BaseDocument>;
  private readonly storageKey = 'roo-cline-architect.documents';

  private constructor(private context: vscode.ExtensionContext) {
    this.documents = new Map();
    this.loadDocuments();
  }

  public static getInstance(context: vscode.ExtensionContext): DocumentManager {
    if (!DocumentManager.instance) {
      DocumentManager.instance = new DocumentManager(context);
    }
    return DocumentManager.instance;
  }

  /**
   * Creates a new document of the specified type
   */
  public async createDocument(type: DocumentType, title: string): Promise<BaseDocument> {
    const id = uuidv4();
    const now = new Date();
    
    const baseDoc: BaseDocument = {
      id,
      type,
      title,
      content: '',
      status: DocumentStatus.Draft,
      createdAt: now,
      updatedAt: now,
      version: 1
    };

    let document: BaseDocument;

    switch (type) {
      case DocumentType.Inception:
        document = {
          ...baseDoc,
          type: DocumentType.Inception,
          projectScope: '',
          businessCase: '',
          initialRisks: [],
          resourceNeeds: [],
          projectTimeline: ''
        } as InceptionDocument;
        break;

      case DocumentType.Functional:
        document = {
          ...baseDoc,
          type: DocumentType.Functional,
          vision: '',
          useCases: [],
          businessRules: [],
          uiPrototypes: [],
          systemConstraints: []
        } as FunctionalDocument;
        break;

      case DocumentType.Technical:
        document = {
          ...baseDoc,
          type: DocumentType.Technical,
          architecture: '',
          dataModels: [],
          apiSpecs: [],
          securityDesign: '',
          deploymentPlan: ''
        } as TechnicalDocument;
        break;

      default:
        throw new Error(`Invalid document type: ${type}`);
    }

    this.documents.set(id, document);
    await this.saveDocuments();
    return document;
  }

  /**
   * Updates an existing document
   */
  public async updateDocument(id: string, updates: Partial<BaseDocument>): Promise<BaseDocument> {
    const document = this.documents.get(id);
    if (!document) {
      throw new Error(`Document not found: ${id}`);
    }

    const updatedDoc = {
      ...document,
      ...updates,
      updatedAt: new Date(),
      version: document.version + 1
    };

    this.documents.set(id, updatedDoc);
    await this.saveDocuments();
    return updatedDoc;
  }

  /**
   * Updates the status of a document
   */
  public async updateDocumentStatus(id: string, status: DocumentStatus): Promise<BaseDocument> {
    return this.updateDocument(id, { status });
  }

  /**
   * Gets a document by ID
   */
  public getDocument(id: string): BaseDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Gets all documents
   */
  public getAllDocuments(): BaseDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Gets documents by type
   */
  public getDocumentsByType(type: DocumentType): BaseDocument[] {
    return Array.from(this.documents.values()).filter(doc => doc.type === type);
  }

  /**
   * Gets documents by status
   */
  public getDocumentsByStatus(status: DocumentStatus): BaseDocument[] {
    return Array.from(this.documents.values()).filter(doc => doc.status === status);
  }

  /**
   * Deletes a document
   */
  public async deleteDocument(id: string): Promise<void> {
    if (!this.documents.has(id)) {
      throw new Error(`Document not found: ${id}`);
    }

    this.documents.delete(id);
    await this.saveDocuments();
  }

  /**
   * Loads documents from extension storage
   */
  private loadDocuments(): void {
    const storedDocs = this.context.globalState.get<Record<string, BaseDocument>>(this.storageKey);
    if (storedDocs) {
      this.documents = new Map(Object.entries(storedDocs));
    }
  }

  /**
   * Saves documents to extension storage
   */
  private async saveDocuments(): Promise<void> {
    const docsObject = Object.fromEntries(this.documents);
    await this.context.globalState.update(this.storageKey, docsObject);
  }
}