import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client';
import { SelectContainerProps, SelectContainer, Button } from '@/components'
import { SOCKET_URL } from '@/config/default';
import { selectSwal } from '@/common';


const socket = io(SOCKET_URL);

export const Lobby = () => {
    const navigate = useNavigate();
    const [size, setSize] = useState(7);
    const [userId, setUserId] = useState('')

    useEffect(() => {
        socket.connect();
        socket.removeAllListeners();
        socket.on('join', ({ user_id }) => {
            console.log('join:', user_id);
            setUserId(user_id);
            socket.emit('get lobby', { size: size })
        });
        socket.on('wait', ({ user_id, room_id }) => {
            console.log('wait:', room_id);
            setUserId(user_id);
        });
        socket.on('lobby', ({ lobby }) => {
            console.log('lobby:', lobby);
            if (lobby.length > 0) {
                const keyNames: Record<string, string> = (lobby as { id: number, player1: string }[]).reduce((obj, val, i) => ({ ...obj, [i]: val.player1 }), {});
                selectSwal('Join', keyNames, (index) => { socket.emit('join game', {'user_id': userId, 'room_id':keyNames[index]}) }, () => { })
            }
        });
        socket.on('start', ({ player1, player2 }) => {
            console.log('start:', player1, player2);
        });
        return () => { socket.disconnect(); }
    }, []);
    const props: SelectContainerProps<number> = {
        selectOptionsArray: [
            {
                id: 'size', label: 'size',
                options: [
                    { value: 5, label: '5' },
                    { value: 7, label: '7' }
                ], defaultValue: { value: 7, label: '7' }
            }
        ],
        buttonProps: {
            id: 'PlayButton', label: 'Create room', onClick: (selectOptionsArray) => {
                const [s] = selectOptionsArray.map(({ value }) => value);
                setSize(s);
                socket.emit('leave', { refresh_token: sessionStorage.getItem('refreshToken.token') });
                socket.emit('join', { refresh_token: sessionStorage.getItem('refreshToken.token'), create: true, size: size });
                // navigate(import.meta.env.BASE_URL + '/play/game', { state: { size: size, isAI: [isAI1, isAI2] } });
            }
        }
    }
    return (
        <div className='MainMenu flex flex-col'>
            <SelectContainer {...props} />
            <Button id='join_button' label='Join room' onClick={() => {
                socket.emit('leave', { refresh_token: sessionStorage.getItem('refreshToken.token') });
                socket.emit('join', { refresh_token: sessionStorage.getItem('refreshToken.token'), create: false });
            }} />
        </div>
    )
}