import { useState, useEffect } from 'react';
import { X, Check, Save } from 'lucide-react';
import axios from 'axios';

export function ModalFuncionario({ isOpen, aoFechar, aoSalvar, funcionarioParaEditar, escalaId }) {
  // --- ESTADOS ---
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [tipo, setTipo] = useState("12x36"); // "12x36" ou "DIARISTA"
  
  // Opções 12x36
  const [equipe, setEquipe] = useState("A");
  const [turno, setTurno] = useState("M"); // Padrão M (Manhã)

  // Opções Diarista (Folgas: 0=Dom, 6=Sáb)
  const [folgas, setFolgas] = useState([6]); // Padrão Domingo

  // --- EFEITO: PREENCHER DADOS AO EDITAR ---
  useEffect(() => {
    if (funcionarioParaEditar) {
      setNome(funcionarioParaEditar.nome);
      setCargo(funcionarioParaEditar.cargo);
      setTipo(funcionarioParaEditar.tipo_escala);
      setEquipe(funcionarioParaEditar.equipe || "A");
      setTurno(funcionarioParaEditar.turno_12x36 || "M");
      setFolgas(funcionarioParaEditar.folgas_semanais || [6]);
    } else {
      limparCampos();
    }
  }, [funcionarioParaEditar, isOpen]);

  const limparCampos = () => {
    setNome("");
    setCargo("");
    setTipo("12x36");
    setEquipe("A");
    setTurno("M");
    setFolgas([6]);
  };

  if (!isOpen) return null;

  // --- SALVAR ---
  const salvar = async () => {
    // Validação Básica
    if (!nome.trim() || !cargo.trim()) {
      alert("Nome e Cargo são obrigatórios!");
      return;
    }

    if (!escalaId) {
      alert("Erro interno: ID da escala não encontrado.");
      return;
    }

    // Monta o objeto para enviar ao Python
    const payload = {
      escala_id: Number(escalaId), // VITAL: Diz de qual loja é esse funcionário
      nome,
      cargo,
      tipo_escala: tipo,
      equipe: tipo === "12x36" ? equipe : null,
      turno_12x36: tipo === "12x36" ? turno : null,
      folgas_semanais: tipo === "DIARISTA" ? folgas : null
    };

    try {
      if (funcionarioParaEditar) {
        // MODO EDIÇÃO (PUT)
        await axios.put(`http://127.0.0.1:8000/funcionarios/${funcionarioParaEditar.id}`, payload);
      } else {
        // MODO CRIAÇÃO (POST)
        await axios.post('http://127.0.0.1:8000/funcionarios/', payload);
      }
      
      aoSalvar(); // Recarrega a tabela na tela de trás
      aoFechar(); // Fecha o modal
      limparCampos();
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      alert("Erro ao salvar funcionário. Verifique o console.");
    }
  };

  // Auxiliar para marcar/desmarcar dias
  const toggleFolga = (diaIndex) => {
    if (folgas.includes(diaIndex)) {
      setFolgas(folgas.filter(d => d !== diaIndex));
    } else {
      setFolgas([...folgas, diaIndex]);
    }
  };

  // --- ESTILOS VISUAIS ---
  const getEstiloBotao = (selecionado) => ({
    flex: 1, 
    padding: '10px', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    border: selecionado ? '2px solid #0070C0' : '1px solid #ccc',
    backgroundColor: selecionado ? '#D9EAF7' : '#f0f0f0', // Azul claro se selecionado
    color: '#000000', // TEXTO SEMPRE PRETO (Legibilidade)
    fontWeight: selecionado ? 'bold' : 'normal',
    transition: 'all 0.2s'
  });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '25px', borderRadius: '10px', width: '450px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'Arial'
      }}>
        
        {/* CABEÇALHO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>
            {funcionarioParaEditar ? "Editar Funcionário" : "Novo Funcionário"}
          </h2>
          <button onClick={aoFechar} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={24} color="#333" />
          </button>
        </div>

        {/* CAMPOS DE TEXTO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            placeholder="Nome Completo *" 
            value={nome}
            onChange={e => setNome(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' }}
          />

          <input 
            placeholder="Cargo (ex: Balconista) *" 
            value={cargo}
            onChange={e => setCargo(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' }}
          />

          {/* SELEÇÃO DO TIPO DE ESCALA */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <button onClick={() => setTipo("12x36")} style={getEstiloBotao(tipo === "12x36")}>
              Escala 12x36
            </button>
            <button onClick={() => setTipo("DIARISTA")} style={getEstiloBotao(tipo === "DIARISTA")}>
              Diarista
            </button>
          </div>

          {/* CONFIGURAÇÃO 12x36 */}
          {tipo === "12x36" && (
            <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>Equipe:</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                {["A", "B"].map(t => (
                  <button key={t} onClick={() => setEquipe(t)} style={getEstiloBotao(equipe === t)}>
                    Turma {t}
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>Turno (Legenda):</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {["M", "R"].map(t => (
                  <button key={t} onClick={() => setTurno(t)} style={getEstiloBotao(turno === t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CONFIGURAÇÃO DIARISTA */}
          {tipo === "DIARISTA" && (
            <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                Dias de Folga Fixa:
              </label>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((diaNome, index) => {
                  const estaSelecionado = folgas.includes(index);
                  return (
                    <button 
                      key={index} 
                      onClick={() => toggleFolga(index)}
                      style={{
                        padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', flex: 1,
                        border: estaSelecionado ? '1px solid #d9534f' : '1px solid #ccc',
                        backgroundColor: estaSelecionado ? '#fce4e4' : 'white', // Fundo levemente vermelho
                        color: '#000000', // Texto preto
                        fontWeight: estaSelecionado ? 'bold' : 'normal'
                      }}
                    >
                      {diaNome}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* BOTÃO DE SALVAR */}
        <button 
          onClick={salvar}
          style={{
            marginTop: '25px', width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white',
            border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}
        >
          {funcionarioParaEditar ? <Save size={20} /> : <Check size={20} />} 
          {funcionarioParaEditar ? "Salvar Alterações" : "Cadastrar Funcionário"}
        </button>

      </div>
    </div>
  );
}