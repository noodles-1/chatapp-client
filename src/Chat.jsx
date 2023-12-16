import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import useIsInViewport from "./hooks/useIsInViewport"
import useGetConvo from "./hooks/useGetConvo"
import useGetChats from "./hooks/useGetChats"
import useCheckInConvo from "./hooks/useCheckInConvo"
import ChatBox from "./animations/ChatBox"
import Loading from "./animations/Loading"
import { socket } from "./socket/socket"
import InfiniteScroll from "react-infinite-scroll-component"
import { useDispatch, useSelector } from "react-redux"
import { mobileHide, mobileShow } from "./redux/shown"

const Chat = ({ sendChat }) => {
    const user = JSON.parse(localStorage.getItem('curr_user'))

    const { convoId } = useParams()

    const [message, setMessage] = useState('')
    const [trimmedMessage, setTrimmedMessage] = useState('')
    const [isEnabled, setEnabled] = useState(false)
    const [chatId, setChatId] = useState(null)
    const [isSeen, setSeen] = useState(false)
    const [usersTyping, setUsersTyping] = useState([])
    const [arr, setArr] = useState([])
    const [temp, setTemp] = useState([])
    
    const { result, isLoading } = useCheckInConvo(convoId, user._id.valueOf())
    const { chats, next, isConnected: isChatsConnected, loadNextChats } = useGetChats(convoId)
    const { convo } = useGetConvo(convoId)

    const ref = useRef(null)
    const textRef = useRef(null)
    const isInViewport = useIsInViewport(ref)

    const navigate = useNavigate()

    const { shown } = useSelector((state) => state.shown)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!isLoading && result.length == 0)
            navigate('/')
        setUsersTyping([])
        setMessage('')

        dispatch(mobileShow())

        socket.on('add to typing', data => {
            if (data.convoId === convoId)
                setUsersTyping(prev => [...prev, data])
        })

        socket.on('remove from typing', data => {
            if (data.convoId === convoId)
                setUsersTyping(prev => prev.filter(elem => elem.userId != data.userId))
        })

        return () => {
            socket.off('add to typing')
            socket.off('remove from typing')
        }
    }, [convoId])

    useEffect(() => {
        if (chats.length > 0)
            setChatId(chats[0]._id.valueOf())
    }, [chats])
    
    useEffect(() => {
        if (isSeen && chatId && shown) {
            const body = {
                chatId: chatId,
                viewerId: user._id.valueOf()
            }
            fetch(`/api/chat-seen/`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
                .then(() => {
                    socket.emit('update self', {})
                })
        }
    }, [isSeen, chatId, shown])

    useEffect(() => {
        setSeen(isSeen || isInViewport)
    }, [isInViewport])

    useEffect(() => {
        setTrimmedMessage(message.trim())
    }, [message])

    useEffect(() => {
        setArr([])
        setTemp([...convoId])
    }, [usersTyping])

    useEffect(() => {
        for (let i = 0; i < Math.min(3, usersTyping.length); i++)
            setArr(prev => [...prev, <img key={usersTyping[i].userId} src={usersTyping[i].profilePicture} />])
    }, [temp])

    useEffect(() => {
        const body = {
            userId: user._id.valueOf(),
            profilePicture: user.profilePicture,
            convoId: convoId
        }
        if (isEnabled)
            socket.emit('add to typing', body)
        else
            socket.emit('remove from typing', body)
    }, [isEnabled])

    useEffect(() => {
        setEnabled(trimmedMessage.length > 0)
    }, [trimmedMessage])

    const handleInputGrow = (e) => {
        e.target.style.height = '38px'
        e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`
    }

    const handleEnter = (e) => {
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault()
            handleSend()
            e.target.style.height = '38px'
        }
    }

    const handleSend = async () => {
        if (isEnabled) {
            await sendDateAnnouncement()
            await sendChat(user._id.valueOf(), 'message', trimmedMessage, convoId)
            setMessage('')
            textRef.current.style.height = '38px'
        }
    }

    const sendDateAnnouncement = async () => {
        const present = new Date()
        const presentDate = present.getDate()
        const presentMonth = present.getMonth()
        const presentYear = present.getFullYear()

        const last = new Date(chats[0].created)
        const lastDate = last.getDate()
        const lastMonth = last.getMonth()
        const lastYear = last.getFullYear()

        if (presentDate != lastDate || presentMonth != lastMonth || presentYear != lastYear)
            await sendChat('aaaaaaaaaaaaaaaaaaaaaaaa', 'announcement', 'date', convoId)
    }

    const handleBack = () => {
        dispatch(mobileHide())
        navigate('/')
    }

    return (
        <>
            <div className="chat-header">
                <img 
                    src="/back.png" 
                    className="back block sm:hidden" 
                    onClick={handleBack}
                />
                <img src={convo && convo.convoPicture} className="chat-header-img" />
                <div className="flex grow">
                    <div className="chat-header-name">
                        {convo ? convo.convoName : 'Loading...'}
                    </div>
                </div>
                <img src="/info.png" className="chat-info-img" onClick={() => navigate(`/info/${convoId}`)}/>
            </div>
            <div id="chat-convo" className="chat-convo">
                <InfiniteScroll
                    dataLength={chats.length}
                    next={loadNextChats}
                    hasMore={next}
                    loader={
                        <div className="w-full flex items-center justify-center py-[10px]">
                            <Loading />
                        </div>
                    }
                    style={{ display: 'flex', flexDirection: 'column-reverse' }}
                    inverse={true}
                    scrollableTarget="chat-convo"
                >
                    <div className="chat-messages">
                        <span ref={ref}></span>
                        {result.length > 0 && chats.length > 0 && (
                            chats.map((chat, i) =>
                                (chat.category == 'message' ? (
                                    <div 
                                        className={`${chat.senderId.valueOf() === user._id.valueOf() ? 'curr-user' : 'other-user'} 
                                            ${(i < chats.length - 1 &&
                                                chats[i + 1].senderId.valueOf() === chat.senderId) ? 'consecutive-msg' : ''}`}
                                        key={chat._id.valueOf()}
                                    >
                                        <h1> {chat.user[0].userName} </h1>
                                        <div className="flex">
                                            <img src={chat.user[0].profilePicture} />
                                            <div className="chat-message">
                                                <p> {chat.content} </p>
                                            </div>
                                            <div className="chat-message-time">
                                                {new Date(chat.created).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={chat._id.valueOf()} className="chat-announcement">
                                        {chat.content == 'date' ? new Date(chat.created).toLocaleDateString([], {month: 'long', day: 'numeric', year: 'numeric'}) : chat.content}
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </InfiniteScroll>
            </div>
            {usersTyping.length > 0 && 
                <div className="chat-typing">
                    {arr}
                    <ChatBox />
                </div>
            }
            <div className="chat-input">
                <textarea 
                    ref={textRef}
                    className="chat-message-input" 
                    placeholder="Aa" 
                    onInput={handleInputGrow}
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
 
export default Chat;