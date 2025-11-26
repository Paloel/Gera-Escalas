from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class Escala(Base):
    __tablename__ = "escalas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String) # Ex: "Escala Bezerros"
    mes = Column(Integer)
    ano = Column(Integer)
    
    # A grade salva apenas os STATUS (M, FG) dia a dia
    dados_escala = Column(JSON, default={}) 
    legenda_cores = Column(JSON, default={})

    # Uma escala tem muitos funcionários
    funcionarios = relationship("Funcionario", back_populates="escala", cascade="all, delete-orphan")

class Funcionario(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True)
    # VÍNCULO NOVO: Funcionário pertence a UMA escala específica
    escala_id = Column(Integer, ForeignKey("escalas.id"))
    
    nome = Column(String, nullable=False)
    cargo = Column(String, nullable=False)
    tipo_escala = Column(String, default="DIARISTA")
    
    equipe = Column(String, nullable=True)
    turno_12x36 = Column(String, nullable=True)
    folgas_semanais = Column(JSON, nullable=True) 

    escala = relationship("Escala", back_populates="funcionarios")