import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./main.scss";
import HomePage from "./pages/Home";
import GamePage from "./pages/Game";
// import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Provider } from "react-redux";
import { store } from "./store/store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/login" element={<Login />} /> */}

          {/* Dynamic game room route */}
          <Route path="/game/:roomId" element={<GamePage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
