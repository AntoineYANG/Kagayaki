import React from 'react';
// import logo from './logo.svg';
import './App.css';
import Canvas from './Canvas';

const App: React.FC = () => {
  return (
    <div className="App">
      <Canvas width={ 1536 } height={ 864 } />
    </div>
  );
}

export default App;
