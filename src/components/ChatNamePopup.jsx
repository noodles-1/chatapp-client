import { useState, useEffect } from "react";
import PopupBg from "./PopupBg";

const ChatNamePopup = ({ namePopup, setNamePopup, sendChat }) => {
    const user = JSON.parse(localStorage.getItem('curr_user'))

    const [newName, setNewName] = useState('')
    const [trimmedName, setTrimmedName] = useState('')
    const [isEnabled, setEnabled] = useState(false)

    useEffect(() => {
        if (namePopup)
            setNewName(namePopup.convo.convoName)
    }, [namePopup])

    useEffect(() => {
        setTrimmedName(newName.trim())
    }, [newName])

    useEffect(() => {
        setEnabled(trimmedName.length > 0 && trimmedName != namePopup.convo.convoName)
    }, [trimmedName])

    const handleSend = () => {
        if (isEnabled) {
            const body = { convoId: namePopup.convoId, newName: trimmedName }
            fetch('/api/set-convo-name', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
                .then(() => {
                    sendChat('aaaaaaaaaaaaaaaaaaaaaaaa', 'announcement', `${user.userName} has changed the conversation name to ${trimmedName}.`, namePopup.convoId)
                    setNamePopup(null)
                })
        }
    }

    const handleName = (e) => {
        const charCount = e.target.value.trim().length
        if (charCount <= 60)
            setNewName(e.target.value)
    }

    return (
        <>
            <PopupBg item={namePopup} setItem={setNamePopup} />
            <div
                className={`popup ${namePopup ? 'open-popup' : ''}`}
            >
                {namePopup && (
                    <>
                        {/* handle when current conversation name is the same as inputted */}
                        <h1> Change conversation name </h1>
                        <div className="flex items-center justify-center">
                            <input 
                                type="text" 
                                id="name-popup-input" 
                                value={newName}
                                onChange={handleName}
                            />                        
                            <img 
                                src="/send.png" 
                                className={`name-send-img ${isEnabled ? '' : 'name-send-img-disabled'}`}
                                onClick={handleSend}
                            />
                        </div>
                        <div className={`px-[50px] char-counter ${trimmedName.length >= 60 ? 'char-counter-red' : ''}`}>
                            {trimmedName.length} / 60 characters
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
 
export default ChatNamePopup;