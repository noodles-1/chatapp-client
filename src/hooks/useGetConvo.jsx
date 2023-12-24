import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

const useGetConvo = (convoId) => {
    const [convo, setConvo] = useState(null)
    const [isLoading, setLoading] = useState(true)
    const [isConnected, setConnected] = useState(false)
    const [temp, setTemp] = useState([])

    useEffect(() => {
        socket.on('update convos', _ => setTemp([...convoId]))
    }, [])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/api/get-convo/${convoId}`)
            .then(response => response.json())
            .then(data => {
                setConvo(data)
                setLoading(false)
                setConnected(true)
            })
            .catch(err => {
                console.log(err)
                setLoading(true)
                setConnected(false)
            })
    }, [convoId, temp])

    return { convo, isLoading, isConnected }
}
 
export default useGetConvo;