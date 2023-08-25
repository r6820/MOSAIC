import { useState } from "react";
import Select from "react-select";
import { SelectContainerProps, ButtonContainer } from "@/components";

import '@/css/App.css'


export const SelectContainer = <T,>(props: SelectContainerProps<T>) => {
    const [selectedValues, setSelectedValues] = useState(props.selectOptionsArray.map(({ defaultValue }) => defaultValue));
    const items = props.selectOptionsArray.map((items, index) =>
        <div key={items.id} className='SelectElement'>
            <label>{items.label}</label><Select {...items} onChange={(value) => {
                value ? setSelectedValues(
                    selectedValues.map((_value, _index) => (index == _index ? value : _value))
                ) : null;
            }} />
        </div>
    );

    const buttonProps = props.buttonsProps.map((buttonProps)=>({ ...buttonProps, onClick: () => { buttonProps.onClick(selectedValues) } }))

    return (
        <div className='SelectContainer'>
            {items}
            <ButtonContainer buttons={buttonProps}/>
        </div>
    );
};
