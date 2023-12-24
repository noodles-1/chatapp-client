import { useEffect, useState } from "react";

const useCheckInConvo = (convoId, userId) => {
    const [result, setResult] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [isConnected, setConnected] = useState(false)

    useEffect(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/api/check-in-convo/${convoId}/${userId}`)
            .then(response => response.json())
            .then(data => {
                setResult(data)
                setLoading(false)
                setConnected(true)
            })
            .catch(err => {
                console.log(err)
                setLoading(true)
                setConnected(false)
            })
    }, [convoId])

    return { result, isLoading, isConnected }
}
 
export default useCheckInConvo;