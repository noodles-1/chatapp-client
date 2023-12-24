import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { s3 } from "./config/config"
import { socket } from "./socket/socket";

const Profile = ({ setUser }) => {
    const user = JSON.parse(localStorage.getItem('curr_user'))

    const navigate = useNavigate()

    const handleLogout = () => {
        setUser(null)
        localStorage.removeItem('curr_user')
        navigate('/')
    }

    const handleImgInput = (e) => {
        if (e.target.files.length == 0) return
        const img = e.target.files[0]

        const params = {
            Bucket: import.meta.env.VITE_BUCKET_NAME,
            Key: img.name,
            Body: img
        }

        s3.upload(params, (error, data) => {
            if (error)
                console.error("Error uploading image:", error);
            else {
                const body = {
                    userId: user._id,
                    profilePicture: data.Location
                }

                fetch(`${import.meta.env.VITE_SERVER_URL}/api/update-profile-picture`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                })
                    .then(() => {
                        const body = {
                            _id: user._id,
                            userName: user.userName,
                            profilePicture: user.profilePicture
                        }

                        socket.emit('update user', body)
                    })
            }
        })
    }

    return (
        <div className="mx-auto sm:my-[50px] w-full h-screen sm:max-w-[450px] sm:min-w-[350px] sm:h-[300px] bg-bg-blue box-shadow pl-[20px] pr-[20px]">
            <div className="profile-back">
                <img src="/back.png" className="back" onClick={() => navigate(-1)} />
            </div>
            <div className="flex h-[240px] px-[40px] py-[30px] text-white relative">
                <img src={user.profilePicture} className="profile-img" />
                <label htmlFor="imageUpload" className="upload-label">
                    <input type="file" id="imageUpload" accept="image/*" onChange={handleImgInput} />
                    CHANGE PHOTO
                </label>
                <div>
                    <h1 className="text-[26px] font-semibold"> {user.userName} </h1>
                    <p className="text-gray-400 text-[14px]"> Tap on the picture to change profile picture </p>
                    <p 
                        className="text-light-blue text-[18px] font-semibold cursor-pointer hover:underline"
                        onClick={() => handleLogout()}
                    > 
                        Logout 
                    </p>
                </div>
            </div>
        </div>
    );
}
 
export default Profile;