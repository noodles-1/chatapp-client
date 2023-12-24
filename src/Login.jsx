import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket/socket"

const Login = ({ setUser }) => {
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [isEnabled, setEnabled] = useState(false)
    const [status, setStatus] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        if (userName.length > 0 && password.length > 0)
            setEnabled(true)
        else
            setEnabled(false)
    }, [userName, password])

    const handleLoginForm = () => {
        if (isEnabled) {
            const body = {
                userName: userName,
                password: password
            }

            fetch(import.meta.env.VITE_SERVER_URL + '/api/login', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
              })
                .then(response => response.json())
                .then(data => {
                    if (data.length == 0)
                        setStatus('User not found.')
                    else {
                        if (data[0].password !== password)
                            setStatus('Passwords do not match.')
                        else {
                            setUser(data[0])
                            localStorage.setItem('curr_user', JSON.stringify(data[0]))
                            socket.emit('join rooms', data[0])
                        }
                    }
                })
                .catch(err => console.log(err))
        }
    }

    return (
        <div className="login-box">
            <img src="/back.png" className="back" onClick={() => navigate(-1)} />
            <div className="flex flex-col items-center">
                <h1 className="text-slate-100 text-[24px] text-center mt-[20px]"> login </h1>
                <p className="text-slate-300 mt-[10px]"> username </p>
                <input 
                    type="text" 
                    id="username-input"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <p className="text-slate-300 mt-[10px]"> password </p>
                <p className="text-slate-500"> </p>
                <input 
                    type="password" 
                    id="password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {status &&
                    <div className='px-[64px] char-counter char-counter-red'>
                        {status}
                    </div>
                }
                <button 
                    className={`register-btn ${isEnabled ? '' : 'register-btn-disabled'}`}
                    onClick={handleLoginForm}
                > 
                    Login 
                </button>
            </div>
        </div>
    );
}
 
export default Login;