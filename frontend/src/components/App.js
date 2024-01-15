import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrgSelector from './OrgSelector';
import OpenApiHistory from './OpenApiHistory';
import RequestAnalysis from './RequestAnalysis';
import '../App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<OrgSelector />} />
          <Route path="/inbound/history/:orgId" element={<OpenApiHistory />} />
          <Route path="/inbound/history/detail/:requestId" element={<RequestAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
