from sqlalchemy import Column
from sqlalchemy.types import JSON
from sqlmodel import Field, Session, SQLModel, create_engine
from ..core.config import settings
import uuid
from pydantic import EmailStr

class Document(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    url: str

class Chunk(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    document_id: str = Field(foreign_key="document.id")
    content: str

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: EmailStr = Field(unique=True, index=True)
    # In a real app, this would be a hashed password
    hashed_password: str 
    profile: dict | None = Field(default=None, sa_column=Column(JSON))


# DATABASE_URL should be in your .env file
# e.g., DATABASE_URL="postgresql://user:password@host:port/database"
# For local dev, we might use a local postgres instance or even sqlite
# For simplicity, we'll continue using a local sqlite file.
sqlite_file_name = "test.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# Use settings.DATABASE_URL in production
engine = create_engine(sqlite_url, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

if __name__ == '__main__':
    create_db_and_tables()