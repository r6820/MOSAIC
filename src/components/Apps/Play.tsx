import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import Select from "react-select";
import { useState } from 'react';
import { PV_EVAL_BASIS, PV_MAX_LEVEL, defaultSize, player, sizes } from '@/phaser';


export const Play = () => {
    const navigate = useNavigate();
    const [size, setSize] = useState(defaultSize);
    const [isAI, setIsAI] = useState([false, false]);
    const [level, setLevel] = useState([10, 10]);
    const selectOption = {
        id: 'size', label: 'size', options: sizes.map((v) => (
            { value: v, label: `${v}` }
        ))
        , defaultValue: { value: defaultSize, label: `${defaultSize}` }
    };
    const playerOptions = [1, 2].map((v) => (
        { id: `player${v}`, label: `player${v}` }
    ))

    return (
        <div className='MainMenu flex flex-col'>
            <div className='flex justify-center items-center gap-1 m-1'>
                <label>size</label><Select {...selectOption} onChange={(e) => {
                    if (e) { setSize(e.value); }
                }} />
            </div>
            {playerOptions.map((value, index) => (
                <div key={`player_${index}`} className='flex justify-center items-center gap-1 m-1'>
                    <label>{value.label}</label>
                    <label htmlFor={`${value.id}isAI`}>
                        <input type='checkbox' id={`${value.id}isAI`} name={`${value.id}isAI`} value='AI' checked={isAI[index]} onChange={(e) => {
                            if (e) { setIsAI(isAI.map((v, i) => (i == index ? e.target.checked : v))); }
                        }} />
                        AI
                    </label>
                    <label className='border-2 rounded'>Level:{('  ' + level[index]).slice(-2)}
                        <input id={`${value.id}Level`} type='range' name={`${value.id}Level`} min='1' max={PV_MAX_LEVEL} step='1' value={level[index]} onChange={(e) => {
                            if (e) { setLevel(level.map((v, i) => (i == index ? parseInt(e.target.value) : v))); }
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