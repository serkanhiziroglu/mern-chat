import { useState, useEffect } from "react"
import { UserContext } from "./UserContext"
import { useContext } from "react"
import { uniqBy } from 'lodash'
export default function Chat() {
    const [ws, setWs] = useState('')
    const [onlinePeople, setOnlinePeople] = useState({})
    const [selectedUserId, setselectedUserId] = useState(null)
    const { username, id } = useContext(UserContext)
    const [messages, setMessages] = useState([])
    const [newMessageText, setNewMessageText] = useState('')
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
    }, []);

    function showOnlinePeople(peopleArr) {
        const people = {}
        peopleArr.forEach(({ userId, username }) => {
            people[userId] = username;
        })
        setOnlinePeople(people)
    }
    function handleMessage(ev) {

        const messageData = JSON.parse(ev.data);
        console.log(messages);

        if ('online' in messageData) {
            showOnlinePeople(messageData.online);
        } else if ('text' in messageData) {
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages, { ...messageData }];
                return uniqBy(updatedMessages, 'id');
            });
        }
    }
    function selectContact(userId) {
        setselectedUserId(userId)
    }
    const onlinePeopleExclude = { ...onlinePeople }
    delete onlinePeopleExclude[id]

    const uniqueMessages = uniqBy(messages, 'id');

    function sendMessage(ev) {
        ev.preventDefault()
        ws.send(JSON.stringify({

            recipient: selectedUserId,
            text: newMessageText

        }))
        setNewMessageText('')
        setMessages(prev => ([...prev, {
            text: newMessageText,
            sender: id,
            recipient: selectedUserId
        }]))

    }
    return (
        <div className="flex h-screen">
            <div className="bg-blue-100 w-1/3 p-4 mb-4">

                <div className="flex gap-1   border-black border-b pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    Chat
                </div>
                <div className="justify-center items-center">
                    {
                        Object.keys(onlinePeopleExclude).map(userId => (
                            // eslint-disable-next-line react/jsx-key
                            <div key={userId} onClick={() => selectContact(userId)} className={"border-b border-gray-300 py-2 flex cursor-pointer " + (userId === selectedUserId ? 'bg-blue-50' : "")}>
                                <div className="mt-2 mr-2" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#A3EBB1' }}></div>
                                <span>{onlinePeople[userId]}</span>
                            </div>
                        ))
                    }
                </div>

            </div >
            <div className="flex flex-col bg-blue-300 w-2/3 p-2">
                <div className="flex-grow text-center justify-center h-full flex items-center">
                    {!selectedUserId && (<div>Select a person to text.</div>)}
                </div>
                {!!selectedUserId && (
                    <div>
                        {messages.map((message, index) => (
                            <div key={index}>{message.text}</div>
                        ))}</div>
                )}
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input type="text"
                            value={newMessageText}
                            onChange={ev => setNewMessageText(ev.target.value)}
                            className="bg-white flex-grow rounded-md border p-2"
                            placeholder="Type your message here." />
                        <button type="submit" className="bg-blue-500 text-white rounded-md p-2 ">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>

                )}

            </div>
        </div >
    )
}
