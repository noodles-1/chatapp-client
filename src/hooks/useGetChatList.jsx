import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

const useGetChatList = (userId) => {
    const [convos, setConvos] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [isConnected, setConnected] = useState(false)
    const [temp, setTemp] = useState([userId])

    useEffect(() => {
        socket.on('update convos', _ => setTemp([...userId]))
        socket.on('update self', _ => setTemp([...userId]))
    }, [])

    useEffect(() => {
        fetch(`/api/get-chat-list/${userId}`)
            .then(response => response.json())
            .then(data => {
                data.sort((a, b) => {
                    var keyA = new Date(a.chats[0].created)
                    var keyB = new Date(b.chats[0].created)
                    return (keyA < keyB) ? 1 : -1
                })
                setConvos(data)
                setLoading(false)
                setConnected(true)
            })
            .catch(err => {
                console.log(err)
                setLoading(true)
                setConnected(false)
            })
    }, [userId, temp])

    return { convos, isLoading, isConnected }
}
 
export default useGetChatList;