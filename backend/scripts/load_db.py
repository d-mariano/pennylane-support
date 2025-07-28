#!/usr/bin/env python3
"""
Script to load initial data into the database from JSON files.

This script loads challenges and conversations data from JSON files into the database.
Challenges are loaded first since conversations reference them.
"""
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

# Add the project root to the Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from sqlmodel import Session, select

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import models and database engine
from pennylane_support.database import engine
from pennylane_support.models.challenge import Challenge
from pennylane_support.models.conversation import Conversation, ConversationBase, Post

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / 'data'

# Paths to data files
CHALLENGES_FILE = DATA_DIR / 'pennylane_coding_challenges.json'
CONVERSATIONS_FILE = DATA_DIR / 'pennylane_support_conversations.json'

def load_json_file(file_path: Path):
    """Load and parse a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON file {file_path}: {e}")
        sys.exit(1)

def create_conversation(conv_data: Dict[str, Any], challenge_map: Dict[str, int]) -> Conversation:
    """Create a Conversation instance from raw data."""
    
    posts = conv_data.get('posts', [])

    conversation = ConversationBase.model_validate(
        {**conv_data, "user": posts[0]['user'], "challenge_id": challenge_map[conv_data['challenge_id']]},
    )
    conversation_db = Conversation.model_validate(conversation)
    
    for post_data in posts:
        post = Post(
            user=post_data['user'],
            content=post_data['content'],
            timestamp=datetime.fromisoformat(post_data['timestamp'])
        )
        conversation_db.posts.append(post)
    
    return conversation_db

def load_challenges(session: Session) -> Dict[str, int]:
    """Load challenges from JSON file into the database."""
    logger.info(f"Loading challenges from {CHALLENGES_FILE}")
    challenges_data = load_json_file(CHALLENGES_FILE)
    
    # Create a mapping from challenge_id to database ID
    challenge_map = {}
    
    for challenge_data in challenges_data['coding_challenges']:
        # Check if challenge already exists
        existing = session.exec(
            select(Challenge).where(Challenge.challenge_id == challenge_data['challenge_id'])
        ).first()
        
        if existing:
            logger.info(f"Challenge {challenge_data['challenge_id']} already exists, skipping...")
            challenge_map[challenge_data['challenge_id']] = existing.id
            continue
        
        # Create and add the challenge
        challenge = Challenge(**challenge_data)
        session.add(challenge)
        session.commit()
        session.refresh(challenge)
        
        logger.info(f"Added challenge: {challenge.title} (ID: {challenge.id})")
        challenge_map[challenge_data['challenge_id']] = challenge.id
    
    return challenge_map

def load_conversations(session: Session, challenge_map: Dict[str, int]) -> None:
    """Load conversations from JSON file into the database."""
    logger.info(f"Loading conversations from {CONVERSATIONS_FILE}")
    conversations_data = load_json_file(CONVERSATIONS_FILE)
    
    for conv_data in conversations_data['support_conversations']:
        # Check if conversation already exists
        existing = session.exec(
            select(Conversation).where(Conversation.identifier == conv_data['identifier'])
        ).first()
        
        if existing:
            logger.info(f"Conversation {conv_data['identifier']} already exists, skipping...")
            continue
        
        # Create and add the conversation
        conversation = create_conversation(conv_data, challenge_map)
        session.add(conversation)
        session.commit()
        
        logger.info(f"Added conversation: {conversation.topic} (ID: {conversation.id})")

def main():
    """Main function to load data into the database."""
    logger.info("Starting database loading process...")
    
    # Create database tables if they don't exist
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Load challenges first
        challenge_map = load_challenges(session)
        
        # Then load conversations
        load_conversations(session, challenge_map)
    
    logger.info("Database loading completed successfully!")

if __name__ == "__main__":
    main()
