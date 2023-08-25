import { useNavigate } from 'react-router-dom';
import { Button } from '@/components';


export const MainMenu = () => {
    const navigate = useNavigate();

    return (
        <div className='MainMenu flex flex-col'>
            <Button id='playButton' label='Play' onClick={() => { navigate('/play'); }} />
            {/* <Button id='playButton' label='Online' onClick={() => {navigate('/online'); }} /> */}
        </div>
    )
}