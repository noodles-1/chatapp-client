import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket"
import PopupBg from "./PopupBg";

const LeavePopup = ({ leavePopup, setLeavePopup, sendChat }) => {
    const user = JSON.parse(localStorage.getItem('curr_user'))

    const navigate = useNavigate()

    const handleLeave = () => {
        const body = {
            userId: user._id.valueOf(),
            convoId: leavePopup
        }

        fetch('/api/leave-convo', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
            .then(() => {
                sendChat('aaaaaaaaaaaaaaaaaaaaaaaa', 'announcement', `${user.userName} has left the conversation.`, leavePopup)
                socket.emit('update convos', leavePopup)
                socket.emit('leave convo', leavePopup)
                navigate('/')
                setLeavePopup(null)
            })
    }

    return (
        <>
            <PopupBg item={leavePopup} setItem={setLeavePopup} />
            <div className={`leave-popup ${leavePopup ? 'open-leave-popup' : ''}`}>
                Are you sure you want to leave?
                <div className="flex items-center justify-center w-full">
                    <input 
                        type="button" 
                        value="Yes" 
                        className="bg-blue hover:bg-dark-blue"
                        onClick={handleLeave}
                    />
                    <input 
                        type="button" 
                        value="No" 
                        className="bg-slate-800 hover:bg-slate-900"
                        onClick={() => setLeavePopup(null)}
                    />
                </div>
            </div>
        </>
    );
}
 
export default LeavePopup;