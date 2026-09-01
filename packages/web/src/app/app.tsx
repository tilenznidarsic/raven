import { Route, Routes } from 'react-router';
import ControlPage from '../pages/ControlPage';
import HomePage from '../pages/HomePage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/control" element={<ControlPage />} />
      {/* Controller-specific subpaths, e.g. /control/raven-1, go here */}
    </Routes>
  );
}

export default App;
