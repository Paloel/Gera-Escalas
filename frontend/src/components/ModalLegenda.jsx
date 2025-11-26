import { useState } from 'react';
import { X, RefreshCcw, Plus } from 'lucide-react';
import { SeletorDeCor } from './SeletorDeCor';

export function ModalLegenda({ isOpen, aoFechar, coresAtuais, aoAtualizarCor }) {
  // Estados para adicionar nova sigla
  const [novaSigla, setNovaSigla] = useState("");
  const [novaCor, setNovaCor] = useState("#FFFFFF");

  if (!isOpen) return null;

  const legendas = Object.keys(coresAtuais).filter(key => key !== '-');

  const adicionarNova = () => {
    if (!novaSigla.trim()) return alert("Digite uma sigla (Ex: L)");
    if (novaSigla.length > 3) return alert("Sigla muito longa! Max 3 letras.");
    
    // Adiciona na lista principal
    aoAtualizarCor(novaSigla.toUpperCase(), novaCor);
    setNovaSigla("");
    setNovaCor("#FFFFFF");
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
    }}>
      <div style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '10px', width: '400px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)', fontFamily: 'Arial', maxHeight: '90vh', overflowY: 'auto'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RefreshCcw size={20}/> Personalizar Cores
          </h3>
          <button onClick={aoFechar} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={24} color="#333" />
          </button>
        </div>

        {/* ÁREA DE ADICIONAR NOVA */}
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Adicionar Nova (Ex: L, F, Atestado)</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              placeholder="Sigla" 
              value={novaSigla}
              onChange={e => setNovaSigla(e.target.value)}
              style={{ width: '60px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textTransform: 'uppercase', textAlign: 'center', fontWeight: 'bold' }}
            />
            <div style={{ flex: 1 }}>
               <SeletorDeCor corSelecionada={novaCor} aoSelecionar={setNovaCor} />
            </div>
            <button onClick={adicionarNova} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* LISTA DAS EXISTENTES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {legendas.map(sigla => (
            <div key={sigla} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ 
                  width: '40px', height: '30px', backgroundColor: coresAtuais[sigla], 
                  color: '#000', border: '1px solid #ccc', borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {sigla}
                </div>
                <span style={{ fontWeight: 'bold', color: '#555' }}>{sigla}</span>
              </div>
              <SeletorDeCor corSelecionada={coresAtuais[sigla]} aoSelecionar={(novaCor) => aoAtualizarCor(sigla, novaCor)} />
            </div>
          ))}
        </div>

        <button onClick={aoFechar} style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#0070C0', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
          Concluir
        </button>

      </div>
    </div>
  );
}