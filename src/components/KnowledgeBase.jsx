import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash'
export default function KnowledgeBase() {
    const [socketConnection, updateSocketConnection] = useState(null);
    const [listOfArticles, updateListOfArticles] = useState([]);
    const [searchWords, updateSearchWords] = useState('');

    useEffect(() => {
        try {
            const connection = new WebSocket("ws://localhost:8000/kb/search")
            connection.addEventListener('message', (event) => {
                updateListOfArticles(JSON.parse(event.data));
            });
            updateSocketConnection(connection);
        } catch (error) {
            console.error('Error establishing WebSocket connection:', error);
        }
    }, [])

    useEffect(() => {
        if (socketConnection)
            socketConnection.send(searchWords)
    }, [searchWords])

    return (
        <div style={{ border: '2px white solid', width: '60vw' }}>
            <div className="KnowledgeBase container">
                <div className='flex'>

                <input
                    placeholder='Search Query'
                    className='border-2 border-red-100 p-2'
                    value={searchWords}
                    onChange={e => {
                        updateSearchWords(e.target.value)
                    }}
                    style={{
                        width: 'calc(100% - 195px)'
                    }}
                />
                <Link to='create'>
                <button className="bg-green-500 hover:bg-blue-700 text-white font-bold p-2 m-1 rounded-md mr-2">
                    Create New
                </button>
                </Link>
                </div>

                <div className='container flex flex-wrap'>

                {listOfArticles.map((element) => (
                    <div
                    key={element.id}
                    className="bg-teal-50 text-left rounded-md border-2 border-gray-400 pt-2 pb-2 pl-4 pr-4 flex flex-col m-2"
                    style={{ width: 'clamp(200px, 30vw, 400px)', height: '200px' }}
                    >
                        <h2 className='text-md'>Article-ID: KB{_.padStart(element.id, 5, 0)}</h2>
                        <h2 className='text-md'>{element.category}</h2>
                        <h1 className="text-lg font-semibold">{element.title}</h1>
                        <p className="text-gray-700 w-full h-full text-left overflow-hidden white-space-nowrap">
                            {element.description}
                        </p>
                        <div className="flex justify-end mt-5">
                            <Link to={`view/KB${_.padStart(element.id, 5, 0)}`}>
                                <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-1 px-2 rounded-md mr-2">
                                    <svg style={{ height: '20px' }} fill='white' viewBox="0 0 120 120">
                                        <path d="M60,19.089C22.382,19.089,0.053,60,0.053,60S22.382,100.91,60,100.91S119.947,60,119.947,60S97.618,19.089,60,19.089z   M59.999,84.409C46.54,84.409,35.59,73.459,35.59,60c0-13.459,10.95-24.409,24.409-24.409c13.459,0,24.409,10.95,24.409,24.409  C84.408,73.459,73.458,84.409,59.999,84.409z" />
                                        <circle cx="60" cy="60.583" r="14.409" />
                                    </svg>
                                </button>
                            </Link>

                            <Link to={`update/KB${_.padStart(element.id, 5, 0)}`}>
                                <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-1 px-2 rounded-md mr-2">
                                    <svg style={{ height: '20px' }} fill='white' viewBox="0 0 122.88 121.51">
                                        <title>edit</title>
                                        <path d="M28.66,1.64H58.88L44.46,16.71H28.66a13.52,13.52,0,0,0-9.59,4l0,0a13.52,13.52,0,0,0-4,9.59v76.14H91.21a13.5,13.5,0,0,0,9.59-4l0,0a13.5,13.5,0,0,0,4-9.59V77.3l15.07-15.74V92.85a28.6,28.6,0,0,1-8.41,20.22l0,.05a28.58,28.58,0,0,1-20.2,8.39H11.5a11.47,11.47,0,0,1-8.1-3.37l0,0A11.52,11.52,0,0,1,0,110V30.3A28.58,28.58,0,0,1,8.41,10.09L8.46,10a28.58,28.58,0,0,1,20.2-8.4ZM73,76.47l-29.42,6,4.25-31.31L73,76.47ZM57.13,41.68,96.3.91A2.74,2.74,0,0,1,99.69.38l22.48,21.76a2.39,2.39,0,0,1-.19,3.57L82.28,67,57.13,41.68Z" />
                                    </svg>
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}