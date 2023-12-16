const PopupBg = ({ item, setItem }) => {
    return (
        <>
            <div
                className={`popup-bg ${item ? 'open-popup-bg' : ''}`}
                onClick={() => setItem(null)}
            ></div>
        </>
    );
}
 
export default PopupBg;