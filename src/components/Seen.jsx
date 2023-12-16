import useCheckSeen from '../hooks/useCheckSeen'

const Seen = ({ name, currChat }) => {
    const user = JSON.parse(localStorage.getItem('curr_user'))

    const { chat, isLoading, isConnected } = useCheckSeen(user._id.valueOf(), currChat._id)

    return (
        <div 
            className={`chat-card-last-msg ${chat ? 'chat-card-last-msg-seen' : ''}`}
        >
            {currChat.category == 'message' ? `${name.userName}: ` : ''} {currChat.content}
        </div>
    );
}
 
export default Seen;