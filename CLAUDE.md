# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise Architecture Tool - A comprehensive system for managing enterprise architecture artifacts including business applications, APIs, interfaces, Architecture Decision Records (ADRs), and technical debt tracking.

**Core Concept**: All architecture data is stored in a Git repository, providing version control, audit trails, and change tracking for enterprise architecture artifacts.

## Architecture

### Backend (Python)
- Microservice-based API architecture
- Git repository as the primary data store
- RESTful API endpoints for CRUD operations on architecture artifacts
- Git operations wrapped in service layer for versioning all changes

### Frontend (React)
- Search and content management interface
- Browse and edit architecture artifacts
- Git history visualization for audit trails
- Full-text search across all architecture documents

### Data Model
Key domain entities:
- **Business Applications**: Systems and applications in the enterprise
- **APIs**: API definitions, endpoints, and specifications (planned)
- **Interfaces**: Integration points between systems (planned)
- **ADRs**: Architecture Decision Records with enhanced decision tracking
  - Multiple decision options with pros/cons analysis
  - Recommended option, strategic selection, and interim selection
  - Stakeholders and related ADRs tracking
  - Cost and effort estimates per option
- **Tech Debt**: Technical debt tracking linked to ADRs
  - Priority levels (low, medium, high, critical)
  - Status tracking (identified, accepted, in-progress, resolved, wont-fix)
  - Ownership and resolution dates
  - Impact assessment and effort estimates
  - Links to related ADRs

### Git-Backed Storage
All artifacts stored as structured files (JSON/YAML/Markdown) in a Git repository:
- Each artifact type has its own directory structure
- Changes tracked through Git commits
- Frontend operations translate to Git commits with meaningful messages
- Full audit history via Git log
- Branch/merge support for architectural proposals

## Development Commands

### Backend
```bash
# Setup (once structure is created)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run tests
pytest

# Run single test
pytest tests/test_specific.py::test_function_name

# Run backend server
python3 main.py
# or
./start.sh

# Linting
black .
flake8 .
mypy .
```

### Frontend
```bash
# Setup
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Run single test
npm test -- path/to/test

# Build
npm run build

# Linting
npm run lint
npm run lint:fix
```

## Key Architectural Patterns

### Git Operations
- All write operations must create Git commits
- Commit messages should reference the artifact type and action (e.g., "Add ADR: Use PostgreSQL for data persistence")
- Service layer abstracts Git operations from API controllers
- Consider using GitPython or similar library for Git operations

### API Design
- RESTful endpoints for each artifact type
- Standard CRUD operations: GET, POST, PUT, DELETE
- Search endpoint with full-text and filtered search capabilities
- Git history endpoint to retrieve artifact change history

### File Organization in Git Repository
Actual structure for managed artifacts:
```
/business-apps/
  app-slug.yaml          # Business application definitions
/adrs/
  YYYYMMDD-title.md      # Enhanced ADR format with options
/tech-debt/
  debt-YYYYMMDD-title.yaml  # Tech debt items
/apis/                   # Planned
  api-id.yaml
/interfaces/             # Planned
  interface-id.yaml
```

### Enhanced ADR Format
ADRs now support:
- **Multiple Options**: Each option has name, description, pros, cons, cost estimate, effort estimate
- **Recommended Option**: The team's recommendation
- **Strategic Selection**: Long-term solution choice
- **Interim Selection**: Short-term/temporary solution
- **Decision Rationale**: Explanation of why the decision was made
- **Stakeholders**: List of people/teams involved
- **Related ADRs**: Links to other relevant ADRs

### Tech Debt Management
Tech debt items include:
- **Linked ADR**: Optional reference to the ADR that created the debt
- **Priority**: low, medium, high, critical
- **Status**: identified, accepted, in-progress, resolved, wont-fix
- **Dates**: created_date, target_resolution_date, actual_resolution_date
- **Ownership**: Who is responsible for resolution
- **Impact**: Description of the impact
- **Effort Estimate**: Time/effort to resolve
- **Affected Systems**: List of systems impacted
- **Tags**: Categorization tags

### Search Implementation
- Index all artifact content for full-text search
- Support filtering by artifact type, status, date ranges
- Search should scan Git repository content
- Consider using a lightweight search library or in-memory indexing

## Technology Stack Considerations

### Backend Framework Options
- FastAPI: Modern, fast, with automatic OpenAPI documentation
- Flask: Lightweight, flexible
- Django REST Framework: Full-featured, batteries-included

### Frontend State Management
- Consider React Query for API data fetching and caching
- Context API or Redux for global state

### Git Integration
- GitPython library for Python Git operations
- Ensure proper error handling for Git conflicts
- Consider merge strategies for concurrent edits

## ADR Format
When creating ADRs, follow the standard format:
- Title
- Status (Proposed, Accepted, Deprecated, Superseded)
- Context
- Decision
- Consequences

## Important Notes

- All backend changes to artifacts must result in Git commits
- Frontend should display Git metadata (author, timestamp, commit message) alongside artifacts
- Consider authentication/authorization early - who can commit what changes
- Git repository path should be configurable (environment variable or config file)
- Backup strategy: since data is in Git, backup involves repository clones/remotes
