import { Button, RoomProps } from "@/components";
import { useNavigate } from 'react-router-dom';

export const Room = (props: RoomProps) => {
    const navigate = useNavigate();
    if (props.is_suspended) { return }
    return (
        <div className='Room flex flex-col border rounded p-4 m-1'>
            <div>Room {props.id}</div>
            <div className='text-left'>size: {props.size}</div>
            <div className='text-left flex flex-row m-1'>
                1:<div className='flex w-full border rounded'>{props.player1}</div>
            </div>
            <div className='text-left flex flex-row m-1'>
                2:<div className='flex w-full border rounded'>{props.player2}</div>
            </div>
            <Button id={`ButtonRoom${props.id}`} label='Enter' onClick={() => {
                navigate(`/online/game?id=${props.id}`, { state: {...props} });
            }} />
        </div>
    )
}
