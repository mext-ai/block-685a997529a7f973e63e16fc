import React, { useEffect, useState } from 'react';

interface BlockProps {
  title?: string;
  description?: string;
}

interface Bone {
  id: string;
  name: string;
  x: number;
  y: number;
  lineEndX: number;
  lineEndY: number;
  isCorrect?: boolean;
  userAnswer?: string;
}

const bones: Bone[] = [
  { id: 'skull', name: 'Crâne', x: 120, y: 40, lineEndX: 200, lineEndY: 70 },
  { id: 'clavicle', name: 'Clavicule', x: 80, y: 120, lineEndX: 170, lineEndY: 140 },
  { id: 'sternum', name: 'Sternum', x: 280, y: 160, lineEndX: 200, lineEndY: 180 },
  { id: 'ribs', name: 'Côtes', x: 100, y: 200, lineEndX: 160, lineEndY: 200 },
  { id: 'humerus', name: 'Humérus', x: 80, y: 180, lineEndX: 150, lineEndY: 200 },
  { id: 'radius', name: 'Radius', x: 60, y: 260, lineEndX: 140, lineEndY: 280 },
  { id: 'ulna', name: 'Cubitus', x: 40, y: 300, lineEndX: 150, lineEndY: 300 },
  { id: 'spine', name: 'Colonne vertébrale', x: 320, y: 240, lineEndX: 200, lineEndY: 260 },
  { id: 'pelvis', name: 'Bassin', x: 300, y: 320, lineEndX: 200, lineEndY: 340 },
  { id: 'femur', name: 'Fémur', x: 120, y: 380, lineEndX: 185, lineEndY: 420 },
  { id: 'tibia', name: 'Tibia', x: 100, y: 480, lineEndX: 180, lineEndY: 500 },
  { id: 'fibula', name: 'Péroné', x: 80, y: 520, lineEndX: 195, lineEndY: 530 }
];

