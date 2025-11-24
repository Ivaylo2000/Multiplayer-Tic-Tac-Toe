import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./main.scss";
import HomePage from "./pages/Home";
import GamePage from "./pages/Game";
import NotFound from "./pages/NotFound";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/game/:roomId" element={<GamePage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;
