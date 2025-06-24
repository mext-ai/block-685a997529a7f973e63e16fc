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
  { id: 'skull', name: 'Crâne', x: 200, y: 50, lineEndX: 170, lineEndY: 80 },
  { id: 'clavicle', name: 'Clavicule', x: 200, y: 120, lineEndX: 180, lineEndY: 140 },
  { id: 'sternum', name: 'Sternum', x: 200, y: 160, lineEndX: 200, lineEndY: 180 },
  { id: 'ribs', name: 'Côtes', x: 200, y: 200, lineEndX: 170, lineEndY: 200 },
  { id: 'humerus', name: 'Humérus', x: 140, y: 180, lineEndX: 150, lineEndY: 200 },
  { id: 'radius', name: 'Radius', x: 130, y: 260, lineEndX: 145, lineEndY: 280 },
  { id: 'ulna', name: 'Cubitus', x: 130, y: 300, lineEndX: 155, lineEndY: 300 },
  { id: 'spine', name: 'Colonne vertébrale', x: 200, y: 240, lineEndX: 200, lineEndY: 260 },
  { id: 'pelvis', name: 'Bassin', x: 200, y: 320, lineEndX: 200, lineEndY: 340 },
  { id: 'femur', name: 'Fémur', x: 180, y: 380, lineEndX: 185, lineEndY: 400 },
  { id: 'tibia', name: 'Tibia', x: 170, y: 480, lineEndX: 180, lineEndY: 500 },
  { id: 'fibula', name: 'Péroné', x: 190, y: 520, lineEndX: 195, lineEndY: 520 }
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
            {/* Squelette simplifié */}
            {/* Crâne */}
            <circle cx="200" cy="80" r="30" fill="none" stroke="#34495e" strokeWidth="3"/>
            
            {/* Colonne vertébrale */}
            <line x1="200" y1="110" x2="200" y2="340" stroke="#34495e" strokeWidth="4"/>
            
            {/* Clavicules */}
            <line x1="170" y1="140" x2="230" y2="140" stroke="#34495e" strokeWidth="3"/>
            
            {/* Sternum */}
            <rect x="195" y="150" width="10" height="60" fill="none" stroke="#34495e" strokeWidth="2"/>
            
            {/* Côtes */}
            <ellipse cx="200" cy="180" rx="40" ry="15" fill="none" stroke="#34495e" strokeWidth="2"/>
            <ellipse cx="200" cy="200" rx="45" ry="20" fill="none" stroke="#34495e" strokeWidth="2"/>
            <ellipse cx="200" cy="220" rx="40" ry="15" fill="none" stroke="#34495e" strokeWidth="2"/>
            
            {/* Bras gauche */}
            <line x1="170" y1="140" x2="150" y2="220" stroke="#34495e" strokeWidth="3"/> {/* Humérus */}
            <line x1="150" y1="220" x2="145" y2="300" stroke="#34495e" strokeWidth="2"/> {/* Radius */}
            <line x1="150" y1="220" x2="155" y2="300" stroke="#34495e" strokeWidth="2"/> {/* Cubitus */}
            
            {/* Bras droit */}
            <line x1="230" y1="140" x2="250" y2="220" stroke="#34495e" strokeWidth="3"/>
            <line x1="250" y1="220" x2="245" y2="300" stroke="#34495e" strokeWidth="2"/>
            <line x1="250" y1="220" x2="255" y2="300" stroke="#34495e" strokeWidth="2"/>
            
            {/* Bassin */}
            <ellipse cx="200" cy="340" rx="35" ry="20" fill="none" stroke="#34495e" strokeWidth="3"/>
            
            {/* Jambes */}
            <line x1="185" y1="360" x2="185" y2="480" stroke="#34495e" strokeWidth="4"/> {/* Fémur gauche */}
            <line x1="215" y1="360" x2="215" y2="480" stroke="#34495e" strokeWidth="4"/> {/* Fémur droit */}
            
            <line x1="185" y1="480" x2="180" y2="560" stroke="#34495e" strokeWidth="3"/> {/* Tibia gauche */}
            <line x1="185" y1="480" x2="195" y2="560" stroke="#34495e" strokeWidth="2"/> {/* Péroné gauche */}
            
            <line x1="215" y1="480" x2="220" y2="560" stroke="#34495e" strokeWidth="3"/> {/* Tibia droit */}
            <line x1="215" y1="480" x2="205" y2="560" stroke="#34495e" strokeWidth="2"/> {/* Péroné droit */}

            {/* Lignes et zones de drop pour chaque os */}
            {bones.map(bone => (
              <g key={bone.id}>
                <line 
                  x1={bone.x} 
                  y1={bone.y} 
                  x2={bone.lineEndX} 
                  y2={bone.lineEndY} 
                  stroke={gameState === 'finished' ? (results[bone.id] ? '#27ae60' : '#e74c3c') : '#7f8c8d'} 
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <circle
                  cx={bone.x}
                  cy={bone.y}
                  r="12"
                  fill={
                    gameState === 'finished' 
                      ? (results[bone.id] ? '#27ae60' : '#e74c3c')
                      : userAnswers[bone.id] 
                        ? '#3498db' 
                        : '#95a5a6'
                  }
                  stroke="white"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, bone.id)}
                  onClick={() => gameState === 'playing' && removeAnswer(bone.id)}
                />
                {userAnswers[bone.id] && (
                  <text
                    x={bone.x}
                    y={bone.y + 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                  >
                    ✓
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
                    background: '#3498db',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    cursor: 'grab',
                    fontSize: '0.9rem',
                    userSelect: 'none',
                    transition: 'transform 0.2s',
                    border: '2px solid transparent'
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
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Réponses placées</h3>
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
                      padding: '8px',
                      margin: '4px 0',
                      background: gameState === 'finished' 
                        ? (results[boneId] ? '#d5f4e6' : '#ffeaa7')
                        : '#f8f9fa',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      border: gameState === 'finished' 
                        ? (results[boneId] ? '2px solid #27ae60' : '2px solid #e74c3c')
                        : '1px solid #e0e0e0'
                    }}
                  >
                    <span style={{ 
                      color: gameState === 'finished' 
                        ? (results[boneId] ? '#27ae60' : '#e74c3c')
                        : '#2c3e50'
                    }}>
                      {answer}
                    </span>
                    {gameState === 'playing' && (
                      <button
                        onClick={() => removeAnswer(boneId)}
                        style={{
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '12px'
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
                  background: Object.keys(userAnswers).length === 0 ? '#bdc3c7' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontSize: '1.1rem',
                  cursor: Object.keys(userAnswers).length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                Vérifier les réponses
              </button>
            ) : (
              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: score >= 75 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c',
                  margin: '0 0 10px 0'
                }}>
                  Score: {score}%
                </div>
                <p style={{
                  margin: '0 0 20px 0',
                  color: '#2c3e50',
                  fontSize: '1rem'
                }}>
                  {getScoreMessage(score)}
                </p>
                <button
                  onClick={resetGame}
                  style={{
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  Rejouer
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