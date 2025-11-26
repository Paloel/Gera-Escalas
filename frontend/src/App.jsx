import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { EditorEscala } from './pages/EditorEscala';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* A Rota agora pede o ID único da escala */}
        <Route path="/editor/:id" element={<EditorEscala />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;