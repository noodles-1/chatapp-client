import { useEffect, useRef, useState } from 'react';
import Select from 'react-select'
import useGetUsers from './hooks/useGetUsers';
import { useNavigate } from 'react-router-dom';
import { socket } from './socket/socket';
import { s3 } from "./config/config"
import { useDispatch } from 'react-redux';
import { mobileHide } from './redux/shown';

const CreateChat = ({ sendChat, addMembers }) => {
    const customStyles = {
        control: (base, state) => ({
            ...base,
            background: "#03101e",
            // match with the menu
            borderRadius: '16px',
            // Overwrittes the different states of border
            borderColor: 'none',
            // Removes weird border around container
            boxShadow: state.isFocused ? null : null,
            width: '240px',
            marginTop: '10px',
        }),
        menu: base => ({
            ...base,
            color: '#fff',
            // override border radius to match the box
            borderRadius: 0,
            // kill the gap
            marginTop: 0,
            background: "#03101e",
        }),
        menuList: base => ({
            ...base,
            // kill the white space on first and last option
            padding: 0,
            background: "#03101e",
        }),
        input: base => ({
            ...base,
            color: '#fff'
        }),
        multiValue: base => ({
            ...base,
            background: "#144272"
        }),
        multiValueLabel: base => ({
            ...base,
            color: "#fff"
        })
    };

    const user = JSON.parse(localStorage.getItem('curr_user')) 

    const handleInputGrow = (e) => {
        e.target.style.height = '38px'
        e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`
    }

    const [options, setOptions] = useState([])
    const [message, setMessage] = useState('')
    const [trimmedMessage, setTrimmedMessage] = useState('')
    const [name, setName] = useState('')
    const [trimmedName, setTrimmedName] = useState('')
    const [members, setMembers] = useState([])
    const [isEnabled, setEnabled] = useState(false)
    const [convos, setConvos] = useState([])
    const [requestMembers, setRequestMembers] = useState([])
    const [responseData, setResponseData] = useState(null)
    const [imgInput, setImgInput] = useState(null)
    const [img, setImg] = useState('/default-chat-picture.png')

    const textRef = useRef()

    const { users, isLoading: isUsersLoading } = useGetUsers(user._id.valueOf())

    const navigate = useNavigate()

    const dispatch = useDispatch()

    useEffect(() => {
        fetch(`/api/check-same-users-in-convo/${JSON.stringify(requestMembers)}`)
            .then(response => response.json())
            .then(data => setConvos(data))
            .catch(err => console.log(err))
    }, [requestMembers])

    useEffect(() => {
        if (members.length) {
            const temp = members.map((elem) => elem)
            setRequestMembers([...temp, { value: user._id.valueOf(), label: user.userName }])
        }
        else setConvos([])
    }, [members])

    useEffect(() => {
        if (!isUsersLoading)
            setOptions(users.map((member) => ({ value: member._id.valueOf(), label: member.userName })))
    }, [isUsersLoading])

    useEffect(() => {
        setTrimmedName(name.trim())
    }, [name])

    useEffect(() => {
        setEnabled(members.length > 0 && trimmedName.length > 0 && trimmedMessage.length > 0 && !convos.length && imgInput)
    }, [members, trimmedName, trimmedMessage, convos, imgInput])

    useEffect(() => {
        setTrimmedMessage(message.trim())
    }, [message])

    useEffect(() => {
        async function handleResponse() {
            if (responseData) { 
                addMembers(responseData._id.valueOf(), requestMembers)
                requestMembers.map(member => {
                    socket.emit('join this user in room', { convoId: responseData._id.valueOf(), userId: member.value })
                })
                await sendChat('aaaaaaaaaaaaaaaaaaaaaaaa', 'announcement', `${user.userName} has created a new conversation.`, responseData._id.valueOf())
                await sendChat('aaaaaaaaaaaaaaaaaaaaaaaa', 'announcement', 'date', responseData._id.valueOf())
                await sendChat(user._id.valueOf(), 'message', trimmedMessage, responseData._id.valueOf())
                navigate(`/chats/${responseData._id.valueOf()}`)
            }
        }
        handleResponse()
    }, [responseData])

    const handleName = (e) => {
        const charCount = e.target.value.trim().length
        if (charCount <= 60)
            setName(e.target.value)
    }

    const handleCreate = () => {
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
                        convoName: trimmedName,
                        convoPicture: data.Location
                    }

                    fetch('/api/create-convo', {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    })
                        .then(response => response.json())
                        .then(data => setResponseData(data))
                        .catch(err => console.log(err))
                }
            })
        }
    }

    const handleEnter = (e) => {
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault()
            handleCreate()
            e.target.style.height = '38px'
        }
    }

    const handleSend = () => {
        if (isEnabled) {
            handleCreate()
            textRef.current.style.height = '38px'
        }
    }

    const handleImg = (e) => {
        const file = e.target.files[0]
        setImg(URL.createObjectURL(file))
        setImgInput(file)
    }

    return (
        <>
            <div className="chat-header">
                <img 
                    src="/back.png" 
                    className="back block sm:hidden" 
                    onClick={() => dispatch(mobileHide())}
                />
                <div className="flex grow">
                    <div className="chat-header-name">
                        Create new conversation
                    </div>
                </div>
            </div>
            <div className="chat-convo">
                <div className="create-convo-main">
                    <h1 className="font-semibold"> Add members </h1>
                    <Select
                        isMulti
                        options={options}
                        styles={customStyles}
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary25: '#205295'
                            }
                        })}
                        onChange={(choice) => setMembers(choice)}
                    />
                    {convos.length > 0 && <p> You are already in a conversation with these members. </p>}
                    <h1 className="font-semibold mt-[80px]"> Conversation name </h1>
                    <input 
                        type="text" 
                        id="convo-name-input"
                        onChange={handleName}
                        value={name}
                    />
                    <div className={`char-counter ${trimmedName.length >= 60 ? 'char-counter-red' : ''}`}>
                        {trimmedName.length} / 60 characters
                    </div>
                    <h1 className="font-semibold mt-[80px]"> Conversation picture </h1>
                    <div className="relative my-[10px]">
                        <img src={img} className="info-img" />
                        <label htmlFor="imageUpload" className="change-info-img">
                            <input type="file" id="imageUpload" accept="image/*" onChange={handleImg} />
                            CHANGE PHOTO
                        </label>
                    </div>
                </div>
            </div>
            <div className="chat-input">
                <textarea 
                    ref={textRef}
                    placeholder="Aa" 
                    onInput={handleInputGrow}
                    className="chat-message-input" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleEnter}
                />
                <div className="h-full py-[10px] flex flex-col-reverse">
                    <img 
                        src="/send.png" 
                        className={`chat-send-img ${isEnabled ? '' : 'chat-send-img-disabled'}`}
                        onClick={handleSend}
                    />
                </div>
            </div>
        </>
    );
}
 
export default CreateChat;