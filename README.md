# Roo-Cline Architect

A Visual Studio Code extension that enhances Roo-Cline's capabilities by formalizing and streamlining architectural design workflows for complex software projects.

## Features

- Document Management System
  - Create and manage architectural documents (Inception, Functional, Technical)
  - Track document status and versions
  - Live preview support for Markdown and diagrams

- Context Library
  - Reusable architectural patterns and templates
  - Project-specific context management
  - Drag-and-drop integration

- AI-Powered Assistance
  - Real-time content validation
  - Context-aware suggestions
  - Automated diagram generation

- Workflow Management
  - Document approval process
  - Review and feedback system
  - Collaborative editing features

- Git Integration
  - Automated commit management
  - Branch handling
  - Pull request automation

## Requirements

- Visual Studio Code 1.85.0 or higher
- Roo-Cline extension installed and configured

## Extension Settings

This extension contributes the following settings:

* `roo-cline-architect.enable`: Enable/disable the extension
* `roo-cline-architect.documentPath`: Path to store architectural documents

## Known Issues

This is an initial release with basic functionality. More features will be added in future releases.

## Release Notes

### 0.1.0

Initial release of Roo-Cline Architect:
- Basic document management
- Command registration
- Extension activation

## Development

### Building the Extension

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Build the extension:
   ```bash
   bun run compile
   ```

### Running Tests

```bash
bun run test
```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This extension is licensed under the MIT License.
