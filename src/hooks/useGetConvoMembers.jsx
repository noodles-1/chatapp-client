import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

const useGetConvoMembers = (convoId) => {
    const [members, setMembers] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [isConnected, setConnected] = useState(false)
    const [temp, setTemp] = useState([])

    useEffect(() => {
        socket.on('update convos', _ => setTemp([...convoId]))
    }, [])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/api/get-convo-members/${convoId}`)
            .then(response => response.json())
            .then(data => {
                setMembers(data)
                setLoading(false)
                setConnected(true)
            })
            .catch(err => {
                console.log(err)
                setLoading(true)
                setConnected(false)
            })
    }, [convoId, temp])

    return { members, isLoading, isConnected }
}
 
export default useGetConvoMembers;