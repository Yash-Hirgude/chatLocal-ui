import { io } from 'socket.io-client'
import { useRef, useEffect, useState } from 'react'
import './Home.css'
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { ToastContainer, toast } from 'react-toastify';


function Home() {
  const navigate = useNavigate();
  const socketRef = useSocket(); 
  const [roomName, setRoomName] = useState('')
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [rooms,setRooms] = useState([]);

  const notify = (groupName) => toast(`A new group ${groupName} was created! Refresh the page to see`);


  async function getGroups(lat,lng) {
    const url = new URL(`${import.meta.env.VITE_GROUP}/nearby`); // Base URL
    const params = {lat,lng}
    url.search = new URLSearchParams(params).toString(); 

    try {
      const response = await fetch(url);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      const data = await response.json();
      setRooms(data.groups);
      console.log(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    
  }

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleWelcome = (data) => console.log(data);
    const handleGroupCreated = (group) => {
      notify(group.name);
      console.log('room created',group.name)
    }

    socket.on("Welcome", handleWelcome);
    socket.on("groupCreated", handleGroupCreated);

    let isMounted = true;

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    } else {
      navigator.geolocation.getCurrentPosition(async (position) => {
        if (!isMounted) return;
        setLat(position.coords.latitude)
        setLng(position.coords.longitude)
        getGroups(position.coords.latitude,position.coords.longitude);
        socket.emit('registerLocation',{lat: position.coords.latitude , lng: position.coords.longitude});
      },
        (err) => {
          console.log('error while accessing location', err);
          alert("Please allow location access to use this app.");
        });
    }

    return () => {
      socket.off("Welcome", handleWelcome);
      socket.off("groupCreated", handleGroupCreated);
      isMounted = false;
    };
  }, [socketRef.current])

  const handleRoomSubmit = (e) => {
    e.preventDefault()

    if (!roomName || lat === null || lng === null) {
      alert('Room name or location missing')
      return
    }

    const url = `${import.meta.env.VITE_GROUP}/create-group`;
    const params = {
      groupName: roomName,
      lat: lat,
      lng: lng
    };

    fetch(url, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(params) 
    })
      .then(response => response.json()) 
      .then(data => console.log('Success:', data))
      .catch(error => console.error('Error:', error));

    console.log('Sent:', { roomName, lat, lng })
  }

  async function roomClickedHandler(roomId,groupName){
    console.log(roomId);
    const url = `${import.meta.env.VITE_GROUP}/join-group`;
    const params = {
      groupId: roomId,
      userId: socketRef.current.id
    };
    fetch(url, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(params) 
    })
      .then(response => response.json()) 
      .then(data => {
        console.log('Success:', data);
        navigate(`/group/${roomId}`, { state: { enteredFromHome: true, groupName } });
      })
      .catch(error => console.error('Error:', error));
  }

  return (
    <>
      <div className="app-container">
        <h1 className="title">Chat Local</h1>
  
        <form className="create-room-form" onSubmit={handleRoomSubmit}>
          <input
            className="room-input"
            type="text"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
  
          <button className="create-btn" type="submit">
            Create Room
          </button>
        </form>
  
        <ul className="room-list">
          {rooms.map((room) => {
            return (
              <li className="room-item" key={room._id}>
                <button
                  className="room-btn"
                  type="button"
                  onClick={() => roomClickedHandler(room._id,room.name)}
                >
                  <h4>{room.name}</h4>
                </button>
              </li>
            )
          })}
        </ul>
        <ToastContainer />
      </div>
    </>
  )
}

export default Home
