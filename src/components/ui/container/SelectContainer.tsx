import { useState } from "react";
import Select from "react-select";
import { SelectContainerProps } from "../types/props";
import { Button } from "../button/Button";

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

    const buttonProps = {...props.buttonProps, onClick: ()=>{props.buttonProps.onClick(selectedValues)}}

    return (
        <div className='SelectContainer'>
            {items}
            <Button key={props.buttonProps.id} {...buttonProps} />
        </div>
    );
};
