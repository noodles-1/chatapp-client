import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { s3 } from "./config/config"

const Register = () => {
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [isValidName, setValidName] = useState(false)
    const [isEnabled, setEnabled] = useState(false)
    const [isUserExisting, setUserExisting] = useState(false)
    const [imgInput, setImgInput] = useState(null)
    const [img, setImg] = useState('/default-picture.png')

    const navigate = useNavigate()

    useEffect(() => {
        if (userName.length > 0 && isValidName && password.length > 0 && imgInput && !isUserExisting)
            setEnabled(true)
        else
            setEnabled(false)
    }, [userName, isValidName, password, imgInput, isUserExisting])

    useEffect(() => {
        if (isValidName && userName.length > 0) {
            fetch(`${import.meta.env.VITE_SERVER_URL}/api/check-username-existing/${userName}`)
                .then(response => response.json())
                .then(data => setUserExisting(data.length > 0))
                .catch(err => console.log(err))
        }
    }, [userName])

    const handleUserName = (e) => {
        const name = e.target.value
        const withEmojis = /\p{Extended_Pictographic}/u
        const withSpaces = /\s/g
        const withSpecialCharacters = /^[a-zA-Z0-9_.]*$/

        if (withEmojis.test(name) || withSpaces.test(name) || !withSpecialCharacters.test(name) || name.length > 20)
            setValidName(false)
        else {
            setValidName(true)
            setUserName(name)
        }
    }

    const handlePassword = (e) => {
        const pass = e.target.value
        const withEmojis = /\p{Extended_Pictographic}/u

        if (!withEmojis.test(pass))
            setPassword(pass)
    }

    const handleRegister = () => {
        if (isEnabled) {
            const params = {
                Bucket: 'noodelzchatappbucket',
                Key: imgInput.name,
                Body: imgInput
            }

            s3.upload(params, (error, data) => {
                if (error)
                    console.error("Error uploading image:", error);
                else {
                    const body = { 
                        userName: userName,
                        password: password,
                        profilePicture: data.Location
                    }

                    fetch(import.meta.env.VITE_SERVER_URL + '/api/register', {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    })
                        .then(() => navigate('/'))
                        .catch(err => console.log(err))
                }
            })
        }
    }

    const handleImg = (e) => {
        const file = e.target.files[0]
        setImg(URL.createObjectURL(file))
        setImgInput(file)
    }

    return (
        <div className="register-box">
            <img src="/back.png" className="back" onClick={() => navigate(-1)} />
            <div className="flex flex-col items-center">
                <h1 className="text-slate-100 text-[24px] text-center mt-[20px]"> create an account </h1>
                <p className="text-slate-300 mt-[10px]"> username </p>
                <input 
                    type="text" 
                    id="username-input"
                    value={userName}
                    onChange={handleUserName}
                />
                <div className={`px-[64px] char-counter ${userName.length >= 20 ? 'char-counter-red' : ''}`}>
                    {userName.length} / 20 characters
                </div>
                {isUserExisting &&
                    <div className='px-[64px] char-counter char-counter-red'>
                        Username already exists!
                    </div>
                }
                <p className="text-slate-300 mt-[10px]"> password </p>
                <p className="text-slate-500"> don't put your real password </p>
                <input 
                    type="password" 
                    id="password-input"
                    value={password}
                    onChange={handlePassword}
                />
                <p className="text-slate-300 mt-[10px]"> profile picture </p>
                <div className="relative my-[10px]">
                    <img src={img} className="info-img" />
                    <label htmlFor="imageUpload" className="change-info-img text-white">
                        <input type="file" id="imageUpload" accept="image/*" onChange={handleImg} />
                        CHANGE PHOTO
                    </label>
                </div>
                <button 
                    className={`register-btn ${isEnabled ? '' : 'register-btn-disabled'}`}
                    onClick={handleRegister}
                > 
                    Create account 
                </button>
            </div>
        </div>
    );
}
 
export default Register;