import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from 'react-simple-wysiwyg';

const MyForm = () => {
  const [id, setID] = useState('')
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('IT')
  const [file_list, setFiles] = useState([]);
  const [default_behavior, setDefaultBehavior] = useState('');
  const [exceptions, setExceptions] = useState('');
  const formRef = useRef(null)
  const navigator = useNavigate()

  const uploadFiles = useRef(null)
  const handleInputChange = (event) => {
    switch (event.target.name) {
      case 'title':
        setTitle(event.target.value);
        break;
      case 'description':
        setDescription(event.target.value);
        break;
      case 'default_behavior':
        setDefaultBehavior(event.target.value);
        break;
      case 'exceptions':
        setExceptions(event.target.value);
        break;
      case 'file_list':
        setFiles(Array.from(event.target.files));
        break;
      case 'category':
        setCategory(event.target.value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const makeBlankRecord = async () => {
      const response = await fetch('http://localhost:8000/kb/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: '',
          description: '',
          file_list: '[]',
          category: category,
          userID: 3,
          default_behavior: 'true',
          exceptions: '[]'
        })
      })
      const responseParse = await response.json()
      setID(responseParse.Article.id)
    }
    makeBlankRecord()
    formRef.current.default_behavior.value = 'allowed'
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault();
    const responseJSON = await fetch(`http://localhost:8000/kb/update/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        description: description,
        file_list: JSON.stringify(file_list),
        exceptions: JSON.stringify(exceptions),
        default_behavior: default_behavior,
        category: category
      })
    }).then(res => res.json())
    console.log(responseJSON)
    setTitle('');
    setDescription('');
    setFiles([]);
    setDefaultBehavior('');
    setExceptions('');
  };

  const removeFile = async (index)=>{
    console.log('Removing index', index)
    const newArr = file_list
    console.log(newArr)
    newArr.splice(index, 1)
    console.log(newArr)
    setFiles(newArr)
  }

  return (
    <form className="text-left w-full max-w-2xl" ref={formRef}>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-1/2 px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-password">
            ARTICLE ID
          </label>
          <input value={id} disabled={true} onChange={handleInputChange} className="appearance-none block w-full bg-gray-300 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-password" type="text" placeholder="" name='title' />
        </div>
        <div className="w-1/2 px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-password">
            CATEGORY
          </label>
          <select value={category} onChange={handleInputChange} name="category" className="block w-full bg-gray-100 text-gray-700 border border-gray-300 rounded py-2.5 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
            <option value="IT">IT Department</option>
            <option value="HR">HR Department</option>
            <option value="Gen">General</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-1/2 px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-password">
            Title
          </label>
          <input value={title} onChange={handleInputChange} className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-300 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-password" type="text" placeholder="" name='title' />
        </div>
        <div className="w-1/2 px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-password">
            Default Access Behavior
          </label>
          <div className='flex mt-5'>
            <div className="flex items-center mr-10">
              <input id="default-radio-1" onChange={handleInputChange} type="radio" value="allowed" name="default_behavior" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
              <label htmlFor="default-radio-1" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-800">Allowed</label>
            </div>
            <div className="flex items-center">
              <input id="default-radio-2" onChange={handleInputChange} type="radio" value="restricted" name="default_behavior" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
              <label htmlFor="default-radio-2" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-800">Restricted</label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-password">
            Description
          </label>
          <Editor value={description} onChange={e=>setDescription(e.target.value)}></Editor>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className='w-full px-3'>
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-password">
            Attached files
          </label>
          <input type="file" name="file_list" multiple={true} onChange={handleInputChange}></input>
          <div className='flex flex-wrap -mx-3 mb-6 mt-2'>
            {file_list.map((element, index) => (
              <div key={element.lastModified} className='w-1/2'>
                <div className='relative bg-indigo-200 px-4 py-2 m-1 text-gray rounded-md text-left'>
                  <div>
                    {element.name}
                  </div>
                  <div className='absolute right-4 top-2'>
                    <button onClick={()=>{
                      removeFile(index)
                    }}>x</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='flex justify-end mt-4'>
        <button onClick={handleSubmit} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-sm mt-4 mr-4">
          Create
        </button>
        <button onClick={() => { navigator('/kb') }} className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-sm mt-4">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MyForm;