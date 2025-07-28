import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from pennylane_support.main import app
from pennylane_support.database import get_session
from pennylane_support.models import Challenge, Conversation, Post

# Test database setup
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Add test data
        challenge = Challenge(
            challenge_id="CHAL_001",
            title="Test Challenge",
            description="A test challenge",
            category="Testing",
            difficulty="Beginner",
            points=50,
            tags=["test", "example"],
            learning_objectives=["Learn testing"],
            hints=["Test hint"]
        )
        session.add(challenge)
        session.commit()
        
        conversation = Conversation(
            identifier="CONV_001",
            topic="Test Conversation",
            category="Testing",
            status="open",
            challenge_id=challenge.id
        )
        session.add(conversation)
        session.commit()
        
        post = Post(
            user="testuser",
            content="Test post content",
            conversation_id=conversation.id
        )
        session.add(post)
        session.commit()
        
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_health_check(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_list_challenges(client: TestClient):
    response = client.get("/api/challenges/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["title"] == "Test Challenge"

def test_get_challenge(client: TestClient):
    response = client.get("/api/challenges/1")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Challenge"

def test_create_challenge(client: TestClient):
    challenge_data = {
        "challenge_id": "CHAL_002",
        "title": "New Challenge",
        "description": "A new challenge",
        "category": "Testing",
        "difficulty": "Beginner",
        "points": 100,
        "tags": ["new", "test"],
        "learning_objectives": ["Learn to create challenges"],
        "hints": ["New hint"]
    }
    response = client.post("/api/challenges/", json=challenge_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Challenge"
    assert data["id"] is not None

def test_list_conversations(client: TestClient):
    response = client.get("/api/conversations/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["topic"] == "Test Conversation"

def test_create_conversation(client: TestClient):
    conversation_data = {
        "identifier": "CONV_002",
        "topic": "New Conversation",
        "category": "Testing",
        "status": "open",
        "challenge_id": 1,
        "initial_post": {
            "user": "testuser",
            "content": "This is a test conversation"
        }
    }
    response = client.post("/api/conversations/", json=conversation_data)
    assert response.status_code == 201
    data = response.json()
    assert data["topic"] == "New Conversation"
    assert len(data["posts"]) == 1
    assert data["posts"][0]["content"] == "This is a test conversation"

def test_add_post_to_conversation(client: TestClient):
    post_data = {
        "user": "anotheruser",
        "content": "This is a reply to the conversation"
    }
    response = client.post("/api/conversations/1/posts", json=post_data)
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "This is a reply to the conversation"
    assert data["conversation_id"] == 1

def test_update_conversation_status(client: TestClient):
    update_data = {"status": "in_progress", "assigned_to": "support_agent"}
    response = client.patch("/api/conversations/1", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"
    assert data["assigned_to"] == "support_agent"

def test_nonexistent_endpoint(client: TestClient):
    response = client.get("/api/nonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Not Found"
