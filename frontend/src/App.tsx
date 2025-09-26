import { Routes, Route, Navigate } from 'react-router-dom';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/orders" />} />
      <Route path="/orders" element={<OrdersPage />} />
    </Routes>
  );
}
