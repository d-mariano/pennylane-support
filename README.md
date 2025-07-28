# PennyLane Support Platform

A support platform for PennyLane users to get help with quantum computing challenges and coding exercises.

## Project Structure

- `/backend` - FastAPI Python backend
- `/frontend` - React TypeScript frontend
- `/scripts` - Database and setup scripts

## Prerequisites

- Node.js 22+ and Yarn
- Python 3.12+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) - Python package manager and virtual environment tool
    * `curl -LsSf https://astral.sh/uv/install.sh | sh`
- SQLite

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies using uv:
   ```bash
   uv sync --all-extras
   ```

3. Initialize the database:
   ```bash
   python scripts/load_db.py
   ```

5. Start the development server:
   ```bash
   python main.py
   ```

* The API will be available at `http://localhost:8000`
* The API Documentation will be available at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies using Yarn:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. You are now ready to go!

The frontend will be available at `http://localhost:3000`


## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
