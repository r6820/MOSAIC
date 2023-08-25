import { useNavigate } from 'react-router-dom'
import { Button} from '@/components'
import Select from "react-select";
import { useState } from 'react';
import { PV_EVAL_BASIS, player } from '@/phaser';


export const Play = () => {
    const navigate = useNavigate();
    const [size, setSize] = useState(7);
    const [isAI, setIsAI] = useState([false, false]);
    const [level, setLevel] = useState([1, 1]);
    const selectOption = {
        id: 'size', label: 'size', options: [
            { value: 5, label: '5' },
            { value: 7, label: '7' }
        ], defaultValue: { value: 7, label: '7' }
    };
    const playerOptions = [
        {
            id: 'player1', label: 'player1'
        },
        {
            id: 'player2', label: 'player2'
        }
    ]

    return (
        <div className='MainMenu flex flex-col'>
            <div className='flex justify-center items-center gap-1 m-1'>
                <label>size</label><Select {...selectOption} onChange={(e) => {
                    e ? setSize(e.value) : null
                }} />
            </div>
            {playerOptions.map((value, index) => (
                <div key={`player_${index}`} className='flex justify-center items-center gap-1 m-1'>
                    <label>{value.label}</label>
                    <label htmlFor={`${value.id}isAI`}>
                        <input type='checkbox' id={`${value.id}isAI`} name={`${value.id}isAI`} value='AI' checked={isAI[index]} onChange={(e) => {
                            e ? setIsAI(isAI.map((v, i) => (i == index ? e.target.checked : v))) : null;
                        }} />
                        AI
                    </label>
                    <label className='border-2 rounded'>Level {level[index]}
                        <input id={`${value.id}Level`} type='range' name={`${value.id}Level`} min='1' max='5' step='1' value={level[index]} onChange={(e) => {
                            e ? setLevel(level.map((v, i) => (i == index ? parseInt(e.target.value) : v))) : null;
                        }} />
                    </label>
                </div>
            ))}
            <Button id='PlayButton' label='Play' onClick={() => {
                const players: player[] = isAI.map((v, i) => {
                    if (v) {
                        return PV_EVAL_BASIS * level[i]
                    } else {
                        return 'human'
                    }
                })
                navigate('/game', { state: { size: size, players: players } });
            }} />
        </div>
    )
}