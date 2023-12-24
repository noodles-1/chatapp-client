import { useEffect, useState } from "react";

const useGetNonMembers = (convoId) => {
    const [nonMembers, setNonMembers] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [isConnected, setConnected] = useState(false)

    useEffect(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/api/get-non-members/${convoId}`)
            .then(response => response.json())
            .then(data => {
                setNonMembers(data)
                setLoading(false)
                setConnected(true)
            })
            .catch(err => {
                console.log(err)
                setLoading(true)
                setConnected(false)
            })
    }, [])

    return { nonMembers, isLoading, isConnected }
}
 
export default useGetNonMembers;