import React from 'react'
import NewsList from './NewsList.jsx'

export default function Feed( { data, currentTopic } ) {
    
    return (
        <div className='container'> 
            <div className='column'>
                {(data && (currentTopic != "Select topic")) ? 
                <> 
                    <h2 style={{textAlign: 'center', color: '#0373fc', fontStyle: 'italic',}}> 
                        <span style={{backgroundColor: '#FFEB02', padding: '3px 3px 3px 3px'}}> Left </span> 
                    </h2> 
                    <NewsList list={data.left} bias='left'/> 
                </> 
                : <p></p>
                }
            </div>
            <div className='column'>
                {(data && (currentTopic != "Select topic")) ? 
                <> 
                    <h2 style={{textAlign: 'center', color: '#d43b3b', fontStyle: 'italic'}}> 
                    <span style={{backgroundColor: '#FFEB02', padding: '3px 3px 3px 3px'}}> Right </span> 
                    </h2> 
                    <NewsList list={data.right} bias='right'/> 
                </> 
                : <p></p>
                }
            </div>
        </div>
    )
}
