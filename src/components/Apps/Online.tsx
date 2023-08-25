import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { API_URL } from '@/config/default';


export function Online() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');

    const handleClick = () => {
        localStorage.setItem('username', username); 
        axios.get(
            API_URL + '/lobby'
        ).then((res) => {
            navigate('/online/lobby', { state: res.data });
        }).catch((reason) => {
            console.log(reason);
        });
    }
    useEffect(() => {
        setUsername(localStorage.getItem('username') || '');
    }, []);
    return (
        <div className='flex flex-col'>
            <input className='flex m-2' type='text' value={username} onChange={(e) => {
                setUsername(e.target.value);
            }} placeholder='username' />
            <button onClick={handleClick}>Send</button>
        </div>
    )
}