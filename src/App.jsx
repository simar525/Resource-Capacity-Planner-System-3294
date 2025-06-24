import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Resources from './pages/Resources';
import ResourceUtilization from './pages/ResourceUtilization';
import TimeEntry from './pages/TimeEntry';
import ProjectLinks from './pages/ProjectLinks';
import Reports from './pages/Reports';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import { CapacityProvider } from './context/CapacityContext';
import { ExcelProvider } from './context/ExcelContext';

function App() {
  return (
    <ExcelProvider>
      <CapacityProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/resource-utilization" element={<ResourceUtilization />} />
              <Route path="/time-entry" element={<TimeEntry />} />
              <Route path="/time-tracking" element={<TimeEntry />} />
              <Route path="/project-links" element={<ProjectLinks />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<AdvancedAnalytics />} />
            </Routes>
          </Layout>
        </Router>
      </CapacityProvider>
    </ExcelProvider>
  );
}

export default App;