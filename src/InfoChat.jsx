import { useNavigate, useParams } from "react-router-dom";
import useGetConvo from "./hooks/useGetConvo";
import useGetConvoMembers from "./hooks/useGetConvoMembers";
import { s3 } from "./config/config"

const InfoChat = ({ setNamePopup, setMemberPopup, setLeavePopup, sendChat }) => {
    const user = JSON.parse(localStorage.getItem('curr_user'))
    const { convoId } = useParams()

    const { convo, isLoading, isConnected } = useGetConvo(convoId)
    const { members, isLoading: isMembersLoading } = useGetConvoMembers(convoId)

    const navigate = useNavigate()

    const handleImgInput = (e) => {
        if (e.target.files.length == 0) return
        const img = e.target.files[0]

        const params = {
            Bucket: 'noodelzchatappbucket',
            Key: img.name,
            Body: img
        }

        s3.upload(params, (error, data) => {
            if (error)
                console.error("Error uploading image:", error);
            else {
                const body = {
                    convoId: convoId,
                    convoPicture: data.Location
                }

                fetch(`${import.meta.env.VITE_SERVER_URL}/api/update-convo-picture`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                })
                    .then(() => {
                        sendChat('aaaaaaaaaaaaaaaaaaaaaaaa', 'announcement', `${user.userName} has changed the conversation photo.`, convoId)
                    })
            }
        })
    }

    return (
        <>
            <div className="h-full w-full py-[30px] px-[34px] overflow-y-auto">
                <img src="/back.png" className="back" onClick={() => navigate(-1)} />
                <div className="flex flex-col items-center text-center">
                    <div className="relative my-[10px]">
                        <img src={convo ? convo.convoPicture : '/default-chat-picture.png' } className="info-img" />
                        <label htmlFor="imageUpload" className="change-info-img">
                            <input type="file" id="imageUpload" accept="image/*" onChange={handleImgInput} />
                            CHANGE PHOTO
                        </label>
                    </div>
                    <div className="w-full">
                        <div className="flex grow">
                            <div className="chat-info-name" onClick={() => setNamePopup({ convoId: convoId, convo: convo })}>
                                {convo ? convo.convoName : 'Loading'}
                            </div>
                        </div>
                    </div>
                </div>
                <h1 className="mt-[30px] font-semibold text-[18px]"> Members </h1>
                <div className="member-card add-member" onClick={() => setMemberPopup({ convoId: convoId, members: members })}>
                    <img src="/add.png" />
                    <h1> Add member </h1>
                </div>
                {!isLoading && members.map((member) => 
                    <div key={member._id.valueOf()} className="member-card">
                        <img src={member.convoMembers[0].profilePicture} />
                        <h1> {member.convoMembers[0].userName} </h1>
                    </div>
                )}
                <div className="leave-group">
                    <div className="w-[150px] flex items-center justify-center" onClick={() => setLeavePopup(convoId)}>
                        <p> Leave group </p>
                        <img src="/leave.png" />
                    </div>
                </div>
            </div>
        </>
    );
}
 
export default InfoChat;