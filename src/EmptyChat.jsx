import { useDispatch } from "react-redux";
import { mobileHide } from "./redux/shown";

const EmptyChat = () => {
    const dispatch = useDispatch()

    return (
        <>
            <div className="chat-header">
                <img 
                    src="/back.png" 
                    className="back block sm:hidden" 
                    onClick={() => dispatch(mobileHide())}
                />
            </div>
            <div className="chat-convo">
                <div className="h-full max-w-[210px] flex items-center justify-center text-gray-400 font-light mx-auto">
                    <div className="text-center">
                        Open a chat or press
                        <img src="/new-chat(2).png" className="inline align-middle h-[20px] w-[20px] mx-[5px]" />
                        to start a new conversation.
                    </div>
                </div>
            </div>
            <div className="chat-input">

            </div>
        </>
    );
}
 
export default EmptyChat;