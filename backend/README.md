# PennyLane Support API

A REST API for managing PennyLane coding challenges and support conversations.

## Features

- **Challenges Management**: Create, read, update, and delete coding challenges
- **Support Conversations**: Threaded conversations for discussing challenges
- **Posts**: Add replies to existing conversations
- **Search & Filter**: Filter challenges and conversations by various criteria

## API Endpoints

### Challenges

- `GET /api/challenges/` - List all challenges
- `POST /api/challenges/` - Create a new challenge
- `GET /api/challenges/{id}` - Get a specific challenge
- `PATCH /api/challenges/{id}` - Update a challenge
- `DELETE /api/challenges/{id}` - Delete a challenge

### Conversations

- `GET /api/conversations/` - List all conversations
- `POST /api/conversations/` - Create a new conversation with an initial post
- `GET /api/conversations/{id}` - Get a specific conversation with its posts
- `PATCH /api/conversations/{id}` - Update conversation details (e.g., status, assignee)
- `DELETE /api/conversations/{id}` - Delete a conversation

### Posts

- `GET /api/conversations/{id}/posts` - List all posts in a conversation
- `POST /api/conversations/{id}/posts` - Add a new post to a conversation
- `GET /api/conversations/{id}/posts/{id}` - Get a specific post

## Getting Started

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pennylane-support.git
   cd pennylane-support/backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the FastAPI development server:
   ```bash
   uvicorn pennylane_support.main:app --reload
   ```

2. The API will be available at `http://127.0.0.1:8000`

3. Access the interactive API documentation at:
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`

### Testing

Run the test suite with pytest:

```bash
pytest tests/
```

## Database

The application uses SQLite by default for development. For production, you can configure a PostgreSQL database by setting the `DATABASE_URL` environment variable.

### Migrations

Database schema changes should be handled using SQLModel's built-in functionality. The database tables are automatically created when the application starts.

## Environment Variables

- `DATABASE_URL`: Database connection URL (default: `sqlite:///./pennylane_support.db`)
- `ENVIRONMENT`: Application environment (e.g., `development`, `production`)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLModel](https://sqlmodel.tiangolo.com/)
- [PennyLane](https://pennylane.ai/)