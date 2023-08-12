import { useNavigate } from "react-router-dom"
import { SelectContainerProps, SelectContainer } from "@/components"


export const MainMenu = () => {
    const navigate = useNavigate();
    const props: SelectContainerProps<number | boolean> = {
        selectOptionsArray: [
            {
                id: 'size', label: 'size',
                options: [
                    { value: 5, label: '5' },
                    { value: 7, label: '7' }
                ], defaultValue: { value: 7, label: '7' }
            },
            {
                id: 'player1', label: 'player1', options: [
                    { value: false, label: 'human' },
                    { value: true, label: 'AI' },
                ], defaultValue: { value: false, label: 'human' },
            },
            {
                id: 'player2', label: 'player2', options: [
                    { value: false, label: 'human' },
                    { value: true, label: 'AI' },
                ], defaultValue: { value: false, label: 'human' },
            },
        ],
        buttonProps: {
            id: 'PlayButton', label: 'Play', onClick: (selectOptionsArray) => {
                const [size, isAI1, isAI2] = selectOptionsArray.map(({ value }) => value)
                navigate(import.meta.env.BASE_URL + '/game', { state: { size: size, isAI: [isAI1, isAI2] } });
            }
        }
    }
    return (
        <div className='MainMenu flex flex-col'>
            <SelectContainer {...props} />
        </div>
    )
}