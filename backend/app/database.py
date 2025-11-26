import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Tenta pegar a URL do banco da nuvem (Variável de Ambiente). 
# Se não existir (no seu PC), usa o sqlite local.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./escalas.db")

# Correção necessária para o Render (ele usa 'postgres://' mas o Python quer 'postgresql://')
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configura o motor do banco
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    # Configuração para SQLite (Seu PC)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Configuração para PostgreSQL (Nuvem)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()