const Block: React.FC<BlockProps> = ({ title = "Jeu de Reconnaissance des Os", description }) => {
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [draggedLabel, setDraggedLabel] = useState<string | null>(null);
  const [availableLabels, setAvailableLabels] = useState<string[]>(
    bones.map(bone => bone.name).sort(() => Math.random() - 0.5)
  );
  const [score, setScore] = useState<number>(0);
  const [results, setResults] = useState<{ [key: string]: boolean }>({});

  // Envoi de l'événement de completion
  useEffect(() => {
    if (gameState === 'finished') {
      window.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'bone-recognition-game', 
        completed: true,
        score: score,
        maxScore: 100
      }, '*');
      window.parent?.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'bone-recognition-game', 
        completed: true,
        score: score,
        maxScore: 100
      }, '*');
    }
  }, [gameState, score]);

  const handleDragStart = (e: React.DragEvent, label: string) => {
    setDraggedLabel(label);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, boneId: string) => {
    e.preventDefault();
    if (draggedLabel) {
      setUserAnswers(prev => ({
        ...prev,
        [boneId]: draggedLabel
      }));
      setAvailableLabels(prev => prev.filter(label => label !== draggedLabel));
      setDraggedLabel(null);
    }
  };

  const removeAnswer = (boneId: string) => {
    const removedLabel = userAnswers[boneId];
    if (removedLabel) {
      setAvailableLabels(prev => [...prev, removedLabel].sort());
      setUserAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[boneId];
        return newAnswers;
      });
    }
  };

  const checkAnswers = () => {
    const newResults: { [key: string]: boolean } = {};
    let correctCount = 0;

    bones.forEach(bone => {
      const userAnswer = userAnswers[bone.id];
      const isCorrect = userAnswer === bone.name;
      newResults[bone.id] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    const finalScore = Math.round((correctCount / bones.length) * 100);
    setScore(finalScore);
    setGameState('finished');
  };

  const resetGame = () => {
    setGameState('playing');
    setUserAnswers({});
    setAvailableLabels(bones.map(bone => bone.name).sort(() => Math.random() - 0.5));
    setScore(0);
    setResults({});
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent ! Vous maîtrisez parfaitement l'anatomie ! 🏆";
    if (score >= 75) return "Très bien ! Vous avez de bonnes connaissances anatomiques ! 👏";
    if (score >= 60) return "Bien ! Continuez à étudier pour vous améliorer ! 📚";
    if (score >= 40) return "Passable. Il faut réviser un peu plus ! 💪";
    return "Il faut étudier davantage l'anatomie ! Ne vous découragez pas ! 📖";
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        color: '#2c3e50'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{title}</h1>
        <p style={{ margin: '0', fontSize: '1.1rem', opacity: 0.8 }}>
          Glissez les étiquettes vers les os correspondants
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Zone du squelette */}
        <div style={{
          flex: '1',
          minWidth: '400px',
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <svg
            width="400"
            height="600"
            viewBox="0 0 400 600"
            style={{ border: '2px solid #e0e0e0', borderRadius: '10px' }}
          >
            {/* Définition des dégradés */}
            <defs>
              <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#f8f9fa', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#e9ecef', stopOpacity: 1}} />
              </linearGradient>
              <radialGradient id="skullGradient" cx="50%" cy="30%" r="70%">
                <stop offset="0%" style={{stopColor: '#f8f9fa', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#dee2e6', stopOpacity: 1}} />
              </radialGradient>
            </defs>

            {/* Squelette amélioré */}
            {/* Crâne de pirate réaliste */}
            <g>
              {/* Forme principale du crâne */}
              <path d="M 200 35 
                       Q 230 35 240 55 
                       Q 245 75 240 85
                       Q 235 95 220 98
                       L 210 105
                       Q 205 107 200 107
                       Q 195 107 190 105
                       L 180 98
                       Q 165 95 160 85
                       Q 155 75 160 55
                       Q 170 35 200 35 Z" 
                    fill="url(#skullGradient)" 
                    stroke="#2c3e50" 
                    strokeWidth="2"/>
              
              {/* Sutures du crâne */}
              <path d="M 170 50 Q 200 45 230 50" fill="none" stroke="#2c3e50" strokeWidth="1" opacity="0.6"/>
              <path d="M 175 65 Q 200 60 225 65" fill="none" stroke="#2c3e50" strokeWidth="1" opacity="0.6"/>
              
              {/* Orbites oculaires creuses (plus grandes et plus sombres) */}
              <ellipse cx="185" cy="60" rx="8" ry="12" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              <ellipse cx="215" cy="60" rx="8" ry="12" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              
              {/* Cavité nasale triangulaire */}
              <path d="M 200 70 L 195 85 L 205 85 Z" fill="#2c3e50" stroke="#1a252f" strokeWidth="1.5"/>
              
              {/* Mâchoire supérieure */}
              <rect x="190" y="85" width="20" height="8" fill="url(#skullGradient)" stroke="#2c3e50" strokeWidth="1.5" rx="2"/>
              
              {/* Dents */}
              <rect x="192" y="93" width="2" height="6" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="195" y="93" width="2" height="8" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="198" y="93" width="2" height="7" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="201" y="93" width="2" height="8" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="204" y="93" width="2" height="7" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="207" y="93" width="2" height="6" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              
              {/* Mâchoire inférieure */}
              <path d="M 185 100 Q 200 108 215 100 Q 210 115 200 115 Q 190 115 185 100 Z" 
                    fill="url(#skullGradient)" stroke="#2c3e50" strokeWidth="1.5"/>
              
              {/* Dents inférieures */}
              <rect x="192" y="100" width="2" height="5" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="195" y="100" width="2" height="6" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="198" y="100" width="2" height="6" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="201" y="100" width="2" height="6" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="204" y="100" width="2" height="6" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              <rect x="207" y="100" width="2" height="5" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="0.5"/>
              
              {/* Fissures et détails du crâne */}
              <path d="M 175 70 Q 180 75 175 80" fill="none" stroke="#2c3e50" strokeWidth="1" opacity="0.5"/>
              <path d="M 225 70 Q 220 75 225 80" fill="none" stroke="#2c3e50" strokeWidth="1" opacity="0.5"/>
              
              {/* Trous temporaux */}
              <circle cx="165" cy="70" r="3" fill="#34495e" stroke="#2c3e50" strokeWidth="1"/>
              <circle cx="235" cy="70" r="3" fill="#34495e" stroke="#2c3e50" strokeWidth="1"/>
            </g>
            
            {/* Cou */}
            <rect x="195" y="115" width="10" height="15" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="2"/>
            
            {/* Colonne vertébrale avec vertèbres visibles */}
            <g>
              <line x1="200" y1="130" x2="200" y2="340" stroke="#2c3e50" strokeWidth="5"/>
              {Array.from({length: 15}, (_, i) => (
                <circle key={i} cx="200" cy={140 + i * 14} r="3" fill="#34495e"/>
              ))}
            </g>
            
            {/* Clavicules avec forme courbe */}
            <path d="M 165 135 Q 180 130 200 135 Q 220 130 235 135" 
                  fill="none" stroke="#2c3e50" strokeWidth="4" strokeLinecap="round"/>
            
            {/* Sternum avec détails */}
            <g>
              <rect x="195" y="150" width="10" height="70" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="2" rx="2"/>
              <line x1="195" y1="170" x2="205" y2="170" stroke="#2c3e50" strokeWidth="1"/>
              <line x1="195" y1="190" x2="205" y2="190" stroke="#2c3e50" strokeWidth="1"/>
              <line x1="195" y1="210" x2="205" y2="210" stroke="#2c3e50" strokeWidth="1"/>
            </g>
            
            {/* Côtes avec forme anatomique */}
            <g>
              {/* Côtes supérieures */}
              <path d="M 195 155 Q 160 165 165 180 Q 170 190 195 175" fill="none" stroke="#2c3e50" strokeWidth="2"/>
              <path d="M 205 155 Q 240 165 235 180 Q 230 190 205 175" fill="none" stroke="#2c3e50" strokeWidth="2"/>
              
              {/* Côtes moyennes */}
              <path d="M 195 175 Q 150 185 155 210 Q 160 225 195 205" fill="none" stroke="#2c3e50" strokeWidth="2"/>
              <path d="M 205 175 Q 250 185 245 210 Q 240 225 205 205" fill="none" stroke="#2c3e50" strokeWidth="2"/>
              
              {/* Côtes inférieures */}
              <path d="M 195 205 Q 160 215 165 235 Q 170 245 195 230" fill="none" stroke="#2c3e50" strokeWidth="2"/>
              <path d="M 205 205 Q 240 215 235 235 Q 230 245 205 230" fill="none" stroke="#2c3e50" strokeWidth="2"/>
              
              {/* Côtes flottantes */}
              <path d="M 195 230 Q 170 235 175 245" fill="none" stroke="#2c3e50" strokeWidth="2"/>
              <path d="M 205 230 Q 230 235 225 245" fill="none" stroke="#2c3e50" strokeWidth="2"/>
            </g>
            
            {/* Bras gauche avec articulations */}
            <g>
              {/* Humérus */}
              <line x1="165" y1="135" x2="150" y2="220" stroke="#2c3e50" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="165" cy="135" r="4" fill="#34495e"/> {/* Épaule */}
              <circle cx="150" cy="220" r="4" fill="#34495e"/> {/* Coude */}
              
              {/* Radius et Cubitus */}
              <line x1="150" y1="220" x2="140" y2="300" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round"/>
              <line x1="150" y1="220" x2="150" y2="300" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="145" cy="300" r="3" fill="#34495e"/> {/* Poignet */}
              
              {/* Main simplifiée */}
              <rect x="135" y="300" width="20" height="8" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="2"/>
              <rect x="137" y="308" width="4" height="12" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="1"/>
              <rect x="142" y="308" width="4" height="15" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="1"/>
              <rect x="147" y="308" width="4" height="14" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="1"/>
              <rect x="152" y="308" width="4" height="10" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="1"/>
            </g>
            
            {/* Bras droit avec articulations */}
            <g>
              {/* Humérus */}
              <line x1="235" y1="135" x2="250" y2="220" stroke="#2c3e50" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="235" cy="135" r="4" fill="#34495e"/> {/* Épaule */}
              <circle cx="250" cy="220" r="4" fill="#34495e"/> {/* Coude */}
              
              {/* Radius et Cubitus */}
              <line x1="250" y1="220" x2="260" y2="300" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round"/>
              <line x1="250" y1="220" x2="250" y2="300" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="255" cy="300" r="3" fill="#34495e"/> {/* Poignet */}
              
              {/* Main simplifiée */}
              <rect x="245" y="300" width="20" height="8" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="2"/>
              <rect x="247" y="308" width="4" height="12" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="1"/>
              <rect x="252" y="308" width="4" height="15" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="1"/>
              <rect x="257" y="308" width="4" height="14" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="1"/>
              <rect x="262" y="308" width="4" height="10" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="1" rx="1"/>
            </g>
            
            {/* Bassin avec forme anatomique */}
            <g>
              <ellipse cx="200" cy="340" rx="40" ry="25" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="3"/>
              <ellipse cx="200" cy="340" rx="30" ry="15" fill="none" stroke="#2c3e50" strokeWidth="1"/>
              <circle cx="175" cy="350" r="6" fill="none" stroke="#2c3e50" strokeWidth="2"/> {/* Hanche gauche */}
              <circle cx="225" cy="350" r="6" fill="none" stroke="#2c3e50" strokeWidth="2"/> {/* Hanche droite */}
            </g>
            
            {/* Jambes avec articulations */}
            <g>
              {/* Fémurs */}
              <line x1="180" y1="360" x2="185" y2="480" stroke="#2c3e50" strokeWidth="6" strokeLinecap="round"/>
              <line x1="220" y1="360" x2="215" y2="480" stroke="#2c3e50" strokeWidth="6" strokeLinecap="round"/>
              <circle cx="185" cy="480" r="5" fill="#34495e"/> {/* Genou gauche */}
              <circle cx="215" cy="480" r="5" fill="#34495e"/> {/* Genou droit */}
              
              {/* Tibias et Péronés */}
              <line x1="185" y1="480" x2="180" y2="560" stroke="#2c3e50" strokeWidth="4" strokeLinecap="round"/> {/* Tibia gauche */}
              <line x1="185" y1="480" x2="195" y2="560" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round"/> {/* Péroné gauche */}
              
              <line x1="215" y1="480" x2="220" y2="560" stroke="#2c3e50" strokeWidth="4" strokeLinecap="round"/> {/* Tibia droit */}
              <line x1="215" y1="480" x2="205" y2="560" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round"/> {/* Péroné droit */}
              
              <circle cx="187" cy="560" r="3" fill="#34495e"/> {/* Cheville gauche */}
              <circle cx="212" cy="560" r="3" fill="#34495e"/> {/* Cheville droite */}
              
              {/* Pieds simplifiés */}
              <ellipse cx="175" cy="570" rx="15" ry="8" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="2"/>
              <ellipse cx="225" cy="570" rx="15" ry="8" fill="url(#boneGradient)" stroke="#2c3e50" strokeWidth="2"/>
            </g>

            {/* Lignes et zones de drop pour chaque os avec étiquettes visibles */}
            {bones.map(bone => (
              <g key={bone.id}>
                {/* Ligne de connexion */}
                <line 
                  x1={bone.x} 
                  y1={bone.y} 
                  x2={bone.lineEndX} 
                  y2={bone.lineEndY} 
                  stroke={gameState === 'finished' ? (results[bone.id] ? '#27ae60' : '#e74c3c') : '#7f8c8d'} 
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                
                {/* Zone de drop */}
                <circle
                  cx={bone.x}
                  cy={bone.y}
                  r="15"
                  fill={
                    gameState === 'finished' 
                      ? (results[bone.id] ? '#27ae60' : '#e74c3c')
                      : userAnswers[bone.id] 
                        ? '#3498db' 
                        : '#95a5a6'
                  }
                  stroke="white"
                  strokeWidth="3"
                  style={{ cursor: 'pointer' }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, bone.id)}
                  onClick={() => gameState === 'playing' && removeAnswer(bone.id)}
                />
                
                {/* Étiquette placée visible */}
                {userAnswers[bone.id] && (
                  <g>
                    {/* Fond de l'étiquette */}
                    <rect
                      x={bone.x - 30}
                      y={bone.y - 25}
                      width="60"
                      height="16"
                      fill="rgba(255,255,255,0.95)"
                      stroke={gameState === 'finished' ? (results[bone.id] ? '#27ae60' : '#e74c3c') : '#3498db'}
                      strokeWidth="1"
                      rx="8"
                    />
                    {/* Texte de l'étiquette */}
                    <text
                      x={bone.x}
                      y={bone.y - 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill={gameState === 'finished' ? (results[bone.id] ? '#27ae60' : '#e74c3c') : '#2c3e50'}
                      fontWeight="bold"
                    >
                      {userAnswers[bone.id]}
                    </text>
                  </g>
                )}
                
                {/* Icône de validation */}
                {userAnswers[bone.id] && (
                  <text
                    x={bone.x}
                    y={bone.y + 5}
                    textAnchor="middle"
                    fontSize="12"
                    fill="white"
                    fontWeight="bold"
                  >
                    {gameState === 'finished' ? (results[bone.id] ? '✓' : '✗') : '•'}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Zone des étiquettes et contrôles */}
        <div style={{
          flex: '0 0 300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Étiquettes disponibles */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Étiquettes disponibles</h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {availableLabels.map(label => (
                <div
                  key={label}
                  draggable
                  onDragStart={(e) => handleDragStart(e, label)}
                  style={{
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '20px',
                    cursor: 'grab',
                    fontSize: '0.9rem',
                    userSelect: 'none',
                    transition: 'all 0.2s',
                    border: '2px solid transparent',
                    boxShadow: '0 2px 8px rgba(52,152,219,0.3)'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Réponses placées */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Réponses placées ({Object.keys(userAnswers).length}/{bones.length})</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {Object.entries(userAnswers).map(([boneId, answer]) => {
                const bone = bones.find(b => b.id === boneId);
                return (
                  <div
                    key={boneId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      margin: '4px 0',
                      background: gameState === 'finished' 
                        ? (results[boneId] ? 'linear-gradient(135deg, #d5f4e6 0%, #a8e6cf 100%)' : 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)')
                        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      border: gameState === 'finished' 
                        ? (results[boneId] ? '2px solid #27ae60' : '2px solid #e74c3c')
                        : '1px solid #e0e0e0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span style={{ 
                      color: gameState === 'finished' 
                        ? (results[boneId] ? '#27ae60' : '#e74c3c')
                        : '#2c3e50',
                      fontWeight: 'bold'
                    }}>
                      {gameState === 'finished' && (results[boneId] ? '✓ ' : '✗ ')}
                      {answer}
                    </span>
                    {gameState === 'playing' && (
                      <button
                        onClick={() => removeAnswer(boneId)}
                        style={{
                          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contrôles */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            {gameState === 'playing' ? (
              <button
                onClick={checkAnswers}
                disabled={Object.keys(userAnswers).length === 0}
                style={{
                  background: Object.keys(userAnswers).length === 0 
                    ? 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)' 
                    : 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '25px',
                  fontSize: '1.1rem',
                  cursor: Object.keys(userAnswers).length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: Object.keys(userAnswers).length === 0 
                    ? 'none' 
                    : '0 4px 15px rgba(39,174,96,0.3)',
                  fontWeight: 'bold'
                }}
              >
                Vérifier les réponses
              </button>
            ) : (
              <div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: score >= 75 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c',
                  margin: '0 0 10px 0',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Score: {score}%
                </div>
                <p style={{
                  margin: '0 0 20px 0',
                  color: '#2c3e50',
                  fontSize: '1rem',
                  lineHeight: '1.4'
                }}>
                  {getScoreMessage(score)}
                </p>
                <button
                  onClick={resetGame}
                  style={{
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '25px',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 15px rgba(52,152,219,0.3)',
                    fontWeight: 'bold'
                  }}
                >
                  🔄 Rejouer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Block;