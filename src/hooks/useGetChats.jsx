import { useState, useEffect } from "react"
import { socket } from "../socket/socket"

const useGetChats = (convoId) => {
    const [chats, setChats] = useState([])
    const [next, setNext] = useState(null)
    const [isConnected, setConnected] = useState(false)
    const [temp, setTemp] = useState([])

    useEffect(() => {
        socket.on('update convos', _ => setTemp([...convoId]))
    }, [])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/api/get-chats/${convoId}/0`)
            .then(response => response.json())
            .then(data => {
                setChats(data.convoChats)
                setNext(data.next)
                setConnected(true)
            })
            .catch(err => {
                console.log(err)
                setConnected(false)
            })
    }, [convoId, temp])

    const loadNextChats = () => {
        if (next)
            fetch(`${import.meta.env.VITE_SERVER_URL}/api/get-chats/${convoId}/${next}`)
                .then(response => response.json())
                .then(data => {
                    setChats(prev => [...prev, ...data.convoChats])
                    setNext(data.next)
                })
                .catch(err => console.log(err))
    }

    return { chats, next, isConnected, loadNextChats }
}
 
export default useGetChats;