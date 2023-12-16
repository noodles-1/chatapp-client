import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

const useCheckSeen = (userId, chatId) => {
    const [chat, setChat] = useState({})
    const [isLoading, setLoading] = useState(true)
    const [isConnected, setConnected] = useState(false)
    const [temp, setTemp] = useState([])

    useEffect(() => {
        socket.on('update convos', _ => setTemp([...userId]))
        socket.on('update self', _ => setTemp([...userId]))
    }, [])

    useEffect(() => {
        fetch(`/api/get-seen/${userId}/${chatId}`)
            .then(response => response.json())
            .then(data => {
                setChat(data)
                setLoading(false)
                setConnected(true)
            })
            .catch(err => {
                console.log(err)
                setLoading(true)
                setConnected(false)
            })
    }, [chatId, temp])

    return { chat, isLoading, isConnected }
}
 
export default useCheckSeen;