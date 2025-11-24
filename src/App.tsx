import { useState } from 'react';
import SpiderDiagram from './components/SpiderDiagram';
import YearView from './components/YearView';
import GlobalPlayer from './components/GlobalPlayer';
import { PlayerProvider } from './context/PlayerContext';
import type { DiscographyData } from './types';
import { discography } from './data/discography';

function App() {
  const [selectedYear, setSelectedYear] = useState<DiscographyData | null>(null);

  return (
    <PlayerProvider>
      <div className="w-full h-screen relative overflow-hidden bg-slate-900 text-white">
        <div className={`absolute inset-0 transition-opacity duration-500 ${selectedYear ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <SpiderDiagram data={discography} onYearSelect={setSelectedYear} />
        </div>
        
        {selectedYear && (
          <div className="absolute inset-0 z-10 bg-slate-900">
             <YearView 
               yearData={selectedYear} 
               allDiscography={discography}
               onBack={() => setSelectedYear(null)}
               onYearChange={setSelectedYear}
             />
          </div>
        )}
        
        <GlobalPlayer />
      </div>
    </PlayerProvider>
  );
}

export default App;
