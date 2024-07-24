import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import _ from 'lodash'

export default function ViewKnowledgeBaseArticle(){
    const [kbArticle, updateKbArticle] = useState(null)
    const { kbID } = useParams()
    
    useEffect(()=>{
        fetch(`http://localhost:8000/kb/view/${kbID}`, {
            method: "POST"
        }).then(res => res.json()).then(responseObject => {
            updateKbArticle(responseObject.Article)
            console.log(responseObject.Article)
        }).catch(e=>{
            console.log('Some Error')
        })
    }, [])
    
    return <div className="KnowledgeBaseArticle container">
        <div className="border-gray-500">
            {kbArticle && <>
            <h1 className='text-left font-semibold text-4xl mb-7'>Article ID: KB{_.padStart(kbArticle.id, 5, 0)}</h1>
            <h1 className='text-left font-semibold text-3xl mb-7'>{kbArticle.title}</h1>
            <p className='text-left richTextRenderer' dangerouslySetInnerHTML={{__html: kbArticle.description}} style={{borderTop: '2px black solid'}} />
            </>}
            {!kbArticle && <>
                <h1 className='text-left font-semibold text-4xl mb-7'>Error 404</h1>
                <h1 className='text-left font-semibold text-2xl mb-7'>Article not found (in the database) :(    </h1>
            </>}
        </div>
    </div>
}