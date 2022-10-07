import Axios from "axios"
import React, { useState } from "react"

function CampaignCard(props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [draftBrand, setDraftBrand] = useState("")
  const [draftConversionType, setDraftConversionType] = useState("")
  const [draftBid, setDraftBid] = useState("")
  const [draftTarget, setDraftTarget] = useState("")
  const [file, setFile] = useState()

  async function submitHandler(e) {
    e.preventDefault()
    setIsEditing(false)
    props.setCampaigns(prev =>
      prev.map(function (campaign) {
        if (campaign._id == props.id) {
          return { ...campaign, name: draftName, brand: draftBrand, conversionType: draftConversionType, bid: draftBid, target: draftTarget }
        }
        return campaign
      })
    )
    const data = new FormData()
    if (file) {
      data.append("photo", file)
    }
    data.append("_id", props.id)
    data.append("name", draftName)
    data.append("brand", draftBrand)
    data.append("conversiontype", draftConversionType)
    data.append("bid", draftBid)
    data.append("target", draftTarget)
    
    const newPhoto = await Axios.post("/update-campaign", data, { headers: { "Content-Type": "multipart/form-data" } })
    if (newPhoto.data) {
      props.setCampaigns(prev => {
        return prev.map(function (campaign) {
          if (campaign._id == props.id) {
            return { ...campaign, photo: newPhoto.data }
          }
          return campaign
        })
      })
    }
  }

  return (
    <div className="card">
      <div className="our-card-top">
        {isEditing && (
          <div className="our-custom-input">
            <div className="our-custom-input-interior">
              <input onChange={e => setFile(e.target.files[0])} className="form-control form-control-sm" type="file" />
            </div>
          </div>
        )}
        <img src={props.photo ? `/uploaded-photos/${props.photo}` : "/noimage.png"} className="card-img-top" alt={`${props.brand} named ${props.name}`} />
      </div>
      <div className="card-body">
        {!isEditing && (
          <>
            <h4>{props.name}</h4>
            <p className="text-muted small">{props.brand}</p>
            <p className="text-muted small">{props.conversionType}</p>
            <p className="text-muted small">{props.bid}</p>
            <p className="text-muted small">{props.target}</p>
            {!props.readOnly && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setDraftName(props.name)
                    setDraftBrand(props.brand)
                    setDraftBrand(props.conversiontype)
                    setDraftBrand(props.bid)
                    setDraftBrand(props.target)
                    setFile("")
                  }}
                  className="btn btn-sm btn-primary"
                >
                  Edit
                </button>{" "}
                <button
                  onClick={async () => {
                    const test = Axios.delete(`/campaign/${props.id}`)
                    props.setCampaigns(prev => {
                      return prev.filter(campaign => {
                        return campaign._id != props.id
                      })
                    })
                  }}
                  className="btn btn-sm btn-outline-danger"
                >
                  Delete
                </button>
              </>
            )}
          </>
        )}
        {isEditing && (
          <form onSubmit={submitHandler}>
            <div className="mb-1">
              <input autoFocus onChange={e => setDraftName(e.target.value)} type="text" className="form-control form-control-sm" value={draftName} />
            </div>
            <div className="mb-2">
              <input onChange={e => setDraftBrand(e.target.value)} type="text" className="form-control form-control-sm" value={draftBrand} />
            </div>
            <div className="mb-2">
              <input onChange={e => setDraftConversionType(e.target.value)} type="text" className="form-control form-control-sm" value={draftConversionType} />
            </div>
            <div className="mb-2">
              <input onChange={e => setDraftBid(e.target.value)} type="text" className="form-control form-control-sm" value={draftBid} />
            </div>
            <div className="mb-2">
              <input onChange={e => setDraftTarget(e.target.value)} type="text" className="form-control form-control-sm" value={draftTarget} />
            </div>
            <button className="btn btn-sm btn-success">Save</button>{" "}
            <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-outline-secondary">
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default CampaignCard
