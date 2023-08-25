import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RoomProps, Room } from '@/components';

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
        <div className='Lobby flex flex-row flex-wrap'>
            {rooms.map((room) => (<Room {...room} key={`room_${room.id}`} />))}
        </div>
    )
}