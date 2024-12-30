/**
 * Represents the different types of architectural documents
 */
export enum DocumentType {
  Inception = 'inception',
  Functional = 'functional',
  Technical = 'technical'
}

/**
 * Represents the status of a document in the workflow
 */
export enum DocumentStatus {
  Draft = 'draft',
  InReview = 'in_review',
  Approved = 'approved',
  Rejected = 'rejected'
}

/**
 * Base interface for all architectural documents
 */
export interface BaseDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

/**
 * Represents an inception document
 */
export interface InceptionDocument extends BaseDocument {
  type: DocumentType.Inception;
  projectScope?: string;
  businessCase?: string;
  initialRisks?: string[];
  resourceNeeds?: string[];
  projectTimeline?: string;
}

/**
 * Represents a functional design document
 */
export interface FunctionalDocument extends BaseDocument {
  type: DocumentType.Functional;
  vision?: string;
  useCases?: string[];
  businessRules?: string[];
  uiPrototypes?: string[];
  systemConstraints?: string[];
}

/**
 * Represents a technical design document
 */
export interface TechnicalDocument extends BaseDocument {
  type: DocumentType.Technical;
  architecture?: string;
  dataModels?: string[];
  apiSpecs?: string[];
  securityDesign?: string;
  deploymentPlan?: string;
}

/**
 * Type guard to check if a document is an inception document
 */
export function isInceptionDocument(doc: BaseDocument): doc is InceptionDocument {
  return doc.type === DocumentType.Inception;
}

/**
 * Type guard to check if a document is a functional document
 */
export function isFunctionalDocument(doc: BaseDocument): doc is FunctionalDocument {
  return doc.type === DocumentType.Functional;
}

/**
 * Type guard to check if a document is a technical document
 */
export function isTechnicalDocument(doc: BaseDocument): doc is TechnicalDocument {
  return doc.type === DocumentType.Technical;
}