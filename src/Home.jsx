import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import EmptyChat from "./EmptyChat"
import CreateChat from "./CreateChat"
import Chat from "./Chat";
import InfoChat from "./InfoChat"
import ChatNamePopup from "./components/ChatNamePopup";
import AddMemberPopup from "./components/AddMemberPopup";
import LeavePopup from "./components/LeavePopup";
import useGetChatList from "./hooks/useGetChatList";
import Seen from "./components/Seen";
import { socket } from "./socket/socket";
import Loading from "./animations/Loading";
import { useDispatch, useSelector } from "react-redux";
import { mobileShow } from "./redux/shown";

const Home = () => {
    const user = JSON.parse(localStorage.getItem('curr_user'))

    const [namePopup, setNamePopup] = useState(null)
    const [memberPopup, setMemberPopup] = useState(null)
    const [leavePopup, setLeavePopup] = useState(null)
    const [search, setSearch] = useState('')
    const [searchConvos, setSearchConvos] = useState([])

    const { convos, isLoading } = useGetChatList(user._id.valueOf())

    const navigate = useNavigate()

    const { shown } = useSelector((state) => state.shown)
    const dispatch = useDispatch()

    useEffect(() => {
        if (search) {
            const encode = encodeURIComponent(search.trim())

            fetch(`/api/get-search-chat-list/${user._id.valueOf()}/${encode}`)
                .then(response => response.json())
                .then(data => {
                    data.sort((a, b) => {
                        var keyA = new Date(a.chats[0].created)
                        var keyB = new Date(b.chats[0].created)
                        return (keyA < keyB) ? 1 : -1
                    })
                    setSearchConvos(data)
                })
                .catch(err => console.log(err))
        }
        else setSearchConvos([])
    }, [search])

    useEffect(() => {
        socket.on('join this user in room', data => {
            if (data.userId === user._id.valueOf())
                socket.emit('join convo', data)
        })
    }, [])

    const handleOpenChat = (route) => {
        dispatch(mobileShow())
        navigate(route)
    }

    const displayTimeDiff = (past) => {
        var s = Math.abs(new Date() - new Date(past))

        var ms = s % 1000;
        s = (s - ms) / 1000;

        var secs = s % 60;
        s = (s - secs) / 60;

        var mins = s % 60;
        s = (s - mins) / 60

        var hrs = s % 24;
        s = (s - hrs) / 24

        var days = s % 30
        s = (s - days) / 30

        var weeks = Math.floor(days / 7)

        var months = s % 12
        s = (s - months) / 12

        var years = s / 12

        if (years) return `${years}y`
        if (weeks) return `${weeks}w`
        if (days) return `${days}d`
        if (hrs) return `${hrs}h`
        if (mins) return `${mins}m`
        return `${secs}s`
    }

    const sendChat = async (senderId, category, content, convoId) => {
        const body = {
            convoId: convoId,
            senderId: senderId,
            content: content,
            category: category
        }

        await fetch(`/api/send-message`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
            .then(() => socket.emit('update convos', convoId))
    }

    const addMembers = (convoId, members) => {
        const body = {
            convoId: convoId,
            members: members
        }

        fetch('/api/add-members-convo', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
            .then(() => socket.emit('update convos', convoId))
    }

    return (
        <div className="mx-auto sm:my-[50px] w-full h-screen sm:max-w-[800px] sm:min-w-[640px] sm:h-[700px] bg-bg-blue box-shadow flex relative">
            <div className="h-full w-full sm:max-w-[300px] flex flex-col">
                <div className="nav-bar">
                    <div className="nav-bar-profile" onClick={() => navigate('profile')}>
                        <img src={user.profilePicture} />
                        <h1 className="text-[24px] sm:text-[20px]"> {user.userName} </h1>
                    </div>
                    <img 
                        src="/new-chat.png" 
                        alt="Create new conversation" 
                        className="new-chat"
                        onClick={() => handleOpenChat('create')}
                    />
                </div>
                <div className="chat-search">
                    <h1 className="text-white font-bold text-[30px] sm:text-[22px]"> Chats </h1>
                    <input 
                        type="text" 
                        id="chat-search-input" 
                        placeholder="Search for conversations"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="chat-list">
                    <div className="h-full">
                    {!isLoading && !search && convos.length > 0 && (convos.map((convo) => 
                        <NavLink className="chat-card" key={convo.convos._id.valueOf()} to={`/chats/${convo.convos._id.valueOf()}`}>
                            <div className="flex grow items-center">
                                <img src={convo.convos.convoPicture} className="chat-img" />
                                <div className="ml-[10px] flex grow flex-col">
                                    <div className="flex grow">
                                        <div className="chat-card-name">
                                            {convo.convos.convoName}
                                        </div>
                                    </div>
                                    <div className="flex grow text-gray-400 text-[18px] sm:text-[14px]">
                                        <Seen name={convo.chats[0].user[0]} currChat={convo.chats[0]} />
                                        <p className="ml-[16px]"> {displayTimeDiff(convo.chats[0].created)} </p>
                                    </div>
                                </div>
                            </div>
                        </NavLink>
                    ))}
                    {!isLoading && search && (searchConvos.map((convo) =>
                        <NavLink className="chat-card" key={convo.convos._id.valueOf()} to={`/chats/${convo.convos._id.valueOf()}`}>
                            <div className="flex grow items-center">
                                <img src={convo.convos.convoPicture} className="chat-img" />
                                <div className="ml-[10px] flex grow flex-col">
                                    <div className="flex grow">
                                        <div className="chat-card-name">
                                            {convo.convos.convoName}
                                        </div>
                                    </div>
                                    <div className="flex grow text-gray-400 text-[18px] sm:text-[14px]">
                                        <Seen name={convo.chats[0].user[0]} currChat={convo.chats[0]} />
                                        <p className="ml-[16px]"> {displayTimeDiff(convo.chats[0].created)} </p>
                                    </div>
                                </div>
                            </div>
                        </NavLink>
                    ))}
                    {isLoading &&
                        <div className="w-full flex items-center justify-center py-[30px]">
                            <Loading />
                        </div>
                    }
                    </div>
                </div>
            </div>
            <div className={`chat-box ${shown ? 'chat-box-show' : ''}`}>
                <Routes>
                    <Route path="" element={<EmptyChat />} />
                    <Route path="create" element={<CreateChat sendChat={sendChat} addMembers={addMembers} />} />
                    <Route path="chats/:convoId" element={<Chat sendChat={sendChat} />} />
                    <Route path="info/:convoId" element={<InfoChat setNamePopup={setNamePopup} setMemberPopup={setMemberPopup} setLeavePopup={setLeavePopup} sendChat={sendChat} />} />
                </Routes>
            </div>

            <ChatNamePopup namePopup={namePopup} setNamePopup={setNamePopup} sendChat={sendChat} />
            <AddMemberPopup memberPopup={memberPopup} setMemberPopup={setMemberPopup} addMembers={addMembers} sendChat={sendChat} />
            <LeavePopup leavePopup={leavePopup} setLeavePopup={setLeavePopup} sendChat={sendChat} />
        </div>
    );
}
 
export default Home;