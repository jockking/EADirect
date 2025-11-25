# Enterprise Architecture Tool

A comprehensive system for managing enterprise architecture artifacts with Git-backed version control.

## Features

- **Architecture Decision Records (ADRs)**: Document and track architectural decisions
- **Business Applications**: Manage your application portfolio
- **Git-Backed Storage**: Every change is versioned and auditable
- **Full-Text Search**: Find any artifact quickly
- **Change History**: See who changed what and when
- **RESTful API**: Programmatic access to all artifacts

## Architecture

### Backend (Python + FastAPI)
- FastAPI web framework
- Git repository for data persistence
- RESTful API endpoints
- Automatic version control for all changes

### Frontend (React)
- React with Vite
- React Router for navigation
- Axios for API communication
- Clean, responsive UI

### Data Storage
All architecture artifacts are stored as files in a Git repository:
- ADRs: Markdown files in `data/architecture-repo/adrs/`
- Business Apps: YAML files in `data/architecture-repo/business-apps/`
- Full Git history for audit trails

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file (optional):
```bash
cp .env.example .env
# Edit .env if you want to customize settings
```

5. Run the backend server:
```bash
# Activate the virtual environment first
source venv/bin/activate

# Run the server (use python3 if you have a python alias)
python3 main.py

# Or use the start script
./start.sh
```

The API will be available at `http://localhost:8000`

**Note:** If you have a shell alias for `python`, make sure to use `python3` instead to use the virtual environment's Python interpreter.

API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev

# Or use the start script
./start.sh
```

The frontend will be available at `http://localhost:3000`

## Usage

### Creating an ADR

1. Navigate to the ADRs section
2. Click "Create ADR"
3. Fill in the title, context, decision, and consequences
4. Select the status (Proposed, Accepted, Deprecated, Superseded)
5. Click "Create ADR"

The ADR will be saved as a markdown file and committed to the Git repository.

### Adding a Business Application

1. Navigate to the Business Apps section
2. Click "Add Application"
3. Fill in the application details:
   - Name
   - Description
   - Owner
   - Status
   - Technologies (optional)
   - Dependencies (optional)
4. Click "Create Application"

The application will be saved as a YAML file and committed to the Git repository.

### Searching

1. Navigate to the Search page
2. Enter your search query
3. Results will show matching ADRs and business applications
4. Click on any result to view details

### Viewing History

On any artifact detail page, click "Show History" to see all changes made to that artifact, including:
- Who made the change
- When it was made
- The commit message

## Development

### Backend Commands

```bash
# Run tests (when added)
pytest

# Run a single test
pytest tests/test_specific.py::test_function_name

# Code formatting
black .

# Linting
flake8 .
```

### Frontend Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## API Endpoints

### ADRs
- `GET /adrs` - List all ADRs
- `GET /adrs/{id}` - Get specific ADR
- `POST /adrs` - Create new ADR
- `PUT /adrs/{id}` - Update ADR
- `DELETE /adrs/{id}` - Delete ADR
- `GET /adrs/{id}/history` - Get ADR history

### Business Applications
- `GET /business-apps` - List all business apps
- `GET /business-apps/{id}` - Get specific app
- `POST /business-apps` - Create new app
- `PUT /business-apps/{id}` - Update app
- `DELETE /business-apps/{id}` - Delete app
- `GET /business-apps/{id}/history` - Get app history

### Search
- `GET /search?q={query}&type={type}` - Search artifacts

## Data Location

All architecture data is stored in:
```
backend/data/architecture-repo/
```

This is a Git repository that can be:
- Backed up by pushing to a remote
- Cloned to other locations
- Managed with standard Git tools

## Future Enhancements

Potential additions to the concept:
- API management (endpoints, specifications)
- Interface definitions
- Tech debt tracking
- Integration diagrams
- Authentication and authorization
- Multi-user collaboration
- Export to various formats (PDF, Confluence, etc.)
- Branching/merging for architectural proposals

## License

This is a concept application for exploration purposes.
