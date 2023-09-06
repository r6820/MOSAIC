import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa'
import { FaArrowsRotate } from 'react-icons/fa6'

import { RoomProps, Room, Button } from '@/components';
import axios from 'axios';
import { API_URL } from '@/config/default';
import { selectSwal } from '@/common';
import { sizes } from '@/phaser';

type location = {
    state: {
        games: RoomProps[]
    }
}

export const Lobby = () => {
    const navigate = useNavigate();
    const { state } = useLocation() as location;
    const [rooms, setRooms] = useState<RoomProps[]>([]);

    useEffect(() => {
        setRooms(state.games);
    }, []);

    const newGame = () => {
        const keyNames: Record<string, string> = sizes.reduce((obj, val, i) => ({ ...obj, [i]: val }), {});
        selectSwal('Select Size', 'Create', keyNames, (index) => {
            axios.post(
                API_URL + '/create', null, {
                params: {
                    size: keyNames[index]
                }
            }
            ).then((res: { data: { game: RoomProps } }) => {
                console.log(res.data);
                navigate(`/online/game?id=${res.data.game.id}`, { state: { ...res.data.game } });
            }).catch((reason) => {
                console.log(reason);
            });
        });
    }

    return (
        <div className='Lobby flex flex-col'>
            <div className='flex flex-row'>
                <Button id='new' label={<FaPlus />} onClick={newGame} />
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