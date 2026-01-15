import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./components/Chat";
import Enter from "./components/Enter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Enter />} />
        <Route path="/chat/:roomId" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
