import { Routes, Route } from "react-router-dom";
import Dashboard from './component/dashboard';
import Home from './component/home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
