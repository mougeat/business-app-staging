import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import CompanyForm from './pages/CompanyForm';
import Contacts from './pages/Contacts';
import ContactForm from './pages/ContactForm';
import Proposals from './pages/Proposals';
import ProposalForm from './pages/ProposalForm';
import Purchases from './pages/Purchases';
import Projects from './pages/Projects';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/companies" element={<PrivateRoute><Companies /></PrivateRoute>} />
    <Route path="/companies/new" element={<PrivateRoute><CompanyForm /></PrivateRoute>} />
    <Route path="/companies/:id" element={<PrivateRoute><CompanyDetail /></PrivateRoute>} />
    <Route path="/companies/:id/edit" element={<PrivateRoute><CompanyForm /></PrivateRoute>} />
    <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
    <Route path="/contacts/new" element={<PrivateRoute><ContactForm /></PrivateRoute>} />
    <Route path="/contacts/:id" element={<PrivateRoute><ContactForm /></PrivateRoute>} />
    <Route path="/proposals" element={<PrivateRoute><Proposals /></PrivateRoute>} />
    <Route path="/proposals/new" element={<PrivateRoute><ProposalForm /></PrivateRoute>} />
    <Route path="/purchases" element={<PrivateRoute><Purchases /></PrivateRoute>} />
    <Route path="/purchases/new" element={<PrivateRoute><Purchases /></PrivateRoute>} />
    <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
    <Route path="/projects/new" element={<PrivateRoute><Projects /></PrivateRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;