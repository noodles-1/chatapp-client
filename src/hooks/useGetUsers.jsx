import { useEffect, useState } from "react";

const useGetUsers = (userId) => {
    const [users, setUsers] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [isConnected, setConnected] = useState(false)

    useEffect(() => {
        fetch(`/api/get-users/${userId}`)
            .then(response => response.json())
            .then(data => {
                setUsers(data)
                setLoading(false)
                setConnected(true)
            })
            .catch(err => {
                console.log(err)
                setLoading(true)
                setConnected(false)
            })
    }, [])

    return { users, isLoading, isConnected }
}
 
export default useGetUsers;