import React from 'react';
import logo from './logo.svg';
import './App.css';
import Buttons from './Components/UIComponents/Buttons';
import 'bootstrap/dist/css/bootstrap.min.css';
import MainCanvas from './Components/CanvasComponents/MainCanvas';

function App() {
  return (
    <div className="App">
      <MainCanvas/>
    </div>
  );
}

export default App;
