import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOCKET_URL } from '@/config/default';
import io from 'socket.io-client';


const socket = io(SOCKET_URL);

export function Online() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [refreshToken, setRefreshToken] = useState(sessionStorage.getItem('refreshToken.token'));

    const handleClick = () => {
        if (refreshToken != null) {
            socket.emit('login', { refresh_token: refreshToken });
        } else {
            socket.emit('login', {
                username: username, password: password,
                refresh_token: null
            });
        }
    }
    useEffect(() => {
        sessionStorage.getItem('refreshToken.token');
        socket.connect();
        socket.removeAllListeners();
        socket.on('response', (m: any) => {
            console.log(m);
        });
        socket.on('login', (m: {
            data: string, username: string,
            access_token: string, refresh_token: string
        }) => {
            console.log(m);
            setRefreshToken(m.refresh_token);
            sessionStorage.setItem('refreshToken.token', m.refresh_token)
            navigate(import.meta.env.BASE_URL + '/Online/lobby');
        });
        socket.on('token not found', () => {
            socket.emit('login', {
                username: username, password: password,
                refresh_token: null
            });
        })
        return () => { socket.disconnect(); }
    }, []);
    return (
        <div className='flex flex-col'>
            <input className='flex m-2' type='text' value={username} onChange={(e) => {
                setUsername(e.target.value);
                setRefreshToken(null);
            }} placeholder='username' />
            <input className='flex m-2' type='password' value={password} onChange={(e) => {
                setPassword(e.target.value);
                setRefreshToken(null);
            }} placeholder='password' />
            <button onClick={handleClick}>Send</button>
        </div>
    )
}