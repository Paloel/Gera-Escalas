import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Moon, Sun, Trash2, Copy } from 'lucide-react';
import api from '../api'; // <--- Importando a conexão centralizada

export function Home() {
  const navigate = useNavigate();
  
  const [escalas, setEscalas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  
  const [nomeEscala, setNomeEscala] = useState("");
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  
  const [temaEscuro, setTemaEscuro] = useState(() => localStorage.getItem('tema') === 'escuro');

  useEffect(() => {
    carregarEscalas();
  }, []);

  const carregarEscalas = async () => {
    try {
      // Agora usamos api.get e apenas o final do endereço
      const resp = await api.get('/escalas/');
      setEscalas(resp.data);
    } catch (erro) {
      console.error("Erro ao carregar escalas", erro);
    }
  };

  const criarNovaEscala = async () => {
    if (!nomeEscala.trim()) return alert("Digite um nome para a escala!");
    
    try {
      const payload = {
        nome: nomeEscala,
        mes: Number(mes),
        ano: Number(ano),
        dados_escala: {},    
        legenda_cores: { "FG": "#92D050", "M": "#4169E1", "R": "#00B050", "T1": "#FFC000", "T2": "#BDD7EE" } 
      };
      
      const resp = await api.post('/escalas/', payload);
      setModalAberto(false);
      navigate(`/editor/${resp.data.id}`); 
    } catch (error) {
      alert("Erro ao criar escala.");
    }
  };

  const excluirEscala = async (id, e) => {
    e.stopPropagation(); 
    if (window.confirm("Tem certeza? Isso apagará todos os funcionários desta escala.")) {
      await api.delete(`/escalas/${id}`);
      carregarEscalas();
    }
  };

  const duplicarEscala = async (escala, e) => {
    e.stopPropagation();
    let novoMes = escala.mes + 1;
    let novoAno = escala.ano;
    if (novoMes > 12) { novoMes = 1; novoAno++; }

    if (window.confirm(`Deseja criar a escala de ${novoMes}/${novoAno} baseada nesta?`)) {
      try {
        await api.post(`/escalas/${escala.id}/duplicar?novo_mes=${novoMes}&novo_ano=${novoAno}`);
        alert("Escala criada com sucesso! Atualizando lista...");
        carregarEscalas();
      } catch (erro) {
        alert("Erro ao duplicar.");
      }
    }
  };

  const alternarTema = () => {
    const novo = !temaEscuro;
    setTemaEscuro(novo);
    localStorage.setItem('tema', novo ? 'escuro' : 'claro');
  };

  const cores = {
    fundo: temaEscuro ? '#1a1a1a' : '#f4f4f9',
    texto: temaEscuro ? '#ffffff' : '#333333',
    cardFundo: temaEscuro ? '#2d2d2d' : '#ffffff',
    cardBorda: temaEscuro ? '#444' : 'transparent',
    botaoPrincipal: '#0070C0',
    inputFundo: temaEscuro ? '#404040' : '#ffffff',
    inputBorda: temaEscuro ? '#555' : '#ccc',
    inputTexto: temaEscuro ? '#fff' : '#000',
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      backgroundColor: cores.fundo, transition: 'background-color 0.3s', fontFamily: 'Arial',
      paddingTop: '80px', overflowY: 'auto'
    }}>
      
      <button onClick={alternarTema} style={{ position: 'absolute', top: '25px', right: '25px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px' }}>
        {temaEscuro ? <Sun size={30} color="#FFD700" fill="#FFD700" /> : <Moon size={30} color="#333" fill="#333" />}
      </button>

      <h1 style={{ marginBottom: '30px', color: cores.texto }}>Minhas Escalas</h1>
      
      <button 
        onClick={() => setModalAberto(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 40px', fontSize: '18px', 
          cursor: 'pointer', backgroundColor: cores.botaoPrincipal, color: 'white', 
          border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', marginBottom: '40px'
        }}
      >
        <Plus size={24} /> Criar Nova Escala
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', width: '90%', maxWidth: '1000px', paddingBottom: '50px' }}>
        {escalas.map(esc => (
          <div 
            key={esc.id}
            onClick={() => navigate(`/editor/${esc.id}`)}
            style={{
              backgroundColor: cores.cardFundo, padding: '20px', borderRadius: '10px',
              border: `1px solid ${cores.cardBorda}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <h3 style={{ margin: 0, color: cores.texto, fontSize: '18px' }}>{esc.nome}</h3>
              <p style={{ margin: '5px 0 0', color: '#888', fontSize: '14px' }}>{esc.mes}/{esc.ano}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <button onClick={(e) => duplicarEscala(esc, e)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '4px', backgroundColor: '#e3f2fd', color: '#0070C0', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                <Copy size={14} /> Continuar
              </button>
              <button onClick={(e) => excluirEscala(esc.id, e)} style={{ padding: '8px', border: 'none', borderRadius: '4px', backgroundColor: '#ffebee', color: '#c62828', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: cores.cardFundo, padding: '25px', borderRadius: '10px', width: '320px', color: cores.texto }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={20}/> Nova Escala</h3>

            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Nome da Loja/Escala</label>
            <input 
              value={nomeEscala} onChange={e => setNomeEscala(e.target.value)} placeholder="Ex: Bezerros"
              style={{ width: '92%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: `1px solid ${cores.inputBorda}`, backgroundColor: cores.inputFundo, color: cores.inputTexto }}
            />

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>Mês</label>
                <select value={mes} onChange={e => setMes(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: `1px solid ${cores.inputBorda}`, backgroundColor: cores.inputFundo, color: cores.inputTexto }}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>Ano</label>
                <input type="number" value={ano} onChange={e => setAno(e.target.value)} style={{ width: '85%', padding: '10px', borderRadius: '5px', border: `1px solid ${cores.inputBorda}`, backgroundColor: cores.inputFundo, color: cores.inputTexto }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalAberto(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={criarNovaEscala} style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}