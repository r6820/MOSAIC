import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// import { FaPlus } from 'react-icons/fa'
import { FaArrowsRotate } from 'react-icons/fa6'

import { RoomProps, Room, Button } from '@/components';
import axios from 'axios';
import { API_URL } from '@/config/default';

type location = {
    state: {
        rooms: RoomProps[]
    }
}

export const Lobby = () => {
    const { state } = useLocation() as location;
    const [rooms, setRooms] = useState<RoomProps[]>([]);

    useEffect(() => {
        setRooms(state.rooms);
    }, []);

    return (
        <div className='Lobby flex flex-col'>
            <div className='flex flex-row'>
                {/* <Button id='new' label={<FaPlus />} onClick={() => {

                }} /> */}
                <Button id='refresh' label={<FaArrowsRotate />} onClick={() => {
                    axios.get(
                        API_URL + '/lobby'
                    ).then((res) => {
                        console.log(res.data);
                        setRooms(res.data.rooms);
                    }).catch((reason) => {
                        console.log(reason);
                    });
                }} />
            </div>
            <div className='Rooms flex flex-row flex-wrap'>
                {rooms.map((room) => (<Room {...room} key={`room_${room.id}`} />))}
            </div>
        </div>
    )
}