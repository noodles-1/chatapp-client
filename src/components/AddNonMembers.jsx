import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import Select from "react-select";
import useGetNonMembers from "../hooks/useGetNonMembers";

const AddNonMembers = ({ memberPopup, setMemberPopup, addMembers, sendChat }) => {
    const user = JSON.parse(localStorage.getItem('curr_user'))

    const customStyles = {
        control: (base, state) => ({
            ...base,
            background: "#03101e",
            // match with the menu
            borderRadius: '16px',
            // Overwrittes the different states of border
            borderColor: 'none',
            // Removes weird border around container
            boxShadow: state.isFocused ? null : null,
            width: '240px',
            marginTop: '10px',
        }),
        menu: base => ({
            ...base,
            color: '#fff',
            // override border radius to match the box
            borderRadius: 0,
            // kill the gap
            marginTop: 0,
            background: "#03101e",
        }),
        menuList: base => ({
            ...base,
            // kill the white space on first and last option
            padding: 0,
            background: "#03101e",
        }),
        input: base => ({
            ...base,
            color: '#fff'
        }),
        multiValue: base => ({
            ...base,
            background: "#144272"
        }),
        multiValueLabel: base => ({
            ...base,
            color: "#fff"
        })
    };

    const [members, setMembers] = useState([])
    const [isEnabled, setEnabled] = useState(false)
    const [options, setOptions] = useState([])

    const { nonMembers } = useGetNonMembers(memberPopup.convoId)

    useEffect(() => {
        if (nonMembers.length)
            setOptions(nonMembers.map((member) => ({ value: member._id.valueOf(), label: member.userName })))
    }, [nonMembers])

    useEffect(() => {
        setEnabled(members.length > 0)
    }, [members])
    
    useEffect(() => {
        if (!memberPopup)
            members.length = 0
    }, [memberPopup])

    const handleAddMembers = () => {
        if (isEnabled) {
            addMembers(memberPopup.convoId, members)
            members.map((member) => {
                socket.emit('join this user in room', { convoId: memberPopup.convoId, userId: member.value.valueOf() })
                sendChat('aaaaaaaaaaaaaaaaaaaaaaaa', 'announcement', `${member.label} has been added to the group by ${user.userName}.`, memberPopup.convoId)
            })
            setMemberPopup(null)
        }
    }

    return (  
        <>
            <Select
                isMulti
                options={options}
                styles={customStyles}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        primary25: '#205295'
                    }
                })}
                onChange={(choice) => setMembers(choice)}
            />
            <input 
                type="button"
                value="Add" 
                className={`add-members-btn ${isEnabled ? '' : 'add-members-btn-disabled'}`}
                disabled={!isEnabled}
                onClick={handleAddMembers}
            />
        </>
    );
}
 
export default AddNonMembers;