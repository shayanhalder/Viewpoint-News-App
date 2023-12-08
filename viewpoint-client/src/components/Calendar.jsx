import React, { useState, useEffect } from 'react'

export default function Calendar( { pastDate, setPastDate, currentDate } ) {
    return (
        <div className='calendar'>
            <label> Select Past Date: </label>
            <input type="date" className='inputs' id='calendar' value={pastDate}
                min="2022-07-27" max={currentDate} onChange={e => setPastDate(e.target.value)}/>
        </div>
        
    )
}