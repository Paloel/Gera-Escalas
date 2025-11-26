from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict

class FuncionarioBase(BaseModel):
    nome: str
    cargo: str
    tipo_escala: str = "DIARISTA"
    equipe: Optional[str] = None       
    turno_12x36: Optional[str] = None  
    folgas_semanais: Optional[List[int]] = None 
    # escala_id não precisa ser passado na criação manual, o backend resolve

class FuncionarioCreate(FuncionarioBase):
    escala_id: int # Agora é obrigatório saber pra qual escala estamos criando

class Funcionario(FuncionarioBase):
    id: int
    escala_id: int
    model_config = ConfigDict(from_attributes=True)

class EscalaBase(BaseModel):
    nome: str
    mes: int
    ano: int
    dados_escala: Dict[str, Dict[str, str]] 
    legenda_cores: Dict[str, str]

class EscalaCreate(EscalaBase):
    pass

class Escala(EscalaBase):
    id: int
    funcionarios: List[Funcionario] = [] # A escala agora carrega seus funcionários
    model_config = ConfigDict(from_attributes=True)