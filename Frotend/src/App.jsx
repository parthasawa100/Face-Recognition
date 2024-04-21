import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login'


function App() {


  return (
    // <UserProvider >
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    // </UserProvider>
  );
}

export default App
