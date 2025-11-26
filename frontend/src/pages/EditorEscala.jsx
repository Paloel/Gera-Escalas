import { useState, useEffect } from 'react';
import { ArrowLeft, Save, UserPlus, Trash2, RefreshCw, Settings, Download, Pencil } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ModalFuncionario } from '../components/ModalFuncionario';
import { ModalLegenda } from '../components/ModalLegenda';

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const OPCOES_STATUS_BASE = ["M", "R", "FG", "T1", "T2", "-"];

export function EditorEscala() {
  const { id } = useParams();
  
  const [escalaInfo, setEscalaInfo] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [grade, setGrade] = useState({});
  const [cores, setCores] = useState({});
  const [opcoesStatus, setOpcoesStatus] = useState(OPCOES_STATUS_BASE);

  const [modalFuncAberto, setModalFuncAberto] = useState(false);
  const [modalLegendaAberto, setModalLegendaAberto] = useState(false);
  const [inverter12x36, setInverter12x36] = useState(false);
  const [funcEditando, setFuncEditando] = useState(null);

  useEffect(() => { carregarTudo(); }, [id]);

  useEffect(() => {
    if (funcionarios.length > 0 && escalaInfo) {
       gerarGradeInicial(funcionarios, escalaInfo.mes, escalaInfo.ano, true);
    }
  }, [inverter12x36]);

  const carregarTudo = async () => {
    try {
      const respEscala = await axios.get(`http://127.0.0.1:8000/escalas/${id}`);
      setEscalaInfo(respEscala.data);
      
      const coresDoBanco = respEscala.data.legenda_cores || {};
      setCores(coresDoBanco);
      
      const siglasPersonalizadas = Object.keys(coresDoBanco).filter(k => !OPCOES_STATUS_BASE.includes(k));
      setOpcoesStatus([...OPCOES_STATUS_BASE, ...siglasPersonalizadas]);

      const respFuncs = await axios.get(`http://127.0.0.1:8000/escalas/${id}/funcionarios`);
      setFuncionarios(respFuncs.data);
      
      if (respEscala.data.dados_escala && Object.keys(respEscala.data.dados_escala).length > 0) {
        setGrade(respEscala.data.dados_escala);
      } else {
        gerarGradeInicial(respFuncs.data, respEscala.data.mes, respEscala.data.ano, true);
      }
    } catch (error) { console.error(error); }
  };

  const deletarFuncionario = async (funcId) => {
      if(window.confirm("Excluir?")) {
          await axios.delete(`http://127.0.0.1:8000/funcionarios/${funcId}`);
          carregarTudo();
      }
  };

  const abrirModalNovo = () => { setFuncEditando(null); setModalFuncAberto(true); };
  const abrirModalEdicao = (f) => { setFuncEditando(f); setModalFuncAberto(true); };

  const gerarGradeInicial = (listaFuncs, mes, ano, forcarReset = false) => {
    if (!forcarReset && Object.keys(grade).length > 0) return;
    const novaGrade = {};
    const totalDias = new Date(ano, mes, 0).getDate();
    const dataInicioAno = new Date(ano, 0, 1);

    listaFuncs.forEach(func => {
      novaGrade[func.id] = {};
      for (let dia = 1; dia <= totalDias; dia++) {
        const dataAtual = new Date(ano, mes - 1, dia);
        let status = "-";
        if (func.tipo_escala === "12x36") {
          const diffTempo = dataAtual - dataInicioAno;
          const diasCorridos = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
          const ehDiaPar = diasCorridos % 2 === 0;
          let equipeTrabalha = inverter12x36 ? (ehDiaPar ? "B" : "A") : (ehDiaPar ? "A" : "B");
          if (func.equipe === equipeTrabalha) status = func.turno_12x36 || "M"; 
          else status = "FG";
        } else if (func.tipo_escala === "DIARISTA") {
          const diaSemana = dataAtual.getDay(); 
          if (func.folgas_semanais && func.folgas_semanais.includes(diaSemana)) status = "FG";
          else status = "T1";
        }
        novaGrade[func.id][dia] = status;
      }
    });
    setGrade(novaGrade);
  };

  const alternarStatus = (funcId, dia) => {
    setGrade(prev => {
      const statusAtual = prev[funcId]?.[dia] || "-";
      const index = opcoesStatus.indexOf(statusAtual);
      const proximo = opcoesStatus[(index + 1) % opcoesStatus.length];
      return { ...prev, [funcId]: { ...prev[funcId], [dia]: proximo } };
    });
  };

  const salvarEscala = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/escalas/${id}`, {
        nome: escalaInfo.nome, mes: escalaInfo.mes, ano: escalaInfo.ano,
        dados_escala: grade, legenda_cores: cores
      });
      alert("Salvo!");
    } catch (e) { alert("Erro ao salvar"); }
  };

  const baixarExcel = async () => {
      try {
          const resp = await axios.get(`http://127.0.0.1:8000/exportar_excel/${id}`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([resp.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${escalaInfo.nome}.xlsx`);
          document.body.appendChild(link);
          link.click();
      } catch (e) { alert("Erro no Excel"); }
  };

  if (!escalaInfo) return <div>Carregando...</div>;

  const totalDias = new Date(escalaInfo.ano, escalaInfo.mes, 0).getDate();
  const diasDoMes = Array.from({ length: totalDias }, (_, i) => i + 1);
  const getDiaSemana = (dia) => new Date(escalaInfo.ano, escalaInfo.mes - 1, dia).getDay();
  const getCorCelula = (status) => cores[status] || "#FFFFFF";
  
  const getCorTexto = (status) => {
      const c = cores[status];
      if(!c) return '#000';
      if(['#FFFFFF', '#FFFF00', '#92D050', '#FFC000', '#BDD7EE'].includes(c.toUpperCase())) return '#000';
      return '#FFF';
  };

  return (
    <div style={{ padding: '10px 20px', fontFamily: 'Arial', backgroundColor: '#f9f9f9', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <ModalFuncionario isOpen={modalFuncAberto} aoFechar={() => setModalFuncAberto(false)} aoSalvar={carregarTudo} funcionarioParaEditar={funcEditando} escalaId={id} />
      <ModalLegenda isOpen={modalLegendaAberto} aoFechar={() => setModalLegendaAberto(false)} coresAtuais={cores} aoAtualizarCor={(sigla, cor) => { setCores(p => ({...p, [sigla]: cor})); if(!opcoesStatus.includes(sigla)) setOpcoesStatus(prev => [...prev, sigla]); }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/">
            <button style={{ cursor: 'pointer', padding: '5px', borderRadius: '50%', border: '1px solid #ccc' }}><ArrowLeft size={18} color="#333" /></button>
          </Link>
          <div>
             <h2 style={{ color: '#333', margin: 0, fontSize: '18px' }}>{escalaInfo.nome}</h2>
             <div onClick={() => setInverter12x36(!inverter12x36)} style={{ fontSize: '11px', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', userSelect: 'none' }}>
               <RefreshCw size={10} /> {inverter12x36 ? "Modo: Invertido" : "Modo: Padrão"}
             </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setModalLegendaAberto(true)} title="Cores" style={{ backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Settings size={18} /></button>
          <button onClick={abrirModalNovo} style={{ backgroundColor: '#0070C0', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><UserPlus size={16}/> Add</button>
          <button onClick={baixarExcel} style={{ backgroundColor: '#217346', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Download size={16}/> Excel</button>
          <button onClick={salvarEscala} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Save size={16}/> Salvar</button>
        </div>
      </div>

      <div style={{ flex: 1, border: '1px solid #ccc', backgroundColor: '#fff', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ height: '30px' }}>
              {/* CABEÇALHOS RESTAURADOS: PRETO COM TEXTO BRANCO */}
              <th style={{ width: '15%', backgroundColor: '#333', color: '#fff', border: '1px solid #555', fontSize: '12px', paddingLeft: '5px', textAlign: 'left' }}>Funcionário</th>
              <th style={{ width: '10%', backgroundColor: '#333', color: '#fff', border: '1px solid #555', fontSize: '12px', paddingLeft: '5px', textAlign: 'left' }}>Cargo</th>
              
              {diasDoMes.map(dia => (
                <th key={dia} style={{ border: '1px solid #999', fontSize: '10px', backgroundColor: getDiaSemana(dia) === 0 ? '#FFFF00' : '#E0E0E0', color: '#000', padding: '0' }}>
                   {DIAS_SEMANA[getDiaSemana(dia)]}
                </th>
              ))}
            </tr>
            <tr style={{ height: '25px' }}>
              <th colSpan={2} style={{ backgroundColor: '#444', border: '1px solid #555' }}></th>
              {diasDoMes.map(dia => (
                // NÚMEROS DOS DIAS: FUNDO BRANCO, TEXTO PRETO
                <th key={dia} style={{ border: '1px solid #999', backgroundColor: '#fff', color: '#000', fontSize: '11px' }}>{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(func => (
              <tr key={func.id} style={{ height: '30px' }}>
                <td style={{ padding: '0 5px', border: '1px solid #ccc', fontSize: '12px', fontWeight: 'bold', color: '#000' }}>
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', height:'100%'}}>
                      <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth:'120px'}}>{func.nome}</span>
                      <div style={{display:'flex'}}>
                        <button onClick={() => abrirModalEdicao(func)} style={{border:'none', background:'transparent', color:'#0070C0', cursor:'pointer'}}><Pencil size={12}/></button>
                        <button onClick={() => deletarFuncionario(func.id)} style={{border:'none', background:'transparent', color:'#e74c3c', cursor:'pointer'}}><Trash2 size={12}/></button>
                      </div>
                   </div>
                </td>
                <td style={{ padding: '0 5px', border: '1px solid #ccc', fontSize: '11px', color: '#000' }}>{func.cargo}</td>
                
                {diasDoMes.map(dia => {
                    const status = grade[func.id]?.[dia] || "-";
                    return (
                        <td key={dia} onClick={() => alternarStatus(func.id, dia)} style={{ border: '1px solid #ddd', textAlign: 'center', backgroundColor: getCorCelula(status), color: getCorTexto(status), fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', userSelect: 'none', padding:0 }}>
                            {status}
                        </td>
                    )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}