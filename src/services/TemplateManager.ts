import * as vscode from 'vscode';
import { DocumentType } from '../types/documents';

interface DocumentTemplate {
  type: DocumentType;
  name: string;
  content: string;
}

/**
 * Manages document templates
 */
export class TemplateManager {
  private static instance: TemplateManager;
  private templates: Map<string, DocumentTemplate>;
  private readonly storageKey = 'roo-cline-architect.templates';

  private constructor(private context: vscode.ExtensionContext) {
    this.templates = new Map();
    this.loadTemplates();
    this.initializeDefaultTemplates();
  }

  public static getInstance(context: vscode.ExtensionContext): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager(context);
    }
    return TemplateManager.instance;
  }

  /**
   * Gets a template by name
   */
  public getTemplate(name: string): DocumentTemplate | undefined {
    return this.templates.get(name);
  }

  /**
   * Gets all templates
   */
  public getAllTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Gets templates by document type
   */
  public getTemplatesByType(type: DocumentType): DocumentTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.type === type);
  }

  /**
   * Creates a new template
   */
  public async createTemplate(type: DocumentType, name: string, content: string): Promise<DocumentTemplate> {
    if (this.templates.has(name)) {
      throw new Error(`Template with name "${name}" already exists`);
    }

    const template: DocumentTemplate = { type, name, content };
    this.templates.set(name, template);
    await this.saveTemplates();
    return template;
  }

  /**
   * Updates an existing template
   */
  public async updateTemplate(name: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template "${name}" not found`);
    }

    const updatedTemplate = { ...template, ...updates };
    this.templates.set(name, updatedTemplate);
    await this.saveTemplates();
    return updatedTemplate;
  }

  /**
   * Deletes a template
   */
  public async deleteTemplate(name: string): Promise<void> {
    if (!this.templates.has(name)) {
      throw new Error(`Template "${name}" not found`);
    }

    this.templates.delete(name);
    await this.saveTemplates();
  }

  private async loadTemplates(): Promise<void> {
    const storedTemplates = this.context.globalState.get<Record<string, DocumentTemplate>>(this.storageKey);
    if (storedTemplates) {
      this.templates = new Map(Object.entries(storedTemplates));
    }
  }

  private async saveTemplates(): Promise<void> {
    const templatesObject = Object.fromEntries(this.templates);
    await this.context.globalState.update(this.storageKey, templatesObject);
  }

  private async initializeDefaultTemplates(): Promise<void> {
    // Only initialize if no templates exist
    if (this.templates.size === 0) {
      await this.createTemplate(
        DocumentType.Inception,
        'Default Inception Template',
        `# Project Inception Document

## Project Overview
[Brief description of the project]

## Business Case
[Justification for the project]

## Project Scope
[Define what is in and out of scope]

## Initial Risks
- [Risk 1]
- [Risk 2]

## Resource Needs
- [Resource 1]
- [Resource 2]

## Project Timeline
[High-level timeline and milestones]`
      );

      await this.createTemplate(
        DocumentType.Functional,
        'Default Functional Template',
        `# Functional Design Document

## Vision
[Project vision and goals]

## Use Cases
[List and describe key use cases]

## Business Rules
[Define business rules and constraints]

## UI Prototypes
[Include or reference UI mockups]

## System Constraints
[List technical and business constraints]`
      );

      await this.createTemplate(
        DocumentType.Technical,
        'Default Technical Template',
        `# Technical Design Document

## Architecture Overview
[High-level architecture description]

## Data Models
[Define key data structures]

## API Specifications
[Define API endpoints and interfaces]

## Security Design
[Security considerations and implementations]

## Deployment Plan
[Deployment strategy and requirements]`
      );
    }
  }
}