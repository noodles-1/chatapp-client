import { useEffect, useState } from "react"
import Login from "./Login"
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom"
import Profile from "./Profile"
import Home from "./Home"
import Register from "./Register"
import { socket } from "./socket/socket"

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currUser = localStorage.getItem('curr_user')
    if (currUser)
      setUser(true)

    socket.on('join rooms', _ => {
      socket.emit('join rooms', JSON.parse(localStorage.getItem('curr_user')))
    })
    
    socket.on('update user', data => {
      handleUser(data)
    })

    return () => {
      socket.off('join rooms')
      socket.off('update user')
    }
  }, [])

  const handleUser = (data) => {
    fetch(`/api/get-user/${data._id}`)
      .then(response => response.json())
      .then(responseData => {
        setUser(responseData)
        localStorage.setItem('curr_user', JSON.stringify(responseData))
      })
  }

  return (
    <>
      {!user ?
        ( 
          <Router>
            <Routes>
              <Route exact path="/" element={
                <>
                  <div className="login-box">
                    <h1 className="text-slate-100 text-[30px] text-center"> dattebayo-chat </h1>
                      <Link className="bg-blue h-[40px] w-full flex items-center justify-center text-white rounded-[10px]" to="/login"> Login </Link>
                      <Link className="bg-blue h-[40px] w-full flex items-center justify-center text-white rounded-[10px] mt-[10px]" to="/register"> Create an account </Link>
                    <p className="text-slate-300 text-[14px] text-center mt-[10px]"> made by noodelz </p>
                  </div>
                </>
              } />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router> 
        )
        : 
        (
          <Router>
            <Routes>
              <Route exact path="/*" element={<Home />} />
              <Route path="/profile" element={<Profile setUser={setUser} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        )
      }
    </>
  )
}

export default App
