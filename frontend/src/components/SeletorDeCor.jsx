import React from 'react';
import { Check } from 'lucide-react'; // Ícone de "check" para mostrar qual está selecionada

// Cores estilo Excel (Pastel para fundo, Fortes para destaque)
const CORES_DISPONIVEIS = [
  "#FFFFFF", "#000000", "#EEECE1", "#1F497D", "#4F81BD", // Neutros/Azuis
  "#C0504D", "#9BBB59", "#8064A2", "#4BACC6", "#F79646", // Cores Base Office
  "#F2F2F2", "#D8D8D8", "#BFBFBF", "#A5A5A5", "#7F7F7F", // Escala Cinza
  "#FF0000", "#FFFF00", "#00FF00", "#00B050", "#0070C0", // Cores Vivas (Sinalização)
  "#FDE9D9", "#EBF1DE", "#E6E0EC", "#DBEEF3", "#FFEB3B", // Tons Pastel Claros
  "#FFC7CE", "#C6EFCE", "#FFEB9C", "#BDD7EE", "#FCD5B4"  // Formatação Condicional Clássica
];

export function SeletorDeCor({ corSelecionada, aoSelecionar }) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(5, 1fr)', // 5 colunas
      gap: '8px', 
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
      maxWidth: '250px' // Tamanho máximo da caixinha
    }}>
      {CORES_DISPONIVEIS.map((cor) => (
        <button
          key={cor}
          onClick={() => aoSelecionar(cor)}
          style={{
            backgroundColor: cor,
            width: '36px',
            height: '36px',
            borderRadius: '50%', // Bolinha (ou use '4px' para quadrado)
            border: cor === '#FFFFFF' ? '1px solid #ccc' : 'none', // Borda sutil se for branco
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: corSelecionada === cor ? '0 0 0 2px #333' : 'none', // Destaque na selecionada
            transition: 'transform 0.1s'
          }}
          title={cor} // Mostra o código ao passar o mouse
        >
          {/* Se for a cor selecionada, mostra o ícone de Check */}
          {corSelecionada === cor && (
            <Check size={16} color={cor === '#000000' || cor === '#1F497D' ? '#FFF' : '#000'} />
          )}
        </button>
      ))}
    </div>
  );
}