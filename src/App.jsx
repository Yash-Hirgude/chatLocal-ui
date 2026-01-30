import Home from "./pages/HomePage/Home"
import Chat from "./pages/ChatPage/Chat"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import AppGuard from "./components/AppGuard";

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <AppGuard>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/group/:groupId" element={<Chat />} />
          </Routes>
        </AppGuard>
      </BrowserRouter>
    </SocketProvider>
  )
}

export default App
