import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { API_URL } from '@/config/default';


export function Online() {
    const navigate = useNavigate();
    const inputEl = useRef<HTMLInputElement>(null!);

    const handleClick = () => {
        localStorage.setItem('username', inputEl.current.value);
        axios.get(
            API_URL + '/lobby'
        ).then((res) => {
            console.log(res.data)
            navigate('/online/lobby', { state: res.data });
        }).catch((reason) => {
            console.log(reason);
        });
    }

    useEffect(() => {
        inputEl.current.value = localStorage.getItem('username') || '';
    }, []);

    return (
        <div className='flex flex-col'>
            <input className='flex m-2' type='text' ref={inputEl} placeholder='username' />
            <button onClick={handleClick}>Send</button>
        </div>
    )
}