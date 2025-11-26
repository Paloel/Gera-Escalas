from sqlalchemy.orm import Session
from . import models, schemas

# --- FUNCIONÁRIOS ---
# Agora buscamos funcionários APENAS de uma escala específica
def get_funcionarios_por_escala(db: Session, escala_id: int):
    return db.query(models.Funcionario).filter(models.Funcionario.escala_id == escala_id).all()

def create_funcionario(db: Session, func: schemas.FuncionarioCreate):
    db_func = models.Funcionario(**func.dict())
    db.add(db_func)
    db.commit()
    db.refresh(db_func)
    return db_func

def delete_funcionario(db: Session, func_id: int):
    funcionario = db.query(models.Funcionario).filter(models.Funcionario.id == func_id).first()
    if funcionario:
        db.delete(funcionario)
        db.commit()
        return True
    return False

def update_funcionario(db: Session, func_id: int, dados: schemas.FuncionarioCreate):
    db_func = db.query(models.Funcionario).filter(models.Funcionario.id == func_id).first()
    if db_func:
        for key, value in dados.dict().items():
            setattr(db_func, key, value)
        db.commit()
        db.refresh(db_func)
    return db_func

# --- ESCALAS ---
def list_escalas(db: Session):
    # Retorna resumo das escalas (sem carregar todos os dados pesados se não quiser)
    return db.query(models.Escala).order_by(models.Escala.ano.desc(), models.Escala.mes.desc()).all()

def create_escala(db: Session, escala: schemas.EscalaCreate):
    db_escala = models.Escala(
        nome=escala.nome,
        mes=escala.mes,
        ano=escala.ano,
        dados_escala=escala.dados_escala,
        legenda_cores=escala.legenda_cores
    )
    db.add(db_escala)
    db.commit()
    db.refresh(db_escala)
    return db_escala

def get_escala(db: Session, escala_id: int):
    return db.query(models.Escala).filter(models.Escala.id == escala_id).first()

def delete_escala(db: Session, escala_id: int):
    escala = db.query(models.Escala).filter(models.Escala.id == escala_id).first()
    if escala:
        db.delete(escala) # O cascade deleta os funcionários juntos
        db.commit()
        return True
    return False

def update_escala(db: Session, escala_id: int, dados: schemas.EscalaCreate):
    db_escala = db.query(models.Escala).filter(models.Escala.id == escala_id).first()
    if db_escala:
        db_escala.dados_escala = dados.dados_escala
        db_escala.legenda_cores = dados.legenda_cores
        # Nome, mes e ano geralmente não mudam na edição, mas pode adicionar se quiser
        db.commit()
        db.refresh(db_escala)
    return db_escala

# A MÁGICA: CONTINUIDADE
def duplicar_escala(db: Session, escala_origem_id: int, novo_mes: int, novo_ano: int):
    # 1. Pega a escala original
    origem = db.query(models.Escala).filter(models.Escala.id == escala_origem_id).first()
    if not origem:
        return None
    
    # 2. Cria a nova escala (COM A GRADE VAZIA, mas cores iguais)
    nova_escala = models.Escala(
        nome=f"{origem.nome} (Cópia)", # Usuário edita depois
        mes=novo_mes,
        ano=novo_ano,
        dados_escala={}, # Começa limpo para recalcular
        legenda_cores=origem.legenda_cores # Herda as cores personalizadas
    )
    db.add(nova_escala)
    db.commit()
    db.refresh(nova_escala)

    # 3. Copia os Funcionários
    for func in origem.funcionarios:
        novo_func = models.Funcionario(
            escala_id=nova_escala.id, # Linka na nova
            nome=func.nome,
            cargo=func.cargo,
            tipo_escala=func.tipo_escala,
            equipe=func.equipe,
            turno_12x36=func.turno_12x36,
            folgas_semanais=func.folgas_semanais
        )
        db.add(novo_func)
    
    db.commit()
    return nova_escala