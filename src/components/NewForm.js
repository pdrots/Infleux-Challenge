import Axios from "axios"
import React, { useState, useRef } from "react"

function CreateNewForm(props) {
  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [conversionType, setConversionType] = useState("")
  const [bid, setBid] = useState("")
  const [target, setTarget] = useState("")
  const [file, setFile] = useState("")
  const CreatePhotoField = useRef()

  async function submitHandler(e) {
    e.preventDefault()
    const data = new FormData()
    data.append("photo", file)
    data.append("name", name)
    data.append("brand", brand)
    data.append("conversionType", conversionType)
    data.append("bid", bid)
    data.append("target", target)

    setName("")
    setBrand("")
    setConversionType("")
    setBid("")
    setTarget("")
    setFile("")

    CreatePhotoField.current.value = ""
    const newPhoto = await Axios.post("/create-campaign", data, { headers: { "Content-Type": "multipart/form-data" } })
    props.setCampaigns(prev => prev.concat([newPhoto.data]))
  }

  return (
    <form className="p-3 bg-success bg-opacity-25 mb-5" onSubmit={submitHandler}>
      <div className="mb-2">
        <input ref={CreatePhotoField} onChange={e => setFile(e.target.files[0])} type="file" className="form-control" />
      </div>
      <div className="mb-2">
        <input onChange={e => setName(e.target.value)} value={name} type="text" className="form-control" placeholder="Nome da Campanha" />
      </div>
      <div className="mb-2">
        <input onChange={e => setBrand(e.target.value)} value={brand} type="text" className="form-control" placeholder="Marca" />
      </div>
      <div className="mb-2">
        <input onChange={e => setConversionType(e.target.value)} value={conversionType} type="text" className="form-control" placeholder="Tipo de Conversão" />
      </div>
      <div className="mb-2">
        <input onChange={e => setBid(e.target.value)} value={bid} type="text" className="form-control" placeholder="Lance por Conversão" />
      </div>
      <div className="mb-2">
        <input onChange={e => setTarget(e.target.value)} value={target} type="text" className="form-control" placeholder="Segmento" />
      </div>

      <button className="btn btn-success">Crie uma nova Campanha!</button>
    </form>
  )
}

export default CreateNewForm
