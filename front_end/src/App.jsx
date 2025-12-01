import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";

import Home from "./pages/Home";
import RestaurantPage from "./pages/RestaurantPage";
import AccountPage from "./pages/AccountPage";

import AdminPage from "./pages/AdminPage";
import AdminSignIn from "./pages/AdminSignIn";
import "./App.css";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin/login" element={<AdminSignIn />}/>

        <Route path="/home" element={<Home />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminPage />} /> 
       

      </Routes>
    </Router>
  );
}

export default App;

