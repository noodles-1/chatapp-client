import PopupBg from "./PopupBg"
import AddNonMembers from "./AddNonMembers";

const AddMemberPopup = ({ memberPopup, setMemberPopup, addMembers, sendChat }) => {
    return (
        <>
            <PopupBg item={memberPopup} setItem={setMemberPopup} />
            <div className={`member-popup ${memberPopup ? 'open-member-popup' : ''}`}>
                <h1 className="text-center"> Add members </h1>
                {memberPopup && <AddNonMembers memberPopup={memberPopup} setMemberPopup={setMemberPopup} addMembers={addMembers} sendChat={sendChat} />}
            </div>
        </>
    );
}
 
export default AddMemberPopup;