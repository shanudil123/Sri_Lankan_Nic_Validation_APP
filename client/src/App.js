import "./App.css";
import UploadFiles from "./components/UploadFiles";
import Dashboard from "./components/Dashboard";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Report from "./components/Reports";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import SuccessPage from "./SuccessPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import MaleUsers from "./components/MaleUsers";
import FemaleUsers from "./components/FemaleUsers";
import RejectedRecords from "./components/RejectedRecords";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<Report />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/upload" element={<UploadFiles />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/male-users" element={<MaleUsers />} />
          <Route path="/female-users" element={<FemaleUsers />} />
          <Route path="/rejected-records" element={<RejectedRecords />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